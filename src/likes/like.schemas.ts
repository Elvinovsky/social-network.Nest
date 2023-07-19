import { HydratedDocument, Model } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

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
  postOrCommentId: string;
  @Prop({ required: true })
  createdAt: Date;
}

export const LikeSchema = SchemaFactory.createForClass(Like);
