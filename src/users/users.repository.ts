import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './users.schema';
import { Model } from 'mongoose';
import { UserCreateDTO, UserInputModel, UserViewDTO } from './user.models';
import { userMapping } from './user.helpers';
import { objectIdHelper } from '../common/helpers';

@Injectable()
export class UsersRepository {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}
  async getUsers() {
    return this.userModel.find();
  }
  async getUser(userId: string): Promise<UserDocument | null> {
    if (!objectIdHelper(userId)) return null;

    return this.userModel.findById(objectIdHelper(userId));
  }

  async createUser(
    inputModel: UserInputModel,
    hash: string,
  ): Promise<UserViewDTO> {
    const newUser: UserCreateDTO = {
      login: inputModel.login,
      passwordHash: hash,
      email: inputModel.email,
      addedAt: new Date().toISOString(),
      emailConfirmation: {
        confirmationCode: 'not required',
        expirationDate: 'not required',
        isConfirmed: true,
      },
    };

    const user: UserDocument = new this.userModel(newUser);
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

  async deleteUser(userId: string): Promise<Document | null> {
    try {
      return this.userModel.findByIdAndDelete(objectIdHelper(userId));
    } catch (e) {
      console.log(e, 'error deleteUser method');
      throw new HttpException('failed', HttpStatus.EXPECTATION_FAILED);
    }
  }
}
