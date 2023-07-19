import { HydratedDocument, Model } from 'mongoose';
import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { CommentatorInfo } from './comment.models';

export type CommentDocument = HydratedDocument<Comment>;
export type CommentModel = Model<Comment>;

export class Comment {
  @Prop({ required: true })
  postId: string;
  @Prop({ required: true })
  content: string;
  @Prop({ required: true })
  commentatorInfo: CommentatorInfo;
  @Prop({ required: true })
  addedAt: string;
}
export const CommentSchema = SchemaFactory.createForClass(Comment);
