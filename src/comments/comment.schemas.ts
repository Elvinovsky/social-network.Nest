import { HydratedDocument, Model } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { CommentatorInfo, CommentCreateDTO } from './comment.models';
export type CommentDocument = HydratedDocument<Comment>;
export type CommentModel = Model<Comment>;

@Schema()
export class Comment {
  @Prop({ required: true })
  postId: string;

  @Prop({ required: true })
  content: string;

  @Prop({ type: CommentatorInfo, required: true })
  commentatorInfo: CommentatorInfo;

  @Prop({ required: true })
  addedAt: string;
  static create(
    postId: string,
    commentatorInfo: CommentatorInfo,
    content: string,
  ): CommentCreateDTO {
    const newComment: Comment = new Comment();
    newComment.postId = postId;
    newComment.commentatorInfo = commentatorInfo;
    newComment.content = content;
    newComment.addedAt = new Date().toISOString();

    return newComment;
  }
}
export const CommentSchema = SchemaFactory.createForClass(Comment);
