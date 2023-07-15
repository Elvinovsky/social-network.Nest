import { Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { UserDocument } from './users.schema';
import { UserInputModel, UserViewDTO } from './user.models';
import bcrypt from 'bcrypt';
@Injectable()
export class UsersService {
  constructor(protected usersRepository: UsersRepository) {}
  async getUser(userId: string): Promise<UserDocument | null> {
    return this.usersRepository.getUser(userId);
  }
  async createUser(inputModel: UserInputModel): Promise<UserViewDTO> {
    const hash = await this._generateHash(inputModel.password);

    return await this.usersRepository.createUser(inputModel, hash);
  }

  async updateUser(userId: string, inputModel: UserInputModel) {
    return this.usersRepository.updateUser(userId, inputModel);
  }
  async deleteUser(userId: string): Promise<Document | null> {
    return this.usersRepository.deleteUser(userId);
  }
  async _generateHash(password: string): Promise<string> {
    return await bcrypt.hash(password, 7);
  }
}
