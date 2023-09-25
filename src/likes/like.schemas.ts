import { HydratedDocument, Model } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { UserInfo } from '../users/user.models';
import { LikeCreateDTO } from './like.models';

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

  static Create(
    postOrCommentId: string,
    userInfo: UserInfo,
    statusType: string,
  ) {
    const newLike: LikeCreateDTO = new Like();
    (newLike.status = statusType),
      (newLike.userId = userInfo.userId),
      (newLike.userLogin = userInfo.userLogin),
      (newLike.postIdOrCommentId = postOrCommentId),
      (newLike.addedAt = new Date()),
      (newLike.isBanned = false);

    return newLike;
  }
}

export const LikeSchema = SchemaFactory.createForClass(Like);
