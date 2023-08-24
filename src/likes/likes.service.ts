import { Injectable } from '@nestjs/common';
import { LikesRepository } from './likes.repository';
import { LikeCreateDTO, LikeViewDTO } from './like.models';
import { Status } from '../common/constants';
import { UsersService } from '../users/aplication/users.service';
import { UserViewDTO } from '../users/user.models';

@Injectable()
export class LikesService {
  constructor(
    private likesRepository: LikesRepository,
    private readonly usersService: UsersService,
  ) {}
  async createOrUpdateLike(
    postOrCommentId: string,
    userId: string,
    statusType: string,
  ) {
    try {
      const currentUser: UserViewDTO | null = await this.usersService.getUser(
        userId,
      );
      if (!currentUser) {
        return Error;
      }
      const isAlreadyLiked: LikeCreateDTO | null =
        await this.likesRepository.getLikeInfo(userId, postOrCommentId);

      //если пользователь не ставил ранне оценку коментарию или посту
      if (!isAlreadyLiked) {
        const newLikeInfo = await this.likesRepository.addLikeInfo(
          userId,
          currentUser.login,
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
        userId,
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
}
