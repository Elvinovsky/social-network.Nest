import { Injectable } from '@nestjs/common';
import { Status } from './like.helpers';
import { InjectModel } from '@nestjs/mongoose';
import { Like, LikeModel } from '../posts/post.schemas';
import { LikeDBInfo, LikeInfoView } from '../posts/post.models';
import { LikesInfoRepository } from './likes.repository';

@Injectable()
export class LikesQueryRepo {
  constructor(
    @InjectModel(Like.name) private likeModel: LikeModel,
    private likesInfoRepository: LikesInfoRepository,
  ) {}
  async getLikesByPostId(postId: string): Promise<LikeDBInfo[]> {
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
      return 'None';
    }

    const likeInfo: LikeDBInfo | null =
      await this.likesInfoRepository.getLikeInfo(userId, commentOrPostId);
    return likeInfo ? likeInfo.status : 'None';
  }
  async getLastLikes(id: string): Promise<LikeInfoView[]> {
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
