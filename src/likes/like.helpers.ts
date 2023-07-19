import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Like, LikeModel } from './like.schemas';
import { Status } from '../common/constant';

@Injectable()
export class LikeAndDisCounter {
  constructor(@InjectModel(Like.name) private likeModel: LikeModel) {}
  async count(id: string): Promise<{ likes: number; disLikes: number }> {
    const likes = await this.likeModel.countDocuments({
      postOrCommentId: id,
      status: Status.Like,
    });
    const disLikes = await this.likeModel.countDocuments({
      postOrCommentId: id,
      status: Status.Dislike,
    });

    return {
      likes,
      disLikes,
    };
  }
}
