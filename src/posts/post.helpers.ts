import { PostViewDTO } from './post.models';
import { Injectable } from '@nestjs/common';
import { LikesService } from '../likes/likes.service';
import { LikeViewDTO } from '../likes/like.models';
import { PostDocument } from './post.schemas';

@Injectable()
export class PostMapper {
  constructor(private readonly likesService: LikesService) {}
  async mapPosts(
    array: Array<PostDocument>,
    userId?: string,
  ): Promise<PostViewDTO[]> {
    return Promise.all(
      array.map(async (el) => {
        const status = await this.likesService.getLikeStatusCurrentUser(
          el.id,
          userId,
        );

        const countsLikeAndDis = await this.likesService.countLikesDisLikes(
          el._id.toString(),
        );

        const lastLikes: LikeViewDTO[] = await this.likesService.getLastLikes(
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
    const status = await this.likesService.getLikeStatusCurrentUser(
      post._id.toString(),
      userId,
    );

    const countsLikeAndDis = await this.likesService.countLikesDisLikes(
      post._id.toString(),
    );

    const lastLikes: LikeViewDTO[] = await this.likesService.getLastLikes(
      post._id.toString(),
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
