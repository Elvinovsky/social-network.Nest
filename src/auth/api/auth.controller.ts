import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  Post,
  PreconditionFailedException,
  Put,
  Request,
  Res,
  Response,
  UseGuards,
} from '@nestjs/common';
import {
  EmailInputModel,
  LoginUpdateInputModel,
  NewPasswordRecoveryInputModel,
  RegistrationConfirmationCodeModel,
  RegistrationInputModel,
} from '../dto/auth-input.models';
import { AuthService } from '../application/auth.service';
import { UsersService } from '../../users/application/users.service';
import { UserInfo, UserViewDTO } from '../../users/dto/view/user-view.models';
import { LocalAuthGuard } from '../infrastructure/guards/local-auth.guard';
import { CurrentUserIdLocal } from '../infrastructure/decorators/current-user-id-local.decorator';
import { refreshCookieOptions } from '../../infrastructure/common/helpers';
import { ResultsAuthForErrors } from '../infrastructure/config/auth-exceptions.constants';
import { DevicesService } from '../../devices/application/devices.service';
import { JwtRefreshGuard } from '../infrastructure/guards/jwt-refresh.guard';
import { UsersMongooseQueryRepository } from '../../users/infrastructure/repositories/mongo/users-mongoose.query.repo';
import { JwtBearerGuard } from '../infrastructure/guards/jwt-bearer-auth.guard';
//import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { UserRegistrationCommand } from '../application/use-cases/user-registration-use-case.';
import { CommandBus } from '@nestjs/cqrs';
import requestIp from 'request-ip';
import { CurrentSessionInfoFromRefreshJWT } from '../infrastructure/decorators/current-session-info-from-cookie-jwt';
import { CurrentSessionInfoFromAccessJWT } from '../infrastructure/decorators/current-session-info-jwt';
import { UserCreateDTO } from '../../users/dto/create/users-create.models';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly devicesService: DevicesService,
    private readonly usersQueryRepository: UsersMongooseQueryRepository,
    private commandBus: CommandBus,
  ) {}

  @Post('registration')
  @HttpCode(HttpStatus.NO_CONTENT)
  // @UseGuards(ThrottlerGuard)
  // @Throttle(5, 10)
  async registration(@Body() inputModel: RegistrationInputModel) {
    //ищем юзера в БД по эл/почте
    const isUserExists: true | ResultsAuthForErrors =
      await this.usersService._isUserAlreadyExists(inputModel);

    // если находим совпадения по емайлу возвращаем в ответе ошибку.
    if (isUserExists === ResultsAuthForErrors.email) {
      throw new BadRequestException([
        {
          field: 'email',
          message: 'email already exists',
        },
      ]);
    }

    // если находим совпадения по логину возвращаем в ответе ошибку.
    if (isUserExists === ResultsAuthForErrors.login) {
      throw new BadRequestException([
        {
          field: 'login',
          message: 'login already exists',
        },
      ]);
    }

    //регистрируем юзера отправляем код по эл/почте
    const isRegistered = await this.commandBus.execute(
      new UserRegistrationCommand(inputModel),
    );
    if (!isRegistered) {
      throw new InternalServerErrorException();
    }
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('registration-confirmation')
  // @UseGuards(ThrottlerGuard)
  // @Throttle(5, 10)
  async registrationConfirm(
    @Body() codeModel: RegistrationConfirmationCodeModel,
  ) {
    // ищем юзера в БД по коду подтверждения
    const foundUser = await this.usersService.findUserByConfirmCode(
      codeModel.code,
    );

    if (!foundUser) {
      throw new BadRequestException({
        field: 'code',
        message: 'code not exists',
      });
    }

    //если код подтверждения протух 400 ошибку.
    if (foundUser.emailConfirmation.expirationDate! < new Date()) {
      throw new BadRequestException([
        {
          field: 'code',
          message: 'code has expired',
        },
      ]);
    }
    //подтвержаем эл/почту юзера.
    await this.authService.confirmationEmail(codeModel.code);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('registration-email-resending')
  // @UseGuards(ThrottlerGuard)
  // @Throttle(5, 10)
  async emailResending(@Body() emailModel: EmailInputModel) {
    // ищем юзера в БД по эл/почте.
    const foundUser: UserCreateDTO | null =
      await this.usersService.findUserByEmail(emailModel.email);

    if (foundUser === null) {
      throw new BadRequestException([
        {
          field: 'email',
          message: 'email not exists',
        },
      ]);
    }

    // если почта уже подтвержена выдаем ошибку 400 ошибку
    if (foundUser.emailConfirmation.isConfirmed) {
      throw new BadRequestException([
        {
          field: 'email',
          message: 'email already confirmed',
        },
      ]);
    }

    //обновляем код и отправляем по электронной почте
    const isSendCode = await this.authService.sendUpdateConfirmCodeByEmail(
      emailModel.email,
    );

    //если код не отправился выдаем 500 ошибку
    if (!isSendCode) throw new PreconditionFailedException();
  }

  @Post('login')
  // @Throttle(5, 10)
  @UseGuards(/*ThrottlerGuard,*/ LocalAuthGuard)
  async login(
    @CurrentUserIdLocal() user: UserViewDTO,
    @Headers('user-agent') userAgent: string,
    @Request() req,
    @Response() res,
  ) {
    const ipAddress = requestIp.getClientIp(req);
    const userInfo: UserInfo = {
      userId: user.id,
      userLogin: user.login,
    };

    const tokens = await this.authService.login(userInfo, userAgent, ipAddress);

    if (tokens === null) {
      throw new PreconditionFailedException();
    }

    res
      .status(200)
      .cookie(
        'refreshToken',
        tokens.createJWTRefreshToken,
        refreshCookieOptions,
      )
      .send(tokens.createJWTAccessToken);
  }

  @Post('refresh-token')
  @UseGuards(JwtRefreshGuard)
  async createRefToken(
    @CurrentSessionInfoFromRefreshJWT()
    sessionInfo: { userInfo: UserInfo; deviceId: string; issuedAt: number },
    @Response() res,
  ) {
    // Создание нового access token и refreshToken.
    const newAccessToken = await this.authService.createJWTAccessToken(
      sessionInfo.deviceId,
      sessionInfo.userInfo,
    );
    const newRefreshToken = await this.authService.createJWTRefreshToken(
      sessionInfo.userInfo,
      sessionInfo.deviceId,
    );

    // Получение нового времени создания токена.
    const newIssuedAt = await this.authService.getIATByRefreshToken(
      newRefreshToken,
    );

    // Обновление времени создания в сессии устройства.
    await this.devicesService.updateIATByDeviceSession(
      newIssuedAt,
      sessionInfo.issuedAt,
    );

    // Отправка нового refreshToken в куках и access token в ответе.
    return res
      .status(200)
      .cookie('refreshToken', newRefreshToken, refreshCookieOptions)
      .send(newAccessToken);
  }

  @Post('logout')
  @UseGuards(JwtRefreshGuard)
  async logout(
    @CurrentSessionInfoFromRefreshJWT()
    sessionInfo: { userInfo: UserInfo; deviceId: string; issuedAt: number },
    @Res() res,
  ) {
    // Удаление записи о сессии устройства.
    await this.devicesService.logoutByIAT(sessionInfo.issuedAt);

    // Удаление refreshToken из куков и отправка успешного статуса.
    return res.clearCookie('refreshToken').sendStatus(204);
  }

  @Post('password-recovery')
  @HttpCode(HttpStatus.NO_CONTENT)
  //@UseGuards(WsThrottlerGuard)
  async passwordRecovery(@Body() inputModel: EmailInputModel, @Res() res) {
    //валидация электронной почты
    const emailValidator = await this.usersService.findUserByEmail(
      inputModel.email,
    );

    // валидация не пройдена, возврат успешного ответа.
    if (!emailValidator || !emailValidator.emailConfirmation.isConfirmed) {
      res.send(204);
    }

    // Отправка кода восстановления пароля.
    const isSentCode = await this.authService.sendPasswordRecovery(
      inputModel.email,
    );

    return isSentCode;
  }

  @Post('new-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  async newPassword(
    @Body()
    inputModel: NewPasswordRecoveryInputModel,
  ) {
    // Установка нового пароля после восстановления.
    const recoveryPassword = await this.authService.passwordRecovery(
      inputModel,
    );
    return recoveryPassword;
  }

  @Get('me')
  @UseGuards(JwtBearerGuard)
  async getMe(
    @CurrentSessionInfoFromAccessJWT()
    sessionInfo: {
      userInfo: UserInfo;
      deviceId: string;
    },
  ) {
    // Получение информации о текущем пользователе.
    const user = await this.usersQueryRepository.getUserInfo(
      sessionInfo.userInfo.userId,
    );
    if (user) {
      return user; // Отправка информации о пользователе.
    }
    throw new InternalServerErrorException(); // Ошибка: что то пошло не так.
  }

  // todo send email confirm code
  @Put('email-recovery')
  @UseGuards(JwtBearerGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateUser(
    @CurrentSessionInfoFromAccessJWT()
    sessionInfo: {
      userInfo: UserInfo;
      deviceId: string;
    },
    @Body() inputModel: EmailInputModel,
  ) {
    //ищем юзера в БД по эл/почте
    const isEmailFree = await this.usersService.findUserByEmail(
      inputModel.email,
    );

    // если находим возвращаем в ответе ошибку.
    if (isEmailFree) {
      throw new BadRequestException([
        {
          field: 'email',
          message: 'email already exists',
        },
      ]);
    }

    return this.usersService.changeEmailUser(
      sessionInfo.userInfo.userId,
      inputModel.email,
    );
  }

  @Put('login-recovery')
  @UseGuards(JwtBearerGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateLogin(
    @CurrentSessionInfoFromAccessJWT()
    sessionInfo: {
      userInfo: UserInfo;
      deviceId: string;
    },
    @Body() inputModel: LoginUpdateInputModel,
  ) {
    //ищем юзера в БД по эл/почте
    const isLoginFree = await this.usersService.findUserByLogin(
      inputModel.login,
    );

    // если находим возвращаем в ответе ошибку.
    if (isLoginFree) {
      throw new BadRequestException([
        {
          field: 'login',
          message: 'login already exists',
        },
      ]);
    }
    return this.usersService.changeLoginUser(
      sessionInfo.userInfo.userId,
      inputModel.login,
    );
  }
}
