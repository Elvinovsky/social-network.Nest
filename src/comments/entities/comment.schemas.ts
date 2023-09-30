import { HydratedDocument, Model } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { CommentatorInfo, CommentCreateDTO } from '../dto/comment.models';
import { UserInfo } from '../../users/dto/view/user-view.models';
import { v4 as uuidv4 } from 'uuid';

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
  static create(
    postId: string,
    userInfo: UserInfo,
    content: string,
  ): CommentCreateDTO {
    const newComment: Comment = new Comment();

    newComment.id = uuidv4();
    newComment.postId = postId;
    newComment.commentatorInfo = {
      userId: userInfo.userId,
      userLogin: userInfo.userLogin,
      isBanned: false,
    };
    newComment.content = content;
    newComment.addedAt = new Date();

    return newComment;
  }
}
export const CommentSchema = SchemaFactory.createForClass(Comment);
