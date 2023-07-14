import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './users.schema';
import { Model } from 'mongoose';
import { UserCreateDTO, UserInputModel, UserViewDTO } from './user.models';
import { userMapping } from './user.helpers';

@Injectable()
export class UsersRepository {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}
  async getUsers() {
    return this.userModel.find();
  }
  async getUser(userId: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ _id: userId });
  }

  async createUser(
    inputModel: UserInputModel,
    hash: string,
  ): Promise<UserViewDTO> {
    const newUser: UserCreateDTO = {
      login: inputModel.login,
      passwordHash: hash,
      email: inputModel.email,
      createdAt: new Date().toISOString(),
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
  async updateUser(user) {
    return this.userModel.updateOne(
      { _id: user.id },
      {
        $set: {
          name: user.name,
          childrenCount: user.childrenCount,
        },
      },
    );
  }
}
