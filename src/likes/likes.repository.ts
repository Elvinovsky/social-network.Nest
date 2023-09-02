import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { LikeCreateDTO } from './like.models';
import { Like, LikeModel } from './like.schemas';
import { Status } from '../common/constants';
import { UserInfo } from '../users/user.models';

@Injectable()
export class LikesRepository {
  constructor(@InjectModel(Like.name) private likeModel: LikeModel) {}
  async countLikes(id: string) {
    const likes = await this.likeModel.countDocuments({
      postOrCommentId: id,
      status: Status.Like,
      isBanned: { $ne: true },
    });
    return likes;
  }
  async countDisLikes(id: string) {
    const disLikes = await this.likeModel.countDocuments({
      postOrCommentId: id,
      status: Status.Dislike,
      isBanned: { $ne: true },
    });
    return disLikes;
  }
  async getLikes(id: string): Promise<LikeCreateDTO[]> {
    return this.likeModel.find({
      postOrCommentId: id,
      status: Status.Like,
      isBanned: { $ne: true },
    });
  }
  async getLikeInfo(userId: string, postOrCommentId: string) {
    return this.likeModel
      .findOne({
        userId: userId,
        postOrCommentId: postOrCommentId,
        isBanned: { $ne: true },
      })
      .exec();
  }
  async updateLikeInfo(
    userId: string,
    postOrCommentId: string,
    statusType: string,
  ): Promise<boolean> {
    const result = await this.likeModel.updateOne(
      {
        userId: userId,
        postOrCommentId: postOrCommentId,
      },
      { $set: { status: statusType } },
    );
    return result.matchedCount === 1;
  }
  async addLikeInfo(
    userInfo: UserInfo,
    postOrCommentId: string,
    statusType: string,
  ) {
    const newLikeInfo = new this.likeModel({
      status: statusType,
      userId: userInfo.userId,
      userLogin: userInfo.userLogin,
      postOrCommentId: postOrCommentId,
      createdAt: new Date(),
      isBanned: false,
    });

    await newLikeInfo.save();
    return !!newLikeInfo;
  }
  async banLikes(userId: string) {
    return this.likeModel.updateMany(
      { userId: userId },
      {
        $set: {
          isBanned: true,
        },
      },
    );
  }

  unBanLikes(userId: string) {
    return this.likeModel.updateMany(
      { userId: userId },
      { $set: { isBanned: false } },
    );
  }
}
