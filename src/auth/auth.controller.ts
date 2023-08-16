import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Headers,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  Post,
  PreconditionFailedException,
  Req,
  Request,
  Res,
  Response,
  UseGuards,
} from '@nestjs/common';
import {
  EmailInputModel,
  RegistrationConfirmationCodeModel,
  RegistrationInputModel,
} from './auth.models';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { UserCreateDTO } from '../users/user.models';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { CurrentUserId } from './decorators/current-user-id.decorator';
import { refreshCookieOptions } from '../common/helpers';
import { ResultsAuthForErrors } from './auth.constants';
import { DevicesService } from '../devices/devices.service';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly devicesService: DevicesService,
  ) {}

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('registration')
  async registration(@Body() inputModel: RegistrationInputModel) {
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

    //регистрируем юзера отправляем код по эл/почте
    const isRegistered = await this.authService.userRegistration(inputModel);
    if (!isRegistered) {
      throw new InternalServerErrorException();
    }
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('registration-confirmation')
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
  async emailResending(@Body() emailModel: EmailInputModel) {
    // ищем юзера в БД по эл/почте.
    const foundUser: UserCreateDTO | null =
      await this.usersService.findUserByEmail(emailModel.email);

    // если юзер не найден или его почта уже подтвержена выдаем ошибку 400 ошибку
    if (!foundUser || foundUser.emailConfirmation.isConfirmed) {
      throw new BadRequestException([
        {
          field: 'email',
          message: 'email already exists',
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

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(
    @CurrentUserId() userId: string,
    @Headers('user-agent') userAgent: string,
    @Request() req,
    @Response() res,
  ) {
    const ipAddress = req.ip;
    const tokens = await this.authService.login(userId, userAgent, ipAddress);

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
    debugger;
    // Создание нового access token и refreshToken.
    const accessToken = await this.authService.createJWTAccessToken(req.userId);
    const newRefreshToken = await this.authService.createJWTRefreshToken(
      req.userId,
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
      .send(accessToken);
  }

  @Delete()
  @UseGuards(JwtRefreshGuard)
  async logout(@Req() req, @Res() res) {
    // Удаление записи о сессии устройства.
    await this.devicesService.logoutByIAT(req.issuedAt);

    // Удаление refreshToken из куков и отправка успешного статуса.
    return res.clearCookie('refreshToken').sendStatus(204);
  }

  @Post('password-recovery')
  @HttpCode(HttpStatus.NO_CONTENT)
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

  //   async newPassword ( req: RequestInputBody<NewPasswordRecoveryInputModel>, res: Response ) {
  //
  //     const recoveryPassword = await this.authService.passwordRecovery(req.body.newPassword,
  //       req.body.recoveryCode)
  //     if (recoveryPassword === null) {
  //       res.sendStatus(403)
  //       return
  //     }
  //     if (recoveryPassword) {
  //       res.sendStatus(204)
  //       return
  //     }
  //     res.sendStatus(400)
  //   }
  //
  //   async getMe ( req: Request, res: Response ) {
  //     const user = await usersQueryRepository.getUserInfo(req.user!.id)
  //     if (user) {
  //       res.send(user)
  //       return
  //     }
  //   }
  // }
}
