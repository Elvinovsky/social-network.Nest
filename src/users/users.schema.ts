import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import {
  BanInfo,
  EmailConfirmationModel,
  UserCreateDTO,
  UserInputModel,
} from './user.models';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop({ required: true })
  login: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  addedAt: string;

  @Prop({ type: EmailConfirmationModel, required: true })
  emailConfirmation: EmailConfirmationModel;

  @Prop({ type: BanInfo, required: true })
  banInfo: BanInfo;

  static Create(
    inputModel: UserInputModel,
    hash: string,
    code?: string,
    expireDate?: Date,
  ): UserCreateDTO {
    const user: User = new User();
    user.login = inputModel.login;
    user.passwordHash = hash;
    user.email = inputModel.email;
    user.addedAt = new Date().toISOString();
    user.emailConfirmation = {
      confirmationCode: code || 'not required',
      expirationDate: expireDate || 'not required',
      isConfirmed: true,
    };
    user.banInfo = {
      isBanned: false,
      banDate: null,
      banReason: null,
    };
    return user;
  }

  canBeConfirmed(expirationDate: Date) {
    if (expirationDate < new Date()) {
      return false;
    }
    this.emailConfirmation.expirationDate = 'not required';
    return true;
  }
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.methods = {
  setChildren: User.prototype.canBeConfirmed,
};
