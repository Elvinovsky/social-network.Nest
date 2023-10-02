import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import {
  BanInfo,
  EmailConfirmationModel,
} from '../../dto/create/users-create.models';

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
}

export const UserSchema = SchemaFactory.createForClass(User);
