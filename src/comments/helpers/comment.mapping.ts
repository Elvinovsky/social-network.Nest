import { CommentCreateDTO, CommentViewDTO } from '../comment.models';
import { LikesService } from '../../likes/likes.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CommentMapper {
  constructor(private readonly likesService: LikesService) {}
  async comment(
    comment: CommentCreateDTO,
    currentUserId?: string,
  ): Promise<CommentViewDTO> {
    const status = await this.likesService.getLikeStatusCurrentUser(
      comment.id,
      currentUserId,
    );

    const countsLikeAndDis = await this.likesService.countLikesDisLikes(
      comment.id,
    );

    return {
      id: comment.id,
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
      createdAt: comment.addedAt.toISOString(),
    };
  }
  async comments(
    array: Array<CommentCreateDTO>,
    userId?: string,
  ): Promise<CommentViewDTO[]> {
    return Promise.all(
      array.map(async (el) => {
        const status = await this.likesService.getLikeStatusCurrentUser(
          el.id,
          userId,
        );

        const countsLikeAndDis = await this.likesService.countLikesDisLikes(
          el.id,
        );

        return {
          id: el.id,
          content: el.content,
          commentatorInfo: {
            userId: el.commentatorInfo.userId,
            userLogin: el.commentatorInfo.userLogin,
          },
          likesInfo: {
            likesCount: countsLikeAndDis.likes,
            dislikesCount: countsLikeAndDis.disLikes,
            myStatus: status,
          },
          createdAt: el.addedAt.toISOString(),
        };
      }),
    );
  }
}
