import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../users.schema';
import { Model } from 'mongoose';
import {
  BanUserInputModel,
  SAUserViewDTO,
  UserCreateDTO,
  UserInputModel,
  UserViewDTO,
} from '../user.models';
import { userMapping, userMappingSA } from '../user.helpers';
import { objectIdHelper } from '../../common/helpers';

@Injectable()
export class UsersRepository {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}
  async findUser(userId: string): Promise<SAUserViewDTO | null> {
    try {
      if (!objectIdHelper(userId)) return null;

      const user = await this.userModel.findById(objectIdHelper(userId));
      if (!user) {
        return null;
      }
      return userMappingSA(user);
    } catch (e) {
      console.log('error usersRepository', e);
      throw new InternalServerErrorException();
    }
  }

  /**
   * Получение пользователя по его идентификатору.
   * @param userId Идентификатор пользователя.
   * @returns Объект UserViewDTO, представляющий пользователя, или null, если пользователь не найден.
   * @throws InternalServerErrorException, если возникает ошибка при взаимодействии с базой данных.
   */
  async getUser(userId: string): Promise<UserViewDTO | null> {
    try {
      if (!objectIdHelper(userId)) return null;

      const user = await this.userModel.findById(objectIdHelper(userId));
      if (!user) {
        return null;
      }
      return userMapping(user);
    } catch (e) {
      console.log('error usersRepository', e);
      throw new InternalServerErrorException();
    }
  }

  async getBadBoy(userId: string): Promise<UserDocument | null> {
    try {
      if (!objectIdHelper(userId)) return null;

      return this.userModel.findById(objectIdHelper(userId));
    } catch (e) {
      console.log('error usersRepository', e);
      throw new InternalServerErrorException();
    }
  }

  /**
   * Создание нового пользователя на основе данных из UserCreateDTO.
   * @param inputModel Данные для создания пользователя.
   * @returns Объект UserViewDTO, представляющий созданного пользователя.
   * @throws InternalServerErrorException, если возникает ошибка при сохранении пользователя в базе данных.
   */
  async createUser(inputModel: UserCreateDTO): Promise<UserViewDTO> {
    const user: UserDocument = new this.userModel(inputModel);
    await user.save();

    return userMapping(user);
  }

  async createUserSA(inputModel: UserCreateDTO): Promise<UserViewDTO> {
    const user: UserDocument = new this.userModel(inputModel);
    await user.save();

    return userMapping(user);
  }

  /**
   * Обновление данных пользователя на основе UserInputModel.
   * @param userId Айди пользователя для обновления.
   * @param inputModel Новые данные пользователя.
   * @returns Объект Model, представляющий результат операции обновления.
   * @Throws InternalServerErrorException, если возникает ошибка при взаимодействии с базой данных.
   */
  async updateUser(userId: string, inputModel: UserInputModel) {
    try {
      return this.userModel.updateOne(
        { _id: objectIdHelper(userId) },
        {
          $set: {
            login: inputModel.login,
            email: inputModel.email,
          },
        },
      );
    } catch (e) {
      console.log(e);
      throw new InternalServerErrorException();
    }
  }

  /**
   * Удаление пользователя по его идентификатору.
   * @param userId Идентификатор пользователя.
   * @returns Объект Document, представляющий результат операции удаления.
   * @throws InternalServerErrorException, если возникает ошибка при взаимодействии с базой данных.
   */
  async deleteUserById(userId: string): Promise<Document | null> {
    try {
      return this.userModel.findByIdAndDelete(objectIdHelper(userId));
    } catch (e) {
      console.log(e);
      throw new InternalServerErrorException();
    }
  }

  /**
   * Удаление пользователя по адресу электронной почты.
   * @param email Адрес электронной почты пользователя.
   * @returns true, если удаление успешно, в противном случае false.
   * @throws InternalServerErrorException, если возникает ошибка при взаимодействии с базой данных.
   */
  async deleteUserByEmail(email: string) {
    try {
      const deleteResult = await this.userModel
        .deleteOne({ email: email })
        .exec();
      return deleteResult.deletedCount === 1;
    } catch (e) {
      console.log(e);
      throw new InternalServerErrorException();
    }
  }

  /**
   * Поиск пользователя по адресу электронной почты.
   * @param email Адрес электронной почты пользователя.
   * @returns Объект UserDocument, представляющий пользователя, или null, если пользователь не найден.
   * @throws InternalServerErrorException, если возникает ошибка при взаимодействии с базой данных.
   */
  async findUserByEmail(email: string) {
    try {
      return this.userModel.findOne({ email: email }).exec();
    } catch (e) {
      console.log(e);
      throw new InternalServerErrorException();
    }
  }

  /*** Поиск пользователя по логину.
   * @param login Логин пользователя.
   * @returns Объект UserDocument, представляющий пользователя, или null, если пользователь не найден.
   * @throws InternalServerErrorException, если возникает ошибка при взаимодействии с базой данных.
   */
  async findUserByLogin(login: string) {
    try {
      return this.userModel.findOne({ login: login }).exec();
    } catch (e) {
      console.log(e);
      throw new InternalServerErrorException();
    }
  }

  /**
   * Поиск пользователя по коду подтверждения электронной почты.
   * @param code Код подтверждения электронной почты.
   * @returns Объект UserDocument, представляющий пользователя, или null, если пользователь не найден.
   * @throws InternalServerErrorException, если возникает ошибка при взаимодействии с базой данных.
   */
  async findUserByCode(code: string) {
    try {
      return this.userModel
        .findOne({ 'emailConfirmation.confirmationCode': code })
        .exec();
    } catch (e) {
      console.log(e);
      throw new InternalServerErrorException();
    }
  }

  /**
   * Поиск пользователя по логину или адресу электронной почты.
   * @param loginOrEmail Логин или адрес электронной почты пользователя.
   * @returns Объект UserDocument, представляющий пользователя, или null, если пользователь не найден.
   * @throws InternalServerErrorException, если возникает ошибка при взаимодействии с базой данных.
   */
  async findUserLoginOrEmail(loginOrEmail: string) {
    try {
      // Ищем пользователя в базе данных по логину или адресу электронной почты
      const user = await this.userModel
        .findOne({ $or: [{ login: loginOrEmail }, { email: loginOrEmail }] })
        .exec();

      // Если пользователь не найден, возвращаем null
      if (!user) {
        return null;
      }

      // Возвращаем найденного пользователя
      return user;
    } catch (e) {
      console.log(e);
      throw new InternalServerErrorException();
    }
  }

  /**
   * Подтверждение адреса электронной почты пользователя по коду.
   * @param code Код подтверждения электронной почты.
   * @returns true, если обновление успешно, в противном случае false.
   * @throws InternalServerErrorException, если возникает ошибка при взаимодействии с базой данных.
   */
  async confirmEmail(code: string): Promise<boolean> {
    try {
      // Обновляем статус подтверждения адреса электронной почты пользователя
      const isUpdate = await this.userModel
        .updateOne(
          {
            'emailConfirmation.confirmationCode': code,
          },
          { $set: { 'emailConfirmation.isConfirmed': true } },
        )
        .exec();
      return isUpdate.matchedCount === 1;
    } catch (e) {
      console.log(e);
      throw new InternalServerErrorException();
    }
  }

  /**
   * Обновление кода подтверждения электронной почты пользователя по адресу электронной почты.
   * @param email Адрес электронной почты пользователя.
   * @param newCode Новый код подтверждения.
   * @returns true, если обновление успешно, в противном случае false.
   * @throws InternalServerErrorException, если возникает ошибка при взаимодействии с базой данных.
   */
  async updateConfirmationCodeByEmail(email: string, newCode: string) {
    try {
      const isUpdate = await this.userModel
        .updateOne(
          {
            email: email,
          },
          { $set: { 'emailConfirmation.confirmationCode': newCode } },
        )
        .exec();
      return isUpdate.matchedCount === 1;
    } catch (e) {
      console.log(e);
      throw new InternalServerErrorException();
    }
  }

  /**
   * Поиск пользователя по логину и адресу электронной почты.
   * @param login Логин пользователя.
   * @param email Адрес электронной почты пользователя.
   * @returns Объект UserDocument, представляющий пользователя, или null, если пользователь не найден.
   * @throws InternalServerErrorException, если возникает ошибка при взаимодействии с базой данных.
   */
  async findUserByLoginAndEmail(login: string, email: string) {
    try {
      // Ищем пользователя в базе данных по логину или адресу электронной почты
      const user = await this.userModel
        .findOne({ $or: [{ login: login }, { email: email }] })
        .exec();

      // Если пользователь не найден, возвращаем null
      if (!user) {
        return null;
      }

      // Возвращаем найденного пользователя
      return user;
    } catch (e) {
      console.log(e);
      throw new InternalServerErrorException();
    }
  }

  /**
   * Обновление пароля пользователя по коду и хешу нового пароля.
   * @param hash Хеш нового пароля.
   * @param code Код подтверждения.
   * @returns true, если обновление успешно, в противном случае false.
   * @throws InternalServerErrorException, если возникает ошибка при взаимодействии с базой данных.
   */
  async updatePasswordForUser(hash: string, code: string) {
    try {
      const result = await this.userModel
        .updateOne({ code }, { $set: { hash: hash } })
        .exec();
      return result.matchedCount === 1;
    } catch (e) {
      console.log(e);
      throw new InternalServerErrorException();
    }
  }

  async banUser(userId: string, inputModel: BanUserInputModel) {
    try {
      const updateResult = await this.userModel.updateOne(
        {
          _id: objectIdHelper(userId),
        },
        {
          $set: {
            'banInfo.isBanned': inputModel.isBanned,
            'banInfo.banReason': inputModel.banReason,
            'banInfo.banDate': new Date(),
          },
        },
      );
      return updateResult.matchedCount;
    } catch (e) {
      console.log(e);
      throw new Error('something went wrong');
    }
  }

  async unBanUser(userId: string, inputModel: BanUserInputModel) {
    try {
      const updateResult = await this.userModel.updateOne(
        {
          _id: objectIdHelper(userId),
        },
        {
          $set: {
            'banInfo.isBanned': inputModel.isBanned,
            'banInfo.banReason': null,
            'banInfo.banDate': null,
          },
        },
      );
      return updateResult.matchedCount;
    } catch (e) {
      console.log(e);
      throw new Error('something went wrong');
    }
  }
}
