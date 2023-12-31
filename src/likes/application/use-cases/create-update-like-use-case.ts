import { UserInfo } from '../../../users/dto/view/user-view.models';
import { LikeCreateDTO } from '../../dto/like.models';
import { likeCreator } from '../../infrastructure/helpers/like.helpers';
import { ILikesRepository } from '../../../infrastructure/repositoriesModule/repositories.module';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class CreateUpdateLikeCommand {
  constructor(public inputModel: CreateUpdateLikeModel) {}
}

@CommandHandler(CreateUpdateLikeCommand)
export class CreateUpdateLikeUseCase
  implements ICommandHandler<CreateUpdateLikeCommand>
{
  constructor(private readonly likesRepository: ILikesRepository) {}

  async execute(command: CreateUpdateLikeCommand) {
    try {
      const isAlreadyLiked: LikeCreateDTO | null =
        await this.likesRepository.getLikeInfo(
          command.inputModel.userInfo.userId,
          command.inputModel.postOrCommentId,
        );

      //если пользователь не ставил ранне оценку коментарию или посту
      if (!isAlreadyLiked) {
        const newLikeInfo = likeCreator.create(
          command.inputModel.postOrCommentId,
          command.inputModel.userInfo,
          command.inputModel.statusType,
        );

        return this.likesRepository.addLikeInfo(newLikeInfo);
      }

      // если отправленный статус совпадает с существующим в БД
      if (isAlreadyLiked.status === command.inputModel.statusType) {
        return true;
      }

      // если отправленный статус не совпадает с существующий статусом в БД
      const changeLikeInfo = await this.likesRepository.updateLikeInfo(
        command.inputModel.userInfo.userId,
        command.inputModel.postOrCommentId,
        command.inputModel.statusType,
      );

      return changeLikeInfo;
    } catch (error) {
      console.log('CreateUpdateLikeUseCase.createOrUpdateLike', error);
      return false;
    }
  }
}

export type CreateUpdateLikeModel = {
  postOrCommentId: string;
  userInfo: UserInfo;
  statusType: string;
};
