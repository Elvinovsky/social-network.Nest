import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { LikeCreateDTO } from '../../../dto/like.models';
import {
  LikeModel,
  LikeMongooseEntity,
} from '../../../entitties/mongoose/like-no-sql.schemas';
import { Status } from '../../../../infrastructure/common/constants';
import { ILikesRepository } from '../../../../infrastructure/repositoriesModule/repositories.module';

@Injectable()
export class LikesRepository implements ILikesRepository {
  constructor(
    @InjectModel(LikeMongooseEntity.name) private readonly likeModel: LikeModel,
  ) {}
  async countLikes(id: string): Promise<number> {
    const likes = await this.likeModel.countDocuments({
      postIdOrCommentId: id,
      status: Status.Like,
      isBanned: { $ne: true },
    });
    return likes ? likes : 0;
  }
  async countDisLikes(id: string): Promise<number> {
    const disLikes = await this.likeModel.countDocuments({
      postIdOrCommentId: id,
      status: Status.Dislike,
      isBanned: { $ne: true },
    });
    return disLikes ? disLikes : 0;
  }
  async getLikes(id: string): Promise<LikeCreateDTO[]> {
    return this.likeModel.find({
      postIdOrCommentId: id,
      status: Status.Like,
      isBanned: { $ne: true },
    });
  }
  async getLikeInfo(
    postOrCommentId: string,
    userId?: string,
  ): Promise<LikeCreateDTO | null> {
    if (!userId) {
      return null;
    }

    const likeInfo: LikeCreateDTO | null = await this.likeModel
      .findOne({
        userId: userId,
        postIdOrCommentId: postOrCommentId,
        isBanned: { $ne: true },
      })
      .exec();
    return likeInfo;
  }
  async updateLikeInfo(
    userId: string,
    postOrCommentId: string,
    statusType: string,
  ): Promise<boolean> {
    const result = await this.likeModel.updateOne(
      {
        userId: userId,
        postIdOrCommentId: postOrCommentId,
      },
      { $set: { status: statusType } },
    );
    return result.matchedCount === 1;
  }
  async addLikeInfo(inputModel: LikeCreateDTO): Promise<boolean> {
    const newLikeInfo = new this.likeModel(inputModel);

    await newLikeInfo.save();
    return !!newLikeInfo;
  }
  async banLikes(userId: string): Promise<boolean> {
    return !!(await this.likeModel.updateMany(
      { userId: userId },
      {
        $set: {
          isBanned: true,
        },
      },
    ));
  }

  async unBanLikes(userId: string): Promise<boolean> {
    return !!(await this.likeModel.updateMany(
      { userId: userId },
      { $set: { isBanned: false } },
    ));
  }
}
