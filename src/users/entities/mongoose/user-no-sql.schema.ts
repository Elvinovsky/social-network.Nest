import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import {
  BanInfoModel,
  EmailConfirmationModel,
} from '../../dto/create/users-create.models';

export type UserDocument = HydratedDocument<UserMongooseEntity>;

@Schema()
export class UserMongooseEntity {
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

  @Prop({ type: BanInfoModel, required: true })
  banInfo: BanInfoModel;
}

export const UserSchema = SchemaFactory.createForClass(UserMongooseEntity);
