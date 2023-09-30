import { Injectable, PreconditionFailedException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { UsersService } from '../../users/application/users.service';
import bcrypt from 'bcrypt';
import { NewPasswordRecoveryInputModel } from '../dto/auth.models';
import { UserInfo } from '../../users/dto/view/user-view.models';
import { EmailSenderService } from '../../infrastructure/adapters/email/email.service';
import { JwtService } from '@nestjs/jwt';
import { DevicesService } from '../../devices/application/devices.service';
import { ConfigService } from '@nestjs/config';
import { ConfigType } from '../../infrastructure/configuration/getConfiguration';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly emailService: EmailSenderService,
    private readonly jwtService: JwtService,
    private readonly devicesService: DevicesService,
    private configService: ConfigService<ConfigType>,
  ) {}

  async confirmationEmail(code: string) {
    return this.usersService.confirmationEmail(code);
  }
  async passwordRecovery(
    inputModel: NewPasswordRecoveryInputModel,
  ): Promise<boolean | null> {
    const user = await this.usersService.findUserByConfirmCode(
      inputModel.recoveryCode,
    );
    if (!user?.emailConfirmation.isConfirmed) {
      return null;
    }

    const hash = await this._generateHash(inputModel.newPassword);
    const isRestored = await this.usersService.updatePasswordHash(
      hash,
      inputModel.recoveryCode,
    );
    return isRestored;
  }
  async sendUpdateConfirmCodeByEmail(email: string): Promise<boolean> {
    //обновляем код подтверждения юзера в БД.
    const newCode = uuidv4();
    await this.usersService.updateConfirmationCodeByEmail(email, newCode);

    //отправляем код подтвержнеия на элеткронную почту.
    const emailResending = await this.emailService.sendEmailConformationMessage(
      email,
      newCode,
    );

    // если код не отправился удаляем юзера из БД, возвращаем false.
    if (emailResending) {
      return true;
    }

    await this.usersService.deleteUserById(email);
    return false;
  }
  async sendPasswordRecovery(email: string): Promise<boolean> {
    const newCode = uuidv4();
    const codeReplacement =
      await this.usersService.updateConfirmationCodeByEmail(email, newCode);

    if (!codeReplacement) {
      return false;
    }

    try {
      await this.emailService.sendEmailPasswordRecovery(email, newCode);
    } catch (error) {
      const user = await this.usersService.findByLoginOrEmail(email);
      if (user) {
        await this.usersService.deleteUserById(user.id); // емайл подтвержден! user валидириуется при запросе на эндпоинт экспресс валидатором
      }
      console.error(error);
      return false;
    }

    return true;
  }
  async checkCredentials(loginOrEmail: string, password: string) {
    //ищем юзера в БД по логину или эл/почте
    const user = await this.usersService.findByLoginOrEmail(loginOrEmail);

    //если ненаходим или почта не подтверждена возвращаем null.
    if (!user || !user.emailConfirmation.isConfirmed) {
      return null;
    }

    // сравниваем поступивщий пароль и пароль  из БД
    const isHashesEquals: boolean = await this._isPasswordCorrect(
      password,
      user.passwordHash,
    );

    // если сверка прошла успешна возвращаем SAUserViewDto в ином случае null.
    if (isHashesEquals) {
      return user;
    } else {
      return null;
    }
  }
  async _generateHash(password: string): Promise<string> {
    return await bcrypt.hash(password, 7);
  }
  async _isPasswordCorrect(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }
  async login(userInfo: UserInfo, deviceName: string, ip: string) {
    try {
      const deviceId = uuidv4();

      const createJWTAccessToken = await this.createJWTAccessToken(
        deviceId,
        userInfo,
      );
      const createJWTRefreshToken = await this.createJWTRefreshToken(
        userInfo,
        deviceId,
      );

      const issuedAt = await this.getIATByRefreshToken(createJWTRefreshToken);
      if (!issuedAt) {
        return null;
      }

      await this.devicesService.createDeviceSession(
        userInfo,
        deviceId,
        issuedAt,
        ip,
        deviceName,
      );

      return { createJWTAccessToken, createJWTRefreshToken };
    } catch (e) {
      console.log(e);
      return null;
    }
  }
  async createJWTAccessToken(deviceId: string, userInfo: UserInfo) {
    const updateIssuedAt = new Date().getTime();

    const accessToken = this.jwtService.sign(
      {
        userInfo: userInfo,
        issuedAt: updateIssuedAt,
        deviceId: deviceId,
      },
      {
        expiresIn: this.configService.get('auth.ACCESS_TOKEN_EXPIRATION_TIME', {
          infer: true,
        }),
        secret: this.configService.get('auth.SECRET_ACCESS_KEY', {
          infer: true,
        }),
      },
    );
    return {
      accessToken: accessToken,
    };
  }

  async createJWTRefreshToken(
    userInfo: UserInfo,
    deviceId: string,
  ): Promise<string> {
    const updateIssuedAt = new Date().getTime();

    return this.jwtService.sign(
      {
        userInfo: userInfo,
        deviceId: deviceId,
        issuedAt: updateIssuedAt,
      },
      {
        expiresIn: this.configService.get(
          'auth.REFRESH_TOKEN_EXPIRATION_TIME',
          { infer: true },
        ),
        secret: this.configService.get('auth.SECRET_REFRESH_KEY', {
          infer: true,
        }),
      },
    );
  }

  async getIATByRefreshToken(token: string): Promise<number> {
    try {
      const decoded = this.jwtService.decode(token, {
        complete: true,
      }) as { payload: { issuedAt: number } };
      return decoded.payload.issuedAt;
    } catch (error) {
      console.log('error getIATByRefreshToken', error);
      throw new PreconditionFailedException();
    }
  }

  async findUserByConfirmCode(code: string) {
    return this.usersService.findUserByConfirmCode(code);
  }
}
