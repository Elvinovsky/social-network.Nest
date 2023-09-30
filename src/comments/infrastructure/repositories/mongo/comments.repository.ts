import {
  HttpException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Comment,
  CommentDocument,
  CommentModel,
} from '../../../entities/comment.schemas';
import { CommentMapper } from '../../helpers/comment.mapping';
import { CommentCreateDTO, CommentViewDTO } from '../../../dto/comment.models';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectModel(Comment.name) private commentModel: CommentModel,
    private readonly commentMapper: CommentMapper,
  ) {}
  async getCommentById(commentId: string, userId: any) {
    try {
      const result: CommentCreateDTO | null = await this.commentModel.findOne({
        id: commentId,
        'commentatorInfo.isBanned': { $ne: true },
      });
      if (!result) return null;

      return this.commentMapper.comment(result, userId);
    } catch (e) {
      console.log(e, 'error getCommentById');
      throw new HttpException('server error', 500);
    }
  }

  async addNewComment(newComment: CommentCreateDTO): Promise<CommentViewDTO> {
    try {
      const comment: CommentDocument = new this.commentModel(newComment);
      await comment.save();

      return this.commentMapper.comment(comment);
    } catch (e) {
      console.log(e, 'error addNewComment method');
      throw new InternalServerErrorException();
    }
  }

  async updateCommentById(id: string, content: string): Promise<boolean> {
    const result = await this.commentModel.updateOne(
      { id: id },
      { $set: { content } },
    );
    return result.matchedCount === 1;
  }

  async findCommentById(id: string): Promise<CommentCreateDTO | null> {
    try {
      const result: CommentCreateDTO | null = await this.commentModel.findOne({
        id: id,
      });
      if (!result) return null;

      return {
        id: result.id,
        postId: result.postId,
        content: result.content,
        commentatorInfo: result.commentatorInfo,
        addedAt: result.addedAt,
      };
    } catch (e) {
      console.log(e, 'error getCommentById');
      throw new HttpException('server error', 500);
    }
  }

  async deleteComment(id: string): Promise<boolean> {
    const resultDeleted = await this.commentModel.deleteOne({ id: id });
    return resultDeleted.deletedCount === 1;
  }

  async banCommentsUserId(userId: string): Promise<boolean> {
    const bannedComments = await this.commentModel.updateMany(
      { 'commentatorInfo.userId': userId },
      { $set: { 'commentatorInfo.isBanned': true } },
    );
    return bannedComments.matchedCount >= 1;
  }
  async unBanCommentsUserId(userId: string) {
    const unBannedComments = await this.commentModel.updateMany(
      { 'commentatorInfo.userId': userId },
      { $set: { 'commentatorInfo.isBanned': false } },
    );
    return unBannedComments.matchedCount >= 1;
  }
}
