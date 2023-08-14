import { Injectable } from '@nestjs/common';
import { CommentsRepository } from './comments.repository';
import { CommentCreateDTO, CommentViewDTO } from './comment.models';

@Injectable()
export class CommentsService {
  constructor(private readonly commentsRepository: CommentsRepository) {}
  async getComment(
    commentId: string,
    userId?: any,
  ): Promise<CommentViewDTO | null> {
    return await this.commentsRepository.getCommentById(commentId, userId);
  }
  async findCommentByPostId(postId: string) {
    return this.commentsRepository.getCommentByPostId(postId);
  }
  async createComment(
    postId: string,
    userId: string,
    userLogin: string,
    content: string,
  ): Promise<CommentViewDTO> {
    const newComment: CommentCreateDTO = {
      postId: postId,
      content: content,
      userId: userId,
      userLogin: userLogin,
      addedAt: new Date().toISOString(),
    };

    return this.commentsRepository.addNewComment(newComment);
  }
}
