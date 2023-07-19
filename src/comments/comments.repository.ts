import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Comment, CommentDocument, CommentModel } from './comment.schemas';
import { objectIdHelper } from '../common/helpers';
import { CommentMapper } from './helpers/comment.mapping';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectModel(Comment.name) private commentModel: CommentModel,
    private readonly commentMapper: CommentMapper,
  ) {}
  async getCommentById(commentId: string, userId: any) {
    try {
      const result: CommentDocument | null = await this.commentModel.findById(
        objectIdHelper(commentId),
      );
      if (result) return this.commentMapper.map(result, userId);

      return null;
    } catch (e) {
      console.log(e, 'error getCommentById');
      throw new HttpException('server error', 500);
    }
  }
}
