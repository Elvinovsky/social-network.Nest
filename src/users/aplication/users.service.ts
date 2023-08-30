import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../infrastructure/users.repository';
import {
  BanUserInputModel,
  UserCreateDTO,
  UserInputModel,
  UserViewDTO,
} from '../user.models';
import bcrypt from 'bcrypt';
import { RegistrationInputModel } from '../../auth/auth.models';
import { ResultsAuthForErrors } from '../../auth/auth.constants';
import { User } from '../users.schema';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}
  async getUser(userId: string): Promise<UserViewDTO | null> {
    return this.usersRepository.getUser(userId);
  }

  async createUserForSA(
    inputModel: UserInputModel,
    hash: string,
  ): Promise<UserViewDTO> {
    const newUser: UserCreateDTO = User.Create(inputModel, hash);

    return await this.usersRepository.createUser(newUser);
  }

  async createUserRegistration(
    inputModel: UserInputModel,
    hash: string,
    code: string,
    expirationDate: Date,
  ) {
    //собираем ДТО юзера для отправки в репозиторий.
    const newUser: UserCreateDTO = User.Create(
      inputModel,
      hash,
      code,
      expirationDate,
    );

    //отправляем ДТО в репозиторий
    return this.usersRepository.createUser(newUser);
  }

  async updateUser(userId: string, inputModel: UserInputModel) {
    return this.usersRepository.updateUser(userId, inputModel);
  }
  async deleteUserById(id: string): Promise<Document | null> {
    return this.usersRepository.deleteUserById(id);
  }
  async deleteUserByEmail(email: string): Promise<boolean> {
    return this.usersRepository.deleteUserByEmail(email);
  }
  async _generateHash(password: string): Promise<string> {
    return await bcrypt.hash(password, 7);
  }

  async _isUserExists(
    inputModel: RegistrationInputModel,
  ): Promise<true | ResultsAuthForErrors> {
    const userEmail = await this.usersRepository.findUserByEmail(
      inputModel.email,
    );
    if (userEmail) {
      return ResultsAuthForErrors.email;
    }

    const userLogin = await this.usersRepository.findUserByLogin(
      inputModel.login,
    );
    if (userLogin) {
      return ResultsAuthForErrors.login;
    }

    return true;
  }
  async findUserByEmail(email: string) {
    return this.usersRepository.findUserByEmail(email);
  }
  async findUserByLogin(email: string) {
    return this.usersRepository.findUserByLogin(email);
  }
  async findUserByConfirmCode(code: string) {
    return this.usersRepository.findUserByCode(code);
  }

  async findByLoginOrEmail(loginOrEmail: string) {
    return this.usersRepository.findUserLoginOrEmail(loginOrEmail);
  }
  async confirmationEmail(code: string) {
    return this.usersRepository.confirmEmail(code);
  }
  async updateConfirmationCodeByEmail(email: string, newCode: string) {
    return this.usersRepository.updateConfirmationCodeByEmail(email, newCode);
  }
  async updatePasswordHash(hash: string, code: string) {
    return this.usersRepository.updatePasswordForUser(hash, code);
  }

  async banUser(userId: string, inputModel: BanUserInputModel) {
    const badBoy = await this.usersRepository.getUser(userId);

    if (!badBoy) {
      return null;
    }
    if (badBoy.banInfo.isBanned === inputModel.isBanned) {
      return false;
    }

    return this.usersRepository.updateBanStatus(userId, inputModel);
  }
}
