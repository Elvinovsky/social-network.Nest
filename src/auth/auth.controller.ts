import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  Post,
} from '@nestjs/common';
import {
  RegistrationConfirmationCodeModel,
  RegistrationEmailResending,
  RegistrationInputModel,
} from './auth.models';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { UserCreateDTO } from '../users/user.models';

@Controller('/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('/registration')
  async registration(@Body() inputModel: RegistrationInputModel) {
    //ищем юзера в БД по эл/почте
    const foundUser: UserCreateDTO | null =
      await this.usersService.findUserByEmail(inputModel.email);
    // если находим возвращаем в ответе ошибку.
    if (foundUser) {
      throw new BadRequestException([
        {
          field: 'email',
          message: 'email invalid',
        },
      ]);
    }

    //регистрируем юзера отправляем код по эл/почте
    const isRegistered = this.authService.userRegistration(inputModel);
    if (!isRegistered) {
      throw new InternalServerErrorException();
    }
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('/registration-confirmation')
  async registrationConfirm(
    @Body() codeModel: RegistrationConfirmationCodeModel,
  ) {
    //ищем юзера в БД по коду подтверждения
    const foundUser = await this.usersService.findUserByConfirmCode(
      codeModel.code,
    );

    //если юзер не найден или код подтвержен  возвращаем 400 ошибку.
    if (!foundUser || foundUser.emailConfirmation.isConfirmed) {
      throw new BadRequestException();
    }

    //подтвержаем эл/почту юзера.
    await this.authService.confirmationCode(codeModel.code);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('/registration-email-resending')
  async emailResending(@Body() emailModel: RegistrationEmailResending) {
    // ищем юзера в БД по эл/почте.
    const foundUser: UserCreateDTO | null =
      await this.usersService.findUserByEmail(emailModel.email);

    // если юзер не найден или его почта уже подтвержена выдаем ошибку 400 ошибку
    if (!foundUser || foundUser.emailConfirmation.isConfirmed) {
      throw new BadRequestException();
    }

    //обновляем код и отправляем по электронной почте
    const isSendCode = await this.authService.sendUpdateConfirmCodeByEmail(
      emailModel.email,
    );

    //если код не отправился выдаем 500 ошибку
    if (!isSendCode) throw new InternalServerErrorException();
  }

  //   async login() {
  //     const user = await this.authService.checkCredentials(req.body.loginOrEmail,
  //       req.body.password)
  //     if (!user) return res.sendStatus(401)
  //
  //     const deviceId = uuidv4()
  //     const accessToken = await this.jwtService.createJWTAccessToken(user._id)
  //     const refreshToken = await this.jwtService.createJWTRefreshToken(user._id,
  //       deviceId)
  //
  //     const ipAddress = requestIp.getClientIp(req)
  //     const deviceName = req.headers["user-agent"]
  //     const issuedAt = await this.jwtService.getIATByRefreshToken(refreshToken)
  //     await this.devicesService.createDeviceSession(user._id,
  //       deviceId,
  //       issuedAt!,
  //       ipAddress,
  //       deviceName,)
  //
  //     return res
  //       .status(200)
  //       .cookie('refreshToken',
  //         refreshToken,
  //         refreshCookieOptions)
  //       .send(accessToken)
  //   }
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
