import { PostViewDTO } from './post.models';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { LikeAndDisCounter } from '../likes/like.helpers';
import { LikesQueryRepo } from '../likes/likes.query.repo';
import { LikeCreateDTO, LikeViewDTO } from '../likes/like.models';
import { Like, LikeModel } from '../likes/like.schemas';
import { PostDocument } from './post.schemas';

@Injectable()
export class PostMapper {
  constructor(
    @InjectModel(Like.name) private likeModel: LikeModel,
    private readonly likesCountService: LikeAndDisCounter,
    private readonly likesQueryRepo: LikesQueryRepo,
  ) {}
  async mapPosts(
    array: Array<PostDocument>,
    userId?: string,
  ): Promise<PostViewDTO[]> {
    return Promise.all(
      array.map(async (el) => {
        const status = await this.likesQueryRepo.getLikeStatusCurrentUser(
          el._id.toString(),
          userId,
        );

        const countsLikeAndDis = await this.likesCountService.count(
          el._id.toString(),
        );

        const lastLikes: LikeViewDTO[] = await this.likesQueryRepo.getLastLikes(
          el._id.toString(),
        );

        return {
          id: el._id.toString(),
          title: el.title,
          shortDescription: el.shortDescription,
          content: el.content,
          blogId: el.blogId,
          blogName: el.blogName,
          createdAt: el.addedAt,
          extendedLikesInfo: {
            likesCount: countsLikeAndDis.likes,
            dislikesCount: countsLikeAndDis.disLikes,
            myStatus: status,
            newestLikes: lastLikes,
          },
        };
      }),
    );
  }
  async mapPost(post: PostDocument, userId?: string): Promise<PostViewDTO> {
    const status = await this.likesQueryRepo.getLikeStatusCurrentUser(
      post._id.toString(),
      userId,
    );

    const countsLikeAndDis = await this.likesCountService.count(
      post._id.toString(),
    );

    const likes: LikeCreateDTO[] = await this.likesQueryRepo.getLikes(
      post._id.toString(),
    );

    const lastLikes: LikeViewDTO[] = await Promise.all(
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
