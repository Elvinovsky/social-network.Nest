import { Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(protected usersRepository: UsersRepository) {}
  getUsers(query: { term: string }) {
    return this.usersRepository.getUsers(query);
  }
  getUser(userId: string) {
    return this.usersRepository.getUser(userId);
  }
  updateUser(id: number, inputModel) {
    return this.usersRepository.updateUser(id, inputModel);
  }
}
