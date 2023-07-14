import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { EmailConfirmationModel } from './user.models';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop()
  login: string;

  @Prop()
  passwordHash: string;

  @Prop()
  email: string;

  @Prop()
  addedAt: string;

  @Prop()
  emailConfirmation: EmailConfirmationModel;

  canBeConfirmed(expirationDate: Date) {
    if (expirationDate < new Date()) {
      throw new Error('bad value');
    }
    this.emailConfirmation.expirationDate = expirationDate;
  }
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.methods = {
  setChildren: User.prototype.canBeConfirmed,
};
