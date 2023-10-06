import { InjectRepository } from '@nestjs/typeorm';
import {
  BanInfoSql,
  EmailConfirmationSql,
  UserSql,
} from '../../../entities/typeorm/user-sql.schemas';
import { DeepPartial, Repository } from 'typeorm';
import { SAUserViewDTO, UserViewDTO } from '../../../dto/view/user-view.models';
import { userMapping, userMappingSA } from '../../helpers/user.helpers';
import { UserCreateDTO } from '../../../dto/create/users-create.models';
import { BanUserInputModel } from '../../../dto/input/user-input.models';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersTypeormRepository {
  constructor(
    @InjectRepository(UserSql)
    protected usersRepo: Repository<UserSql>,

    @InjectRepository(BanInfoSql)
    protected banRepo: Repository<BanInfoSql>,

    @InjectRepository(EmailConfirmationSql)
    protected emailRepo: Repository<EmailConfirmationSql>,
  ) {}
  /**
   * Поиск пользователя по его идентификатору.
   * @param userId Идентификатор пользователя.
   * @returns Объект SAUserViewDTO, представляющий пользователя, или null, если пользователь не найден.
   * @throws Error, если возникает ошибка при взаимодействии с базой данных.
   */
  async findUser(userId: string): Promise<SAUserViewDTO | null> {
    try {
      const user = (await this.usersRepo.findOne({
        where: { id: userId },
      })) as UserCreateDTO | null;
      console.log(user);
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

      const banInfo = await this.banRepo.findOneBy({ userId: userId });

      const emailConfirmation = await this.emailRepo.findOneBy({
        userId: userId,
      });

      console.log(user, banInfo, emailConfirmation);

      if (!user) {
        return null;
      }



        return userMapping(user);
      }
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
    const deepPartialUserSql: DeepPartial<UserSql> =
      inputModel as DeepPartial<UserSql>;

    await this.usersRepo.save(deepPartialUserSql);

    return userMapping(inputModel);
  }

  /**
   * Удаление пользователя по его идентификатору.
   * @param userId Идентификатор пользователя.
   * @returns Объект Document, представляющий результат операции удаления.
   * @throws InternalServerErrorException, если возникает ошибка при взаимодействии с базой данных.
   */
  async deleteUserById(userId: string): Promise<number | null> {
    try {
      const deleteResult = await this.usersRepo.delete({ id: userId });
      return deleteResult.raw;
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
  async findUserByEmail(email: string) {
    try {
      const result = (await this.usersRepo.findOneBy({
        email: email,
      })) as UserCreateDTO | null;

      return result;
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
  async findUserByLogin(login: string) {
    try {
      const result = (await this.usersRepo.findOneBy({
        login: login,
      })) as UserCreateDTO | null;

      return result;
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
      const result = (await this.usersRepo.findOneBy({
        confirmationCode: code,
      })) as UserCreateDTO | null;

      return result;
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
      const user = (await this.usersRepo.findOneBy([
        { login: loginOrEmail },
        { email: loginOrEmail },
      ])) as UserCreateDTO | null;

      // Если пользователь не найден, возвращаем null
      if (!user) {
        return null;
      }

      // Возвращаем найденного пользователя
      return user as UserCreateDTO;
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
      const isUpdate = await this.usersRepo.update(
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
  async updateConfirmationCodeByEmail(email: string, newCode: string) {
    try {
      const isUpdated = await this.usersRepo.update(
        {
          email: email,
        },
        { confirmationCode: newCode },
      );

      return isUpdated.affected === 1;
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
  async updatePasswordForUser(hash: string, code: string) {
    try {
      const result = await this.usersRepo.update(
        { confirmationCode: code },
        { passwordHash: hash },
      );

      return result.affected === 1;
    } catch (e) {
      console.log(e);
      throw new Error();
    }
  }

  async banUser(userId: string, inputModel: BanUserInputModel) {
    try {
      const user = await this.usersRepo.findOne({
        where: { id: userId },
        relations: ['banInfo'],
      });
      console.log(user);
      if (!user) return null;

      // Создайте экземпляр QueryBuilder для обновления записи
      const qb = this.usersRepo.createQueryBuilder();
      const date = new Date();
      // Установите обновляемые значения
      await qb
        .update(BanInfoSql)
        .set({
          banDate: date,
          isBanned: inputModel.isBanned,
          banReason: inputModel.banReason,
        })
        .where({ userId: userId })
        .execute();

      return true;
    } catch (e) {
      console.log(e);
      throw new Error('something went wrong');
    }
  }

  async unBanUser(userId: string, inputModel: BanUserInputModel) {
    try {
      const updateResult = await this.usersRepo.update(
        {
          id: userId,
        },
        {
          isBanned: inputModel.isBanned,
          banReason: undefined,
          banDate: undefined,
        },
      );
      return updateResult.affected === 1;
    } catch (e) {
      console.log(e);
      throw new Error('something went wrong');
    }
  }

  async updateEmail(userId: string, email: string) {
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
  async updateLogin(userId: string, login: string) {
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
