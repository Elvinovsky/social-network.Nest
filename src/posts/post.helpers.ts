import { Like, LikeModel, PostDocument } from './post.schemas';
import { LikeDBInfo, LikeInfoView, PostViewDTO } from './post.models';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { LikeAndDisQuantity } from '../likes/like.helpers';

export const postsMapping = async (
  array: Array<PostDocument>,
  userId?: string,
): Promise<PostViewDTO[]> => {
  return Promise.all(
    array.map(async (el) => {
      const status = await likesQueryRepo.getLikeStatusCurrentUser(
        el._id,
        userId,
      );

      const countsLikeAndDis = await likesOrDisCount(el._id);

      const lastLikes: LikeInfoView[] = await likesQueryRepo.getLastLikes(
        el._id,
      );

      return {
        id: el._id.toString(),
        title: el.title,
        shortDescription: el.shortDescription,
        content: el.content,
        blogId: el.blogId,
        blogName: el.blogName,
        createdAt: el.createdAt,
        extendedLikesInfo: {
          likesCount: countsLikeAndDis.likes,
          dislikesCount: countsLikeAndDis.disLikes,
          myStatus: status,
          newestLikes: lastLikes,
        },
      };
    }),
  );
};
@Injectable()
export class PostMapping {
  constructor(
    @InjectModel(Like.name) private likeModel: LikeModel,
    private readonly likeAndDisQuantity: LikeAndDisQuantity,
  ) {}
  async map(post: PostDocument, userId?: string): Promise<PostViewDTO> {
    const status = await likesQueryRepo.getLikeStatusCurrentUser(
      post._id,
      userId,
    );

    const countsLikeAndDis = await this.likeAndDisQuantity.count(
      post._id.toString(),
    );

    const likes: LikeDBInfo[] = await LikeModelClass.find({
      postOrCommentId: post._id.toString(),
      status: 'Like',
    });

    const lastLikes: LikeInfoView[] = await Promise.all(
      likes
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

    return {
      id: post._id.toString(),
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId,
      blogName: post.blogName,
      createdAt: post.addedAt,
      extendedLikesInfo: {
        likesCount: countsLikeAndDis.likes,
        dislikesCount: countsLikeAndDis.disLikes,
        myStatus: status,
        newestLikes: lastLikes,
      },
    };
  }
}
