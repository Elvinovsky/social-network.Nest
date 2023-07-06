import { Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { CreateUserInputType } from './users.controller';
import { UserDocument } from './users.schema';

@Injectable()
export class UsersService {
  constructor(protected usersRepository: UsersRepository) {}
  async getUsers(query: { term: string }) {
    return this.usersRepository.getUsers(query);
  }
  async getUser(userId: string): Promise<UserDocument> {
    return this.usersRepository.getUser(userId);
  }
  async createUser(inputModel: CreateUserInputType) {
    return this.usersRepository.createUser(inputModel);
  }
  async updateUser(user) {
    return this.usersRepository.updateUser(user);
  }
}
