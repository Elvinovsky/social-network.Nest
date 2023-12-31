import { HydratedDocument, Model } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type LikeDocument = HydratedDocument<LikeMongooseEntity>;

export type LikeModel = Model<LikeDocument>;
@Schema()
export class LikeMongooseEntity {
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

export const LikeSchema = SchemaFactory.createForClass(LikeMongooseEntity);
