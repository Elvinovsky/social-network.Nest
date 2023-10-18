import { Injectable } from '@nestjs/common';
import { CommentCreateDTO, CommentViewDTO } from '../dto/comment.models';
import { UserInfo } from '../../users/dto/view/user-view.models';
import { commentCreator } from '../infrastructure/helpers/comment-creator';
import { ICommentRepository } from '../../infrastructure/repositoriesModule/repositories.module';

@Injectable()
export class CommentsService {
  constructor(private readonly commentsRepository: ICommentRepository) {}
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
    const newComment: CommentCreateDTO = commentCreator.create(
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
