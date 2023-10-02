import { HydratedDocument, Model } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { CommentatorInfo } from '../../dto/comment.models';

export type CommentDocument = HydratedDocument<Comment>;
export type CommentModel = Model<Comment>;

@Schema()
export class Comment {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  postId: string;

  @Prop({ required: true })
  content: string;

  @Prop({ type: CommentatorInfo, required: true })
  commentatorInfo: CommentatorInfo;

  @Prop({ required: true })
  addedAt: Date;
}
export const CommentSchema = SchemaFactory.createForClass(Comment);
