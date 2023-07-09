import { Like, LikeModel } from '../posts/post.schemas';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

export enum Status {
  None = 'None',
  Like = 'Like',
  Dislike = 'Dislike',
}
@Injectable()
export class LikeAndDisQuantity {
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
