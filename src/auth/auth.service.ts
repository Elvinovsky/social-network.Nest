import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { add } from 'date-fns';
import { UsersService } from '../users/users.service';
import bcrypt from 'bcrypt';
import { RegistrationInputModel } from './auth.models';
import { UserViewDTO } from '../users/user.models';
@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}
  async userRegistration(
    inputModel: RegistrationInputModel,
  ): Promise<UserViewDTO | null> {
    const hash = await this._generateHash(inputModel.password);
    const newUser = await this.usersService.createUserRegistration(
      inputModel,
      hash,
    );
    try {
      await emailsManager.sendEmailConformationMessage(
        email,
        newUser.emailConfirmation.confirmationCode,
      );
    } catch (error) {
      console.error(error);
      await usersRepository.userByIdDelete(result.id);
      return null;
    }
    return newUser;
  }
  async passwordRecovery(
    password: string,
    code: string,
  ): Promise<boolean | null> {
    const isConfirmed = await this.confirmCode(code);
    const isOneUser = await usersRepository.getUsersByConfirmationCode(code);
    if (!isConfirmed && isOneUser) {
      return null;
    }

    const hash = await this._generateHash(password);
    const isRestored = await usersRepository.updatePasswordHash(hash, code);
    return isRestored;
  }
  async confirmCode(code: string): Promise<boolean> {
    return await usersRepository.updateConfirmCode(code);
  }
  async confirmEmail(email: string): Promise<boolean> {
    const newCode = uuidv4();
    const codeReplacement = await usersRepository.updateConfirmationCodeByEmail(
      email,
      newCode,
    );

    if (!codeReplacement) {
      return false;
    }

    try {
      await this.emailsManager.sendEmailConformationMessage(email, newCode);
    } catch (error) {
      const user = await usersRepository.findByLoginOrEmail(email);
      await usersRepository.userByIdDelete(user!._id.toString()); // емайл не подтвержден! user валидириуется в верхних слоях экспресс валидатора
      console.error(error);
      return false;
    }
    return true;
  }
  async sendPasswordRecovery(email: string): Promise<boolean> {
    const newCode = uuidv4();
    const codeReplacement = await usersRepository.updateConfirmationCodeByEmail(
      email,
      newCode,
    );

    if (!codeReplacement) {
      return false;
    }

    try {
      await this.emailsManager.sendEmailPasswordRecovery(email, newCode);
    } catch (error) {
      const user = await usersRepository.findByLoginOrEmail(email);
      await usersRepository.userByIdDelete(user!._id.toString()); // емайл подтвержден! user валидириуется при запросе на эндпоинт экспресс валидатором
      console.error(error);
      return false;
    }

    return true;
  }
  async checkCredentials(
    loginOrEmail: string,
    password: string,
  ): Promise<WithId<UserDBType> | null> {
    const user = await usersRepository.findByLoginOrEmail(loginOrEmail);
    if (!user || !user.emailConfirmation.isConfirmed) {
      return null;
    }

    const isHashesEquals = await this._isPasswordCorrect(
      password,
      user.passwordHash,
    );
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
}
