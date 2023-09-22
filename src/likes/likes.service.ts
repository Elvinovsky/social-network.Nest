import { Injectable } from '@nestjs/common';
import { LikesRepository } from './likes.repository';
import { LikeCreateDTO, LikeViewDTO } from './like.models';
import { Status } from '../common/constants';
import { UserInfo } from '../users/user.models';
@Injectable()
export class LikesService {
  constructor(private likesRepository: LikesRepository) {}
  async createOrUpdateLike(
    postOrCommentId: string,
    userInfo: UserInfo,
    statusType: string,
  ) {
    try {
      const isAlreadyLiked: LikeCreateDTO | null =
        await this.likesRepository.getLikeInfo(
          userInfo.userId,
          postOrCommentId,
        );

      //если пользователь не ставил ранне оценку коментарию или посту
      if (!isAlreadyLiked) {
        const newLikeInfo = await this.likesRepository.addLikeInfo(
          userInfo,
          postOrCommentId,
          statusType,
        );

        return newLikeInfo;
      }

      // если отправленный статус совпадает с существующим в БД
      if (isAlreadyLiked.status === statusType) {
        return true;
      }

      // если отправленный статус не совпадает с существующий статусом в БД
      const changeLikeInfo = await this.likesRepository.updateLikeInfo(
        userInfo.userId,
        postOrCommentId,
        statusType,
      );

      return changeLikeInfo;
    } catch (error) {
      console.log('FeedbackService.createOrUpdateLike', error);
      return false;
    }
  }
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
  async banLikes(userId: string) {
    return this.likesRepository.banLikes(userId);
  }
  async unBanLikes(userId: string) {
    return this.likesRepository.unBanLikes(userId);
  }
}
