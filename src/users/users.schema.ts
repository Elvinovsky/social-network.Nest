import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { EmailConfirmationModel } from './user.models';

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
