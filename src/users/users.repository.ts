import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './users.schema';
import { Model } from 'mongoose';
import { CreateUserInputType } from './users.controller';

@Injectable()
export class UsersRepository {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}
  async getUsers(query: { term: string }) {
    return this.userModel.find({ name: { $regex: query.term, options: 'i' } });
  }
  async getUser(userId: string) {
    return this.userModel.findOne({ _id: userId });
  }
  async updateUser(id, inputModel: CreateUserInputType) {
    return this.userModel.updateOne({ id }, { $set: inputModel });
  }
}
