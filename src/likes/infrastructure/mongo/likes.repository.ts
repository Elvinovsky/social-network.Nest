import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { LikeCreateDTO } from '../../like.models';
import { Like, LikeModel } from '../../like.schemas';
import { Status } from '../../../common/constants';
import { UserInfo } from '../../../users/user.models';

@Injectable()
export class LikesRepository {
  constructor(@InjectModel(Like.name) private likeModel: LikeModel) {}
  async countLikes(id: string): Promise<number> {
    const likes = await this.likeModel.countDocuments({
      postIdOrCommentId: id,
      status: Status.Like,
      isBanned: { $ne: true },
    });
    return likes;
  }
  async countDisLikes(id: string): Promise<number> {
    const disLikes = await this.likeModel.countDocuments({
      postIdOrCommentId: id,
      status: Status.Dislike,
      isBanned: { $ne: true },
    });
    return disLikes;
  }
  async getLikes(id: string): Promise<LikeCreateDTO[]> {
    return this.likeModel.find({
      postIdOrCommentId: id,
      status: Status.Like,
      isBanned: { $ne: true },
    });
  }
  async getLikeInfo(
    userId: string,
    postOrCommentId: string,
  ): Promise<LikeCreateDTO | null> {
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
