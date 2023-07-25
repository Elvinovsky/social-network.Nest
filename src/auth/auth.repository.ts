import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../users/users.schema';

@Injectable()
export class AuthRepository {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}
  async confirmEmail(code: string): Promise<boolean> {
    try {
      const isUpdate = await this.userModel
        .updateOne(
          {
            emailConfirmation: { confirmationCode: code },
          },
          { $set: { emailConfirmation: { isConfirmed: true } } },
        )
        .exec();
      return isUpdate.matchedCount === 1;
    } catch (e) {
      console.log(e);
      throw new InternalServerErrorException();
    }
  }
}
