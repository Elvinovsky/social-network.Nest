import { UsersService } from '../../../users/aplication/users.service';
import { EmailSenderService } from '../../../email/email.service';
import { RegistrationInputModel } from '../../auth.models';
import { v4 as uuidv4 } from 'uuid';
import { add } from 'date-fns';
import { UserViewDTO } from '../../../users/user.models';
import bcrypt from 'bcrypt';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class UserRegistrationCommand {
  constructor(public inputModel: RegistrationInputModel) {}
}

@CommandHandler(UserRegistrationCommand)
export class UserRegistrationUseCase
  implements ICommandHandler<UserRegistrationCommand>
{
  constructor(
    private readonly usersService: UsersService,
    private readonly emailService: EmailSenderService,
  ) {}

  async execute(command: UserRegistrationCommand): Promise<boolean> {
    //создаем хэш пароля, код подтверждения, задаем дату протухания коду
    const hash: string = await this._generateHash(command.inputModel.password);
    const code: string = uuidv4();
    const expirationDate: Date = add(new Date(), {
      hours: 1,
      minutes: 10,
    });

    //отправляем сгенерированные данные для создания нового юзера в сервис.
    const newUser: UserViewDTO = await this.usersService.createUserRegistration(
      command.inputModel,
      hash,
      code,
      expirationDate,
    );

    //отправляем по эелектронной почте код подтверждения.
    const send = await this.emailService.sendEmailConformationMessage(
      newUser.email,
      code,
    );
    // для корректной валидации отправки письма, требуется дождаться отправки. ( add await SMTP transporter function)
    if (send) {
      return true;
    }

    await this.usersService.deleteUserById(newUser.id);
    return false;
  }

  private async _generateHash(password: string): Promise<string> {
    return await bcrypt.hash(password, 7);
  }
}
