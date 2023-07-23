import { CommentDocument } from '../comment.schemas';
import { CommentViewDTO } from '../comment.models';
import { LikesService } from '../../likes/likes.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CommentMapper {
  constructor(private readonly likesService: LikesService) {}
  async map(
    comment: CommentDocument,
    userId?: string,
  ): Promise<CommentViewDTO> {
    const status = await this.likesService.getLikeStatusCurrentUser(
      comment._id.toString(),
      userId,
    );

    const countsLikeAndDis = await this.likesService.countLikesDisLikes(
      comment._id.toString(),
    );

    return {
      id: comment._id.toString(),
      content: comment.content,
      commentatorInfo: {
        userId: comment.commentatorInfo.userId,
        userLogin: comment.commentatorInfo.userLogin,
      },
      likesInfo: {
        likesCount: countsLikeAndDis.likes,
        dislikesCount: countsLikeAndDis.disLikes,
        myStatus: status,
      },
      createdAt: comment.addedAt,
    };
  }
}
