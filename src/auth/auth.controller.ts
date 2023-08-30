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
  Req,
  Request,
  Res,
  Response,
  UseGuards,
} from '@nestjs/common';
import {
  EmailInputModel,
  NewPasswordRecoveryInputModel,
  RegistrationConfirmationCodeModel,
  RegistrationInputModel,
} from './auth.models';
import { AuthService } from './application/auth.service';
import { UsersService } from '../users/aplication/users.service';
import {
  UserCreateDTO,
  UserInfo,
  UserInputModel,
  UserViewDTO,
} from '../users/user.models';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { CurrentUserIdLocal } from './decorators/current-user-id-local.decorator';
import { refreshCookieOptions } from '../common/helpers';
import { ResultsAuthForErrors } from './auth.constants';
import { DevicesService } from '../devices/devices.service';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { UsersQueryRepository } from '../users/infrastructure/users.query.repo';
import { JwtBearerGuard } from './guards/jwt-bearer-auth.guard';
import { WsThrottlerGuard } from './guards/throttler-behind-proxy';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { UserRegistrationCommand } from './application/use-cases/user-registration-use-case.';
import { CommandBus } from '@nestjs/cqrs';
import { CurrentUserIdFromBearerJWT } from './decorators/current-userId-jwt';
import requestIp from 'request-ip';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly devicesService: DevicesService,
    private readonly usersQueryRepository: UsersQueryRepository,
    private commandBus: CommandBus,
  ) {}

  @Post('registration')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(ThrottlerGuard)
  @Throttle(5, 10)
  async registration(@Body() inputModel: RegistrationInputModel) {
    //ищем юзера в БД по эл/почте
    const isUserExists: true | ResultsAuthForErrors =
      await this.usersService._isUserExists(inputModel);

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
  @UseGuards(WsThrottlerGuard)
  async registrationConfirm(
    @Body() codeModel: RegistrationConfirmationCodeModel,
  ) {
    //ищем юзера в БД по коду подтверждения
    const foundUser = await this.usersService.findUserByConfirmCode(
      codeModel.code,
    );

    //если юзер не найден или код подтвержен  возвращаем 400 ошибку.
    if (!foundUser || foundUser.emailConfirmation.isConfirmed) {
      throw new BadRequestException([
        {
          field: 'code',
          message: 'user not found or code already confirmed',
        },
      ]);
    }

    //подтвержаем эл/почту юзера.
    await this.authService.confirmationEmail(codeModel.code);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('registration-email-resending')
  @UseGuards(ThrottlerGuard)
  @Throttle(5, 10)
  async emailResending(@Body() emailModel: EmailInputModel) {
    // ищем юзера в БД по эл/почте.
    const foundUser: UserCreateDTO | null =
      await this.usersService.findUserByEmail(emailModel.email);

    // если юзер не найден или его почта уже подтвержена выдаем ошибку 400 ошибку
    if (!foundUser || foundUser.emailConfirmation.isConfirmed) {
      throw new BadRequestException([
        {
          field: 'email',
          message: 'invalid email',
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
  @UseGuards(LocalAuthGuard)
  @UseGuards(WsThrottlerGuard)
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
  async createRefToken(@Req() req, @Response() res) {
    // Создание нового access token и refreshToken.
    const newAccessToken = await this.authService.createJWTAccessToken(
      req.userInfo,
      req.deviceId,
    );
    const newRefreshToken = await this.authService.createJWTRefreshToken(
      req.userInfo,
      req.deviceId,
    );

    // Получение нового времени создания токена.
    const newIssuedAt = await this.authService.getIATByRefreshToken(
      newRefreshToken,
    );

    // Обновление времени создания в сессии устройства.
    await this.devicesService.updateIATByDeviceSession(
      newIssuedAt,
      req.issuedAt,
    );

    // Отправка нового refreshToken в куках и access token в ответе.
    return res
      .status(200)
      .cookie('refreshToken', newRefreshToken, refreshCookieOptions)
      .send(newAccessToken);
  }

  @Post('logout')
  @UseGuards(JwtRefreshGuard)
  async logout(@Req() req, @Res() res) {
    // Удаление записи о сессии устройства.
    await this.devicesService.logoutByIAT(req.issuedAt);

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
  //@UseGuards(WsThrottlerGuard)
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
    @CurrentUserIdFromBearerJWT()
    sessionInfo: {
      userId: string;
      deviceId: string;
    },
  ) {
    // Получение информации о текущем пользователе.
    const user = await this.usersQueryRepository.getUserInfo(
      sessionInfo.userId,
    );
    if (user) {
      return user; // Отправка информации о пользователе.
    }
    throw new InternalServerErrorException(); // Ошибка: что то пошло не так.
  }

  @Put('email-or-login-recovery')
  @UseGuards(JwtRefreshGuard)
  async updateUser(@Req() req, @Body() inputModel: UserInputModel) {
    //ищем юзера в БД по эл/почте
    const isUserExists: true | ResultsAuthForErrors =
      await this.usersService._isUserExists(inputModel);

    // если находим возвращаем в ответе ошибку.
    if (isUserExists === ResultsAuthForErrors.email) {
      throw new BadRequestException([
        {
          field: 'email',
          message: 'email already exists',
        },
      ]);
    }

    // если находим возвращаем в ответе ошибку.
    if (isUserExists === ResultsAuthForErrors.login) {
      throw new BadRequestException([
        {
          field: 'login',
          message: 'login already exists',
        },
      ]);
    }
    return this.usersService.updateUser(req.userId, inputModel);
  }
}
