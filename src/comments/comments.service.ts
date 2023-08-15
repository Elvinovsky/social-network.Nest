import { Injectable } from '@nestjs/common';
import { CommentsRepository } from './comments.repository';
import { CommentCreateDTO, CommentViewDTO } from './comment.models';

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
      commentatorInfo: {
        userId: userId,
        userLogin: userLogin,
      },
      addedAt: new Date().toISOString(),
    };

    return this.commentsRepository.addNewComment(newComment);
  }
  async updateCommentById(id: string, content: string): Promise<boolean> {
    return this.commentsRepository.updateCommentById(id, content);
  }

  async deleteComment(id: string): Promise<boolean> {
    return await this.commentsRepository.deleteComment(id);
  }
}
