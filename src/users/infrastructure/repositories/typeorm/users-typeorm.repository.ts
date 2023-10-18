import { InjectRepository } from '@nestjs/typeorm';
import {
  BanInfoTypeOrmEntity,
  EmailConfirmTypeOrmEntity,
  UserTypeOrmEntity,
} from '../../../entities/typeorm/user-sql.schemas';
import { Repository } from 'typeorm';
import { SAUserViewDTO, UserViewDTO } from '../../../dto/view/user-view.models';
import { userMapping, userMappingSA } from '../../helpers/user.helpers';
import { UserCreateDTO } from '../../../dto/create/users-create.models';
import { BanUserInputModel } from '../../../dto/input/user-input.models';
import { Injectable } from '@nestjs/common';
import { IUserRepository } from '../../../../infrastructure/repositoriesModule/repositories.module';

@Injectable()
export class UsersTypeormRepository implements IUserRepository {
  constructor(
    @InjectRepository(UserTypeOrmEntity)
    protected usersRepo: Repository<UserTypeOrmEntity>,

    @InjectRepository(BanInfoTypeOrmEntity)
    protected banRepo: Repository<BanInfoTypeOrmEntity>,

    @InjectRepository(EmailConfirmTypeOrmEntity)
    protected emailRepo: Repository<EmailConfirmTypeOrmEntity>,
  ) {}
  /**
   * Поиск пользователя по его идентификатору.
   * @param userId Идентификатор пользователя.
   * @returns Объект SAUserViewDTO, представляющий пользователя, или null, если пользователь не найден.
   * @throws Error, если возникает ошибка при взаимодействии с базой данных.
   */
  async findUser(userId: string): Promise<SAUserViewDTO | null> {
    try {
      const user = await this.usersRepo.findOne({
        where: { id: userId },
        relations: { banInfo: true, emailConfirmation: true },
      });
      if (!user) {
        return null;
      }

      return userMappingSA(user);
    } catch (e) {
      console.log('error UsersTypeormRepository', e);
      throw new Error();
    }
  }

  /**
   * Получение пользователя по его идентификатору.
   * @param userId Идентификатор пользователя.
   * @returns Объект UserViewDTO, представляющий пользователя, или null, если пользователь не найден.
   * @throws Error, если возникает ошибка при взаимодействии с базой данных.
   */
  async getUser(userId: string): Promise<UserViewDTO | null> {
    try {
      const user = await this.usersRepo.findOneBy({
        id: userId,
      });

      if (!user) {
        return null;
      }

      return userMapping(user);
    } catch (e) {
      console.log('error usersRepository', e);
      throw new Error();
    }
  }

  /**
   * Создание нового пользователя на основе данных из UserCreateDTO.
   * @param inputModel Данные для создания пользователя.
   * @returns Объект UserViewDTO, представляющий созданного пользователя.
   * @throws error, если возникает ошибка при сохранении пользователя в базе данных.
   */
  async createUser(inputModel: UserCreateDTO): Promise<UserViewDTO> {
    try {
      const user = this.usersRepo.create(inputModel);

      await this.usersRepo.save(user);

      return userMapping(inputModel);
    } catch (e) {
      console.log(e);
      throw new Error();
    }
  }

  /**
   * Удаление пользователя по его идентификатору.
   * @param userId Идентификатор пользователя.
   * @returns Объект Document, представляющий результат операции удаления.
   * @throws Error, если возникает ошибка при взаимодействии с базой данных.
   */
  async deleteUserById(userId: string): Promise<number | null> {
    try {
      const deleteUser = await this.usersRepo.delete({ id: userId });
      await this.banRepo.delete({ userId: userId });
      await this.emailRepo.delete({ userId: userId });

      if (!deleteUser?.affected || deleteUser.affected === 0) return null;

      return deleteUser.affected;
    } catch (err) {
      console.log(err);
      throw new Error();
    }
  }

  /**
   * Поиск пользователя по адресу электронной почты.
   * @param email Адрес электронной почты пользователя.
   * @returns Объект UserCreateDTO, представляющий пользователя, или null, если пользователь не найден.
   * @throws Error, если возникает ошибка при взаимодействии с базой данных.
   */
  async findUserByEmail(email: string): Promise<UserCreateDTO | null> {
    try {
      const user = await this.usersRepo.findOneBy({
        email: email,
      });

      if (!user) return null;

      const banInfo = await this.banRepo.findOneBy({
        userId: user?.id,
      });

      const emailInfo = await this.emailRepo.findOneBy({
        userId: user?.id,
      });

      return {
        ...user,
        banInfo: banInfo,
        emailConfirmation: emailInfo,
      } as UserCreateDTO;
    } catch (e) {
      console.log(e);
      throw new Error();
    }
  }

  /*** Поиск пользователя по логину.
   * @param login Логин пользователя.
   * @returns Объект UserCreateDTO, представляющий пользователя, или null, если пользователь не найден.
   * @throws Error, если возникает ошибка при взаимодействии с базой данных.
   */
  async findUserByLogin(login: string): Promise<UserCreateDTO | null> {
    try {
      const user = await this.usersRepo.findOneBy({
        login: login,
      });

      if (!user) return null;

      const banInfo = await this.banRepo.findOneBy({
        userId: user?.id,
      });

      const emailInfo = await this.emailRepo.findOneBy({
        userId: user?.id,
      });

      return {
        ...user,
        banInfo: banInfo,
        emailConfirmation: emailInfo,
      } as UserCreateDTO;
    } catch (e) {
      console.log(e);
      throw new Error();
    }
  }

