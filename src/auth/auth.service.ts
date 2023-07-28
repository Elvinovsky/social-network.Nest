import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { add } from 'date-fns';
import { UsersService } from '../users/users.service';
import bcrypt from 'bcrypt';
import { RegistrationInputModel } from './auth.models';
import { UserViewDTO } from '../users/user.models';
import { EmailService } from '../email/email.service';
import { AuthRepository } from './auth.repository';
import { JwtService } from '@nestjs/jwt';
import { userMapping } from '../users/user.helpers';
@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly usersService: UsersService,
    private readonly emailService: EmailService,
    private readonly jwtService: JwtService,
  ) {}
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
  async confirmationCode(code: string) {
    return this.authRepository.confirmEmail(code);
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
    await this.authRepository.updateConfirmationCodeByEmail(email, newCode);

    //отправляем код подтвержнеия на элеткронную почту.
    const emailResending = await this.emailService.sendEmailConformationMessage(
      email,
      newCode,
    );

    // если код не отправился удаляем юзера из БД, возвращаем false.
    if (!emailResending) {
      await this.usersService.deleteUserByEmail(email);
      return false;
    }
    return true;
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
    //ищем юзера в БД по логинуу или эл/почте
    const user = await this.usersService.findByLoginOrEmail(loginOrEmail);

    //если ненаходим или почта не подтверждена возвращаем null.
    if (!user || !user.emailConfirmation.isConfirmed) {
      return null;
    }

    // сравниваем поступивщий пароль и пароль  из БД
    const isHashesEquals = await this._isPasswordCorrect(
      password,
      user.passwordHash,
    );

    // если сверка прошла успешнв возвращаем UserDocument в ином случае null.
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
  async login(userId: string) {
    const deviceId = uuidv4();

    const createJWTAccessToken = this.jwtService.sign({
      userId: userId,
      deviceId: deviceId,
    });

    const createJWTRefreshToken = this.jwtService.sign({
      userId: userId,
      deviceId: deviceId,
    });
    return { createJWTAccessToken, createJWTRefreshToken };
  }
}
