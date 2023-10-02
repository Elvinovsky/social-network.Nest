import { HydratedDocument, Model } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { UserInfo } from '../../../users/dto/view/user-view.models';
import { LikeCreateDTO } from '../../dto/like.models';

export type LikeDocument = HydratedDocument<Like>;

export type LikeModel = Model<LikeDocument>;
@Schema()
export class Like {
  @Prop({ required: true })
  status: string;
  @Prop({ required: true })
  userId: string;
  @Prop({ required: true })
  userLogin: string;
  @Prop({ required: true })
  postIdOrCommentId: string;
  @Prop({ required: true })
  addedAt: Date;
  @Prop()
  isBanned: boolean;
}

export const LikeSchema = SchemaFactory.createForClass(Like);
