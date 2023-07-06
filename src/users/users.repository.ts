import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './users.schema';
import { Model } from 'mongoose';
import { CreateUserInputType } from './users.controller';

@Injectable()
export class UsersRepository {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}
  async getUsers(query: { term: string }) {
    return this.userModel.find();
  }
  async getUser(userId: string): Promise<UserDocument> {
    return this.userModel.findOne({ _id: userId });
  }
  async save(user: UserDocument) {
    await user.save();
  }
  async createUser(inputModel: CreateUserInputType) {
    const user = new this.userModel(inputModel);
    return user;
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
