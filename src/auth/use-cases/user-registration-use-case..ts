import { Injectable } from '@nestjs/common';
import { UsersService } from '../../users/users.service';
import { EmailService } from '../../email/email.service';
import { RegistrationInputModel } from '../auth.models';
import { v4 as uuidv4 } from 'uuid';
import { add } from 'date-fns';
import { UserViewDTO } from '../../users/user.models';
import bcrypt from 'bcrypt';

@Injectable()
export class UserRegistrationUseCase {
  constructor(
    private readonly usersService: UsersService,
    private readonly emailService: EmailService,
  ) {}

  async execute(inputModel: RegistrationInputModel): Promise<boolean> {
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

    //отправляем по эелектронной почте код подтверждения.
    const send = await this.emailService.sendEmailConformationMessage(
      newUser.email,
      code,
    );
    // для корректной валидации отправки письма, требуется дождаться отправки. ( add await transporter function)
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
