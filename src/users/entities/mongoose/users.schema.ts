import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { UserInputModel } from '../../dto/input/user-input.models';

export class EmailConfirmationModel {
  confirmationCode: string | null;
  expirationDate: Date | null;
  isConfirmed: boolean;
}

export class BanInfo {
  isBanned: boolean;
  banDate: string | null;
  banReason: string | null;
}

export class UserCreateDTO {
  id: string;
  login: string;
  passwordHash: string;
  email: string;
  addedAt: Date;
  emailConfirmation: EmailConfirmationModel;
  banInfo: BanInfo;
}

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  login: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  addedAt: Date;

  @Prop({ type: EmailConfirmationModel, required: true })
  emailConfirmation: EmailConfirmationModel;

  @Prop({ type: BanInfo, required: true })
  banInfo: BanInfo;

  static Create(
    inputModel: UserInputModel,
    hash: string,
    code: string,
    expireDate: Date,
  ): UserCreateDTO {
    const user: User = new User();

    user.id = uuidv4();
    user.login = inputModel.login;
    user.passwordHash = hash;
    user.email = inputModel.email;
    user.addedAt = new Date();
    user.emailConfirmation = {
      confirmationCode: code,
      expirationDate: expireDate,
      isConfirmed: false,
    };
    user.banInfo = {
      isBanned: false,
      banDate: null,
      banReason: null,
    };
    return user;
  }
  static CreateSA(inputModel: UserInputModel, hash: string): UserCreateDTO {
    const user: User = new User();

    user.id = uuidv4();
    user.login = inputModel.login;
    user.passwordHash = hash;
    user.email = inputModel.email;
    user.addedAt = new Date();
    user.emailConfirmation = {
      confirmationCode: null,
      expirationDate: null,
      isConfirmed: true,
    };
    user.banInfo = {
      isBanned: false,
      banDate: null,
      banReason: null,
    };
    return user;
  }
  public canBeConfirmed(expirationDate: Date) {
    if (expirationDate < new Date()) {
      return false;
    }
    this.emailConfirmation.expirationDate = null;
    return true;
  }
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.methods = {
  setChildren: User.prototype.canBeConfirmed,
};
