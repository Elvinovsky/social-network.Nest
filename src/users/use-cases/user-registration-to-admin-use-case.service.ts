import { Injectable } from '@nestjs/common';
import { UsersService } from '../users.service';
import { UserInputModel, UserViewDTO } from '../user.models';
import bcrypt from 'bcrypt';

@Injectable()
export class UserRegistrationToAdminUseCase {
  constructor(private readonly usersService: UsersService) {}

  async execute(inputModel: UserInputModel) {
    //создаем хэш пароля.
    const hash: string = await this._generateHash(inputModel.password);

    //отправляем сгенерированные данные для создания нового юзера в сервис.
    const newUser: UserViewDTO = await this.usersService.createUserForSA(
      inputModel,
      hash,
    );
    return newUser;
  }

  async _generateHash(password: string): Promise<string> {
    return await bcrypt.hash(password, 7);
  }
}
