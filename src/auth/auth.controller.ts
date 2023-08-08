import {
  BadRequestException,
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  Post,
  PreconditionFailedException,
  Request,
  Response,
  UseGuards,
} from '@nestjs/common';
import {
  RegistrationConfirmationCodeModel,
  RegistrationEmailResending,
  RegistrationInputModel,
} from './auth.models';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { UserCreateDTO } from '../users/user.models';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { CurrentUserId } from './decorators/current-user-id.decorator';
import { ThrottlerBehindProxyGuard } from './guards/throttler-behind-proxy';
import { refreshCookieOptions } from '../common/helpers';
import { ResultsAuthForErrors } from './auth.constants';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
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
  async emailResending(@Body() emailModel: RegistrationEmailResending) {
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
    @Headers() headers,
    @Request() req,
    @Response() res,
  ) {
    const ipAddress = req.ip;
    const deviceName = headers['user-agent'];
    const tokens = await this.authService.login(userId, deviceName, ipAddress);

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
  //
  //   async createRefToken ( req: Request, res: Response ) {
  //     const accessToken = await this.jwtService.createJWTAccessToken(req.userId)
  //     const newRefreshToken = await this.jwtService.createJWTRefreshToken(req.userId,
  //       req.deviceId)
  //
  //     const newIssuedAt = await this.jwtService.getIATByRefreshToken(newRefreshToken)
  //     await this.devicesService.updateIATByDeviceSession(newIssuedAt!,
  //       req.issuedAt)
  //
  //     return res.status(200)
  //               .cookie('refreshToken',
  //                 newRefreshToken,
  //                 refreshCookieOptions)
  //               .send(accessToken)
  //   }
  //
  //   async logout ( req: Request, res: Response ) {
  //     await this.devicesSessionsRepository.deleteDeviceSessionByIAT(req.issuedAt)
  //     return res.clearCookie('refreshToken')
  //               .sendStatus(204)
  //   }
  //
  //
  //   async passwordRecovery ( req: RequestInputBody<PasswordRecoveryInputModel>, res: Response ) {
  //     const isSentCode = await this.authService.sendPasswordRecovery(req.body.email)
  //     if (isSentCode) {
  //       res.sendStatus(204)
  //       return
  //     }
  //     res.sendStatus(400)
  //     return
  //   }
  //
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
