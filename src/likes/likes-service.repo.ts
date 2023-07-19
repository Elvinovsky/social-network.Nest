import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { LikesInfoRepository } from './likes.repository';
import { LikeCreateDTO, LikeViewDTO } from './like.models';
import { Like, LikeModel } from './like.schemas';
import { Status } from '../common/constant';

@Injectable()
export class LikesServiceRepo {
  constructor(
    @InjectModel(Like.name) private likeModel: LikeModel,
    private likesInfoRepository: LikesInfoRepository,
  ) {}
  async getLikesByPostId(postId: string): Promise<LikeCreateDTO[]> {
    return this.likeModel.find({
      postOrCommentId: postId,
      status: Status.Like,
    });
  }
  getLikes(id: string) {
    return this.likesInfoRepository.getLikes(id);
  }

  async getLikeStatusCurrentUser(
    commentOrPostId: string,
    userId?: string,
  ): Promise<string> {
    if (!userId) {
      return Status.None;
    }

    const likeInfo: LikeCreateDTO | null =
      await this.likesInfoRepository.getLikeInfo(userId, commentOrPostId);
    return likeInfo ? likeInfo.status : Status.None;
  }
  async getLastLikes(id: string): Promise<LikeViewDTO[]> {
    const likesArr = await this.getLikesByPostId(id);

    return Promise.all(
      likesArr
        .sort(function (a, b) {
          return a.createdAt < b.createdAt
            ? -1
            : a.createdAt > b.createdAt
            ? 1
            : 0;
        })
        .reverse()
        .map(async (lastLikes) => {
          return {
            addedAt: lastLikes.createdAt.toISOString(),
            userId: lastLikes.userId,
            login: lastLikes.userLogin,
          };
        })
        .slice(0, 3),
    );
  }
}
