import { Injectable } from '@nestjs/common';
import { LikeCreateDTO, LikeViewDTO } from '../dto/like.models';
import { Status } from '../../infrastructure/common/constants';
import { LikesRawSqlRepository } from '../infrastructure/repositories/sql/likes-raw-sql.repository';

@Injectable()
export class LikesService {
  constructor(private readonly likesRepository: LikesRawSqlRepository) {}
  async getLastLikes(id: string): Promise<LikeViewDTO[]> {
    const likesArr: LikeCreateDTO[] = await this.likesRepository.getLikes(id);

    return Promise.all(
      likesArr
        .sort(function (a, b) {
          return a.addedAt < b.addedAt ? -1 : a.addedAt > b.addedAt ? 1 : 0;
        })
        .reverse()
        .map(async (lastLikes) => {
          return {
            addedAt: lastLikes.addedAt.toISOString(),
            userId: lastLikes.userId,
            login: lastLikes.userLogin,
          };
        })
        .slice(0, 3),
    );
  }

  async countLikesDisLikes(id: string) {
    const likes = await this.likesRepository.countLikes(id);
    const disLikes = await this.likesRepository.countDisLikes(id);

    return { likes, disLikes };
  }

  async getLikeStatusCurrentUser(
    commentOrPostId: string,
    userId?: string,
  ): Promise<string> {
    debugger;
    if (!userId) {
      return Status.None;
    }

    const likeInfo: LikeCreateDTO | null =
      await this.likesRepository.getLikeInfo(userId, commentOrPostId);

    return likeInfo ? likeInfo.status : Status.None;
  }
}
