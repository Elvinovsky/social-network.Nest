import { Injectable } from '@nestjs/common';
import { CommentsRepository } from './comments.repository';
import { CommentViewDTO } from './comment.models';

@Injectable()
export class CommentsService {
  constructor(private readonly commentsRepository: CommentsRepository) {}
  async getComment(
    commentId: string,
    userId?: any,
  ): Promise<CommentViewDTO | null> {
    return await this.commentsRepository.getCommentById(commentId, userId);
  }
}
