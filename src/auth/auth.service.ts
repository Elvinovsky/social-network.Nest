import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { add } from 'date-fns';
import { UsersService } from '../users/users.service';
import bcrypt from 'bcrypt';
import { RegistrationInputModel } from './auth.models';
import { UserInputModel, UserViewDTO } from '../users/user.models';
import { EmailService } from '../email/email.service';
import { JwtService } from '@nestjs/jwt';
import { userMapping } from '../users/user.helpers';
import { jwtConstants } from './auth.constants';
import { DevicesService } from '../devices/devices.service';
@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly emailService: EmailService,
    private readonly jwtService: JwtService,
    private readonly devicesService: DevicesService,
  ) {}
  async userRegistrationSA(inputModel: UserInputModel) {
    //создаем хэш пароля.
    const hash: string = await this._generateHash(inputModel.password);
    const newUser: UserViewDTO = await this.usersService.createUserForSA(
      inputModel,
      hash,
    );
    return newUser;
  }
  async userRegistration(inputModel: RegistrationInputModel): Promise<boolean> {
    //создаем хэш пароля, код подтверждения, задаем дату протухания коду
    const hash: string = await this._generateHash(inputModel.password);
    const code: string = uuidv4();
    const expirationDate: Date = add(new Date(), {
      hours: 1,
      minutes: 10,
    });

    //отправляем сгенерированные данные для создания нового юзера в сервис.
    const newUser: UserViewDTO = await this.usersService.createUserRegistration(
      inputModel,
      hash,
      code,
      expirationDate,
    );

    const send = await this.emailService.sendEmailConformationMessage(
      newUser.email,
      code,
    );
    if (send) {
      return true;
    }

    await this.usersService.deleteUserById(newUser.id);
    return false;
  }
  async confirmationEmail(code: string) {
    return this.usersService.confirmationEmail(code);
  }
  // async passwordRecovery(
  //   password: string,
  //   code: string,
  // ): Promise<boolean | null> {
  //   const isConfirmed = await this.confirmCode(code);
  //   const isOneUser = await usersRepository.getUsersByConfirmationCode(code);
  //   if (!isConfirmed && isOneUser) {
  //     return null;
  //   }
  //
  //   const hash = await this._generateHash(password);
  //   const isRestored = await usersRepository.updatePasswordHash(hash, code);
  //   return isRestored;
  // }
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
  // async sendPasswordRecovery(email: string): Promise<boolean> {
  //   const newCode = uuidv4();
  //   const codeReplacement = await usersRepository.updateConfirmationCodeByEmail(
  //     email,
  //     newCode,
  //   );
  //
  //   if (!codeReplacement) {
  //     return false;
  //   }
  //
  //   try {
  //     await this.emailsManager.sendEmailPasswordRecovery(email, newCode);
  //   } catch (error) {
  //     const user = await usersRepository.findByLoginOrEmail(email);
  //     await usersRepository.userByIdDelete(user!._id.toString()); // емайл подтвержден! user валидириуется при запросе на эндпоинт экспресс валидатором
  //     console.error(error);
  //     return false;
  //   }
  //
  //   return true;
  // }
  async checkCredentials(
    loginOrEmail: string,
    password: string,
  ): Promise<UserViewDTO | null> {
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

    // если сверка прошла успешна возвращаем UserViewDto в ином случае null.
    if (isHashesEquals) {
      return userMapping(user);
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
  async login(userId: string, deviceName: string, ip: string) {
    try {
      if (!userId) {
        return null;
      }

      const deviceId = uuidv4();
      const createJWTAccessToken = await this.createJWTAccessToken(userId);
      const createJWTRefreshToken = await this.createJWTRefreshToken(
        userId,
        deviceId,
      );

      const issuedAt = await this.getIATByRefreshToken(createJWTRefreshToken);
      if (!issuedAt) {
        return null;
      }

      await this.devicesService.createDeviceSession(
        userId,
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
  async createJWTAccessToken(userId: string) {
    const accessToken = this.jwtService.sign(
      {
        userId: userId,
      },
      {
        expiresIn: jwtConstants.accessTokenExpirationTime,
        secret: jwtConstants.secretAccess,
      },
    );
    return {
      accessToken: accessToken,
    };
  }

  async createJWTRefreshToken(
    userId: string,
    deviceId: string,
  ): Promise<string> {
    return this.jwtService.sign(
      {
        userId: userId,
        deviceId: deviceId,
      },
      {
        expiresIn: jwtConstants.refreshTokenExpirationTime,
        secret: jwtConstants.secretRefresh,
      },
    );
  }

  async getUserIdByAccessToken(token: string) {
    try {
      const payload = (await this.jwtService.verify(token, {
        secret: jwtConstants.secretAccess,
      })) as {
        userId: string;
      };
      return payload.userId;
    } catch (error) {
      console.log('error verify', error);
      return null;
    }
  }

  async getUserIdByRefreshToken(token: string) {
    try {
      const payload = (await this.jwtService.verify(token, {
        secret: jwtConstants.secretRefresh,
      })) as {
        userId: string;
      };
      return payload.userId;
    } catch (error) {
      return null;
    }
  }

  async getDeviceIdRefreshToken(token: string) {
    try {
      const payload = (await this.jwtService.verify(token, {
        secret: jwtConstants.secretRefresh,
      })) as {
        deviceId: string;
      };
      return payload.deviceId;
    } catch (error) {
      console.log('error verify', error);
      return null;
    }
  }

  async getIATByRefreshToken(
    token: string,
  ): Promise<number | undefined | null> {
    try {
      const decoded = this.jwtService.decode(token, {
        complete: true,
      }) as { payload: { iat: number } };
      return decoded.payload.iat;
    } catch (error) {
      console.log('error verify', error);
      return null;
    }
  }
}
