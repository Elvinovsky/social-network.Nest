import { UsersService } from '../users.service';
import { UserViewDTO } from '../../dto/view/user-view.models';
import bcrypt from 'bcrypt';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserInputModel } from '../../dto/input/user-input.models';

export class UserRegistrationToAdminCommand {
  constructor(public inputModel: UserInputModel) {}
}

@CommandHandler(UserRegistrationToAdminCommand)
export class UserRegistrationToAdminUseCase
  implements ICommandHandler<UserRegistrationToAdminCommand>
{
  constructor(protected usersService: UsersService) {}

  async execute(command: UserRegistrationToAdminCommand) {
    //создаем хэш пароля.
    const hash: string = await this._generateHash(command.inputModel.password);

    //отправляем сгенерированные данные для создания нового юзера в сервис.
    const newUser: UserViewDTO = await this.usersService.createUserForSA(
      command.inputModel,
      hash,
    );
    return newUser;
  }

  async _generateHash(password: string): Promise<string> {
    return await bcrypt.hash(password, 7);
  }
}
