import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './users.schema';
import { Model } from 'mongoose';
import { UserCreateDTO, UserInputModel, UserViewDTO } from './user.models';
import { userMapping } from './user.helpers';
import { objectIdHelper } from '../common/helpers';

@Injectable()
export class UsersRepository {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}
  async getUser(userId: string): Promise<UserDocument | null> {
    if (!objectIdHelper(userId)) return null;

    return this.userModel.findById(objectIdHelper(userId));
  }

  async createUser(inputModel: UserCreateDTO): Promise<UserViewDTO> {
    const user: UserDocument = new this.userModel(inputModel);
    await user.save();

    return userMapping(user);
  }
  async updateUser(user, inputModel: UserInputModel) {
    return this.userModel.updateOne(
      { _id: user.id },
      {
        $set: {
          login: inputModel.login,
          childrenCount: inputModel.email,
        },
      },
    );
  }

  async deleteUserById(userId: string): Promise<Document | null> {
    try {
      return this.userModel.findByIdAndDelete(objectIdHelper(userId));
    } catch (e) {
      console.log(e, 'error deleteUser method');
      throw new HttpException('failed', HttpStatus.EXPECTATION_FAILED);
    }
  }
  async deleteUserByEmail(email: string) {
    try {
      const deleteResult = await this.userModel
        .deleteOne({ email: email })
        .exec();
      return deleteResult.deletedCount === 1;
    } catch (e) {
      console.log(e, 'error deleteUser method');
      throw new HttpException('failed', HttpStatus.EXPECTATION_FAILED);
    }
  }

  async findUserByEmail(email: string) {
    try {
      return this.userModel.findOne({ email }).lean();
    } catch (e) {
      console.log(e);
      throw new InternalServerErrorException();
    }
  }

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

  async findUserLoginOrEmail(loginOrEmail: string) {
    try {
      // ищем юзера в БД...
      const user = await this.userModel
        .findOne({ $or: [{ login: loginOrEmail }, { email: loginOrEmail }] })
        .exec();

      // если не находим возвращаем null.
      if (!user) {
        return null;
      }

      //возвращаем найденного юзера.
      return user;
    } catch (e) {
      console.log(e);
      throw new InternalServerErrorException();
    }
  }
  async confirmEmail(code: string): Promise<boolean> {
    try {
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

  async updateConfirmationCodeByEmail(email: string, newCode: string) {
    try {
      const isUpdate = await this.userModel
        .updateOne(
          {
            email: email,
          },
          { $set: { emailConfirmation: { confirmationCode: newCode } } },
        )
        .exec();
      return isUpdate.matchedCount === 1;
    } catch (e) {
      console.log(e);
      throw new InternalServerErrorException();
    }
  }
}
