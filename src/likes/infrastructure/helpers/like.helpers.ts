// import { Injectable } from '@nestjs/common';
// import { InjectModel } from '@nestjs/mongoose';
// import { Like, LikeModel } from './like.schemas';
// import { Status } from '../common/constant';
// import { LikesRepository } from './likes.repositories';
// @Injectable()
// export class LikeAndDisCounter {
//   constructor(
//     private likesRepository: LikesRepository,
//     @InjectModel(Like.name) private likeModel: LikeModel,
//   ) {}
//   async count(id: string): Promise<{ likes: number; disLikes: number }> {
//     const likes = await this.likeModel.countDocuments({
//       postOrCommentId: id,
//       status: Status.Like,
//     });
//     const disLikes = await this.likeModel.countDocuments({
//       postOrCommentId: id,
//       status: Status.Dislike,
//     });
//
//     return {
//       likes,
//       disLikes,
//     };
//   }
// }

import { UserInfo } from '../../../users/dto/view/user-view.models';
import { LikeCreateDTO } from '../../dto/like.models';

class LikeCreator extends LikeCreateDTO {
  create(
    postOrCommentId: string,
    userInfo: UserInfo,
    statusType: string,
  ): LikeCreateDTO {
    const newLike: LikeCreateDTO = new LikeCreator();
    newLike.status = statusType;
    newLike.userId = userInfo.userId;
    newLike.userLogin = userInfo.userLogin;
    newLike.postIdOrCommentId = postOrCommentId;
    newLike.addedAt = new Date();
    newLike.isBanned = false;

    return newLike;
  }
}

export const likeCreator = new LikeCreator();
