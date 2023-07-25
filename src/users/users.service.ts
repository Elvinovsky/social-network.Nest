import { Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { UserDocument } from './users.schema';
import { UserCreateDTO, UserInputModel, UserViewDTO } from './user.models';
import bcrypt from 'bcrypt';
@Injectable()
export class UsersService {
  constructor(protected usersRepository: UsersRepository) {}
  async getUser(userId: string): Promise<UserDocument | null> {
    return this.usersRepository.getUser(userId);
  }

  async createUserForSA(inputModel: UserInputModel): Promise<UserViewDTO> {
    const hash = await this._generateHash(inputModel.password); //todo logic registr => auth?
    const newUser: UserCreateDTO = {
      login: inputModel.login,
      passwordHash: hash,
      email: inputModel.email,
      addedAt: new Date().toISOString(),
      emailConfirmation: {
        confirmationCode: 'not required',
        expirationDate: 'not required',
        isConfirmed: true,
      },
    };

    return await this.usersRepository.createUser(newUser);
  }

  async createUserRegistration(
    inputModel: UserInputModel,
    hash: string,
    code: string,
    expirationDate: Date,
  ) {
    const newUser: UserCreateDTO = {
      login: inputModel.login,
      passwordHash: hash,
      email: inputModel.email,
      addedAt: new Date().toISOString(),
      emailConfirmation: {
        confirmationCode: code,
        expirationDate: expirationDate,
        isConfirmed: false,
      },
    };
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

  async findUserByEmail(email: string) {
    const user = await this.usersRepository.findUserByEmail(email);
    if (!user) {
      return null;
    }
    return user;
  }
}
