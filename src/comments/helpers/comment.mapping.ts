import { CommentDocument } from '../comment.schemas';
import { CommentViewDTO } from '../comment.models';
import { LikesQueryRepo } from '../../likes/likes.query.repo';
import { LikeAndDisCounter } from '../../likes/like.helpers';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CommentMapper {
  constructor(
    private readonly likesQueryRepo: LikesQueryRepo,
    private readonly likeAndDisCounter: LikeAndDisCounter,
  ) {}
  async map(
    comment: CommentDocument,
    userId?: string,
  ): Promise<CommentViewDTO> {
    const status = await this.likesQueryRepo.getLikeStatusCurrentUser(
      comment._id.toString(),
      userId,
    );

    const countsLikeAndDis = await this.likeAndDisCounter.count(
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
