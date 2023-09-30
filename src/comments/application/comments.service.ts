import { Injectable } from '@nestjs/common';
import { CommentsRepository } from '../infrastructure/repositories/mongo/comments.repository';
import { CommentCreateDTO, CommentViewDTO } from '../dto/comment.models';
import { Comment } from '../entities/comment.schemas';
import { UserInfo } from '../../users/dto/view/user-view.models';

@Injectable()
export class CommentsService {
  constructor(private readonly commentsRepository: CommentsRepository) {}
  async findCommentById(id: string) {
    return this.commentsRepository.findCommentById(id);
  }
  async getComment(
    commentId: string,
    userId?: any,
  ): Promise<CommentViewDTO | null> {
    return await this.commentsRepository.getCommentById(commentId, userId);
  }
  async createComment(
    postId: string,
    userInfo: UserInfo,
    content: string,
  ): Promise<CommentViewDTO> {
    const newComment: CommentCreateDTO = Comment.create(
      postId,
      userInfo,
      content,
    );

    return this.commentsRepository.addNewComment(newComment);
  }
  async updateCommentById(id: string, content: string): Promise<boolean> {
    return this.commentsRepository.updateCommentById(id, content);
  }

  async deleteComment(id: string): Promise<boolean> {
    return await this.commentsRepository.deleteComment(id);
  }

  async banComments(userId: string) {
    return this.commentsRepository.banCommentsUserId(userId);
  }
  async unBanComments(userId: string) {
    return this.commentsRepository.unBanCommentsUserId(userId);
  }
}
