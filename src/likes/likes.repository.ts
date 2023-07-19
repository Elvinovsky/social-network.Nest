import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { LikeDBInfo } from './like.models';
import { Like, LikeModel } from './like.schemas';
import { Status } from '../common/constant';

@Injectable()
export class LikesInfoRepository {
  constructor(@InjectModel(Like.name) private likeModel: LikeModel) {}
  async testDeleteDb() {
    await this.likeModel.deleteMany({});
  }
  async getLikes(id: string): Promise<LikeDBInfo[]> {
    return this.likeModel.find({
      postOrCommentId: id,
      status: Status.Like,
    });
  }
  async getLikeInfo(userId: string, postOrCommentId: string) {
    return this.likeModel.findOne({
      userId: userId,
      postOrCommentId: postOrCommentId,
    });
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
    userId: string,
    userLogin: string,
    postOrCommentId: string,
    statusType: string,
  ) {
    const newLikeInfo = new this.likeModel({
      status: statusType,
      userId,
      userLogin,
      postOrCommentId: postOrCommentId,
      createdAt: new Date(),
    });

    await newLikeInfo.save();
    return !!newLikeInfo;
  }
}
