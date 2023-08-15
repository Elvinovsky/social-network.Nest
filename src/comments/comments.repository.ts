import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Comment, CommentDocument, CommentModel } from './comment.schemas';
import { objectIdHelper } from '../common/helpers';
import { CommentMapper } from './helpers/comment.mapping';
import { CommentCreateDTO } from './comment.models';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectModel(Comment.name) private commentModel: CommentModel,
    private readonly commentMapper: CommentMapper,
  ) {}
  async getCommentById(commentId: string, userId: any) {
    try {
      if (!objectIdHelper(commentId)) return null;

      const result: CommentDocument | null = await this.commentModel.findById(
        objectIdHelper(commentId),
      );
      if (!result) return null;

      return this.commentMapper.comment(result, userId);
    } catch (e) {
      console.log(e, 'error getCommentById');
      throw new HttpException('server error', 500);
    }
  }

  async getCommentByPostId(postId: string) {
    try {
      if (!objectIdHelper(postId)) return null;

      const result: CommentDocument | null = await this.commentModel.findOne({
        postId: objectIdHelper(postId),
      });
      return result;
    } catch (e) {
      console.log(e, 'error getCommentByPostId');
      throw new HttpException('server error', 500);
    }
  }

  async addNewComment(newComment: CommentCreateDTO) {
    try {
      const comment: CommentDocument = new this.commentModel(newComment);
      await comment.save();

      return this.commentMapper.comment(comment);
    } catch (e) {
      console.log(e, 'error addNewComment method');
      throw new HttpException('failed', HttpStatus.EXPECTATION_FAILED);
    }
  }
  async updateCommentById(id: string, content: string): Promise<boolean> {
    const result = await this.commentModel.updateOne(
      { _id: objectIdHelper(id) },
      { $set: { content } },
    );
    return result.matchedCount === 1;
  }

  async findCommentById(id: string) {
    try {
      if (!objectIdHelper(id)) return null;

      const result: CommentDocument | null = await this.commentModel.findById(
        objectIdHelper(id),
      );
      return result;
    } catch (e) {
      console.log(e, 'error getCommentById');
      throw new HttpException('server error', 500);
    }
  }

  async deleteComment(id: string): Promise<boolean> {
    const resultDeleted = await this.commentModel.deleteOne({
      _id: objectIdHelper(id),
    });
    return resultDeleted.deletedCount === 1;
  }
}
