import { Injectable } from '@nestjs/common';
import { LikesRepository } from './likes.repository';
import { LikeCreateDTO, LikeViewDTO } from './like.models';
import { Status } from '../common/constants';

@Injectable()
export class LikesService {
  constructor(private likesRepository: LikesRepository) {}
  async countLikesDisLikes(id: string) {
    const likes = await this.likesRepository.countLikes(id);
    const disLikes = await this.likesRepository.countDisLikes(id);

    return { likes, disLikes };
  }
  getLikes(id: string) {
    return this.likesRepository.getLikes(id);
  }

  async getLikeStatusCurrentUser(
    commentOrPostId: string,
    userId?: string,
  ): Promise<string> {
    if (!userId) {
      return Status.None;
    }

    const likeInfo: LikeCreateDTO | null =
      await this.likesRepository.getLikeInfo(userId, commentOrPostId);

    return likeInfo ? likeInfo.status : Status.None;
  }
  async getLastLikes(id: string): Promise<LikeViewDTO[]> {
    const likesArr: LikeCreateDTO[] = await this.likesRepository.getLikes(id);

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