  /**
   * Поиск пользователя по коду подтверждения электронной почты.
   * @param code Код подтверждения электронной почты.
   * @returns Объект UserCreateDTO, представляющий пользователя, или null, если пользователь не найден.
   * @throws Error, если возникает ошибка при взаимодействии с базой данных.
   */
  async findUserByCode(code: string): Promise<UserCreateDTO | null> {
    try {
      const emailInfo = await this.emailRepo.findOneBy({
        confirmationCode: code,
      });

      if (!emailInfo) return null;

      const user = await this.usersRepo.findOneBy({
        id: emailInfo.userId,
      });

      const banInfo = await this.banRepo.findOneBy({
        userId: user?.id,
      });

      return {
        ...user,
        banInfo: banInfo,
        emailConfirmation: emailInfo,
      } as UserCreateDTO;
    } catch (e) {
      console.log(e);
      throw new Error();
    }
  }

  /**
   * Поиск пользователя по логину или адресу электронной почты.
   * @param loginOrEmail Логин или адрес электронной почты пользователя.
   * @returns Объект UserCreateDTO, представляющий пользователя, или null, если пользователь не найден.
   * @throws Error, если возникает ошибка при взаимодействии с базой данных.
   */
  async findUserLoginOrEmail(
    loginOrEmail: string,
  ): Promise<UserCreateDTO | null> {
    try {
      // Ищем пользователя в базе данных по логину или адресу электронной почты
      const user = await this.usersRepo.findOne({
        where: [{ login: loginOrEmail }, { email: loginOrEmail }],
      });

      // Если пользователь не найден, возвращаем null
      if (!user) return null;

      const banInfo = await this.banRepo.findOneBy({
        userId: user?.id,
      });

      const emailInfo = await this.emailRepo.findOneBy({
        userId: user?.id,
      });

      return {
        ...user,
        banInfo: banInfo,
        emailConfirmation: emailInfo,
      } as UserCreateDTO;
    } catch (e) {
      console.log(e);
      throw new Error();
    }
  }

  /**
   * Подтверждение адреса электронной почты пользователя по коду.
   * @param code Код подтверждения электронной почты.
   * @returns true, если обновление успешно, в противном случае false.
   * @throws Error, если возникает ошибка при взаимодействии с базой данных.
   */
  async confirmEmail(code: string): Promise<boolean> {
    try {
      // Обновляем статус подтверждения адреса электронной почты пользователя
      const isUpdate = await this.emailRepo.update(
        {
          confirmationCode: code,
        },
        { isConfirmed: true },
      );

      return isUpdate.affected === 1;
    } catch (e) {
      console.log(e);
      throw new Error();
    }
  }

  /**
   * Обновление кода подтверждения электронной почты пользователя по адресу электронной почты.
   * @param email Адрес электронной почты пользователя.
   * @param newCode Новый код подтверждения.
   * @returns true, если обновление успешно, в противном случае false.
   * @throws Error, если возникает ошибка при взаимодействии с базой данных.
   */
  async updateConfirmationCodeByEmail(
    email: string,
    newCode: string,
  ): Promise<boolean> {
    try {
      const user = await this.usersRepo.findOneBy({
        email: email,
      });

      const codeUpdate = await this.emailRepo.update(
        { userId: user?.id },
        {
          confirmationCode: newCode,
        },
      );
      return codeUpdate.affected === 1;
    } catch (e) {
      console.log(e);
      throw new Error();
    }
  }

  /**
   * Обновление пароля пользователя по коду и хешу нового пароля.
   * @param hash Хеш нового пароля.
   * @param code Код подтверждения.
   * @returns true, если обновление успешно, в противном случае false.
   * @throws Error, если возникает ошибка при взаимодействии с базой данных.
   */
  async updatePasswordForUser(hash: string, code: string): Promise<boolean> {
    try {
      const emailInfo = await this.emailRepo.findOneBy({
        confirmationCode: code,
      });

      const updatePassword = await this.usersRepo.update(
        { id: emailInfo?.userId },
        { passwordHash: hash },
      );

      return updatePassword.affected === 1;
    } catch (e) {
      console.log(e);
      throw new Error();
    }
  }

  async banUser(
    userId: string,
    inputModel: BanUserInputModel,
  ): Promise<boolean | null> {
    try {
      const user = await this.usersRepo.findOneBy({ id: userId });

      if (!user) return null;

      const updateBanInfo = await this.banRepo.update(
        { userId: user.id },
        {
          banReason: inputModel.banReason,
          banDate: new Date(),
          isBanned: inputModel.isBanned,
        },
      );
      return updateBanInfo.affected === 1;
    } catch (e) {
      console.log(e);
      throw new Error('something went wrong');
    }
  }

  async unBanUser(
    userId: string,
    inputModel: BanUserInputModel,
  ): Promise<boolean | null> {
    try {
      const user = await this.usersRepo.findOneBy({ id: userId });

      if (!user) return null;

      const updateBanInfo = await this.banRepo.update(
        { userId: user.id },
        {
          banReason: inputModel.banReason,
          isBanned: inputModel.isBanned,
        },
      );
      return updateBanInfo.affected === 1;
    } catch (e) {
      console.log(e);
      throw new Error('something went wrong');
    }
  }

  async updateEmail(userId: string, email: string): Promise<boolean> {
    try {
      const updateResult = await this.usersRepo.update(
        { id: userId },

        {
          email: email,
        },
      );
      return updateResult.affected === 1;
    } catch (e) {
      console.log(e);
      throw new Error();
    }
  }
  async updateLogin(userId: string, login: string): Promise<boolean> {
    try {
      const updateResult = await this.usersRepo.update(
        { id: userId },
        {
          login: login,
        },
      );
      return updateResult.affected === 1;
    } catch (e) {
      console.log(e);
      throw new Error();
    }
  }
}
