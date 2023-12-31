import { PostCreateDTO, PostViewDTO } from '../../dto/post.models';
import { Injectable } from '@nestjs/common';
import { LikesService } from '../../../likes/application/likes.service';
import { LikeViewDTO } from '../../../likes/dto/like.models';

@Injectable()
export class PostMapper {
  constructor(private readonly likesService: LikesService) {}
  async mapPosts(
    array: Array<PostCreateDTO>,
    userId?: string,
  ): Promise<PostViewDTO[]> {
    try {
      const posts = await Promise.all(
        array.map(async (el) => {
          debugger;
          const status = await this.likesService.getLikeStatusCurrentUser(
            el.id,
            userId,
          );

          const countsLikeAndDis = await this.likesService.countLikesDisLikes(
            el.id,
          );

          const lastLikes: LikeViewDTO[] = await this.likesService.getLastLikes(
            el.id,
          );

          return {
            id: el.id,
            title: el.title,
            shortDescription: el.shortDescription,
            content: el.content,
            blogId: el.blogId,
            blogName: el.blogName,
            createdAt: el.addedAt.toISOString(),
            extendedLikesInfo: {
              likesCount: countsLikeAndDis.likes,
              dislikesCount: countsLikeAndDis.disLikes,
              myStatus: status,
              newestLikes: lastLikes,
            },
          };
        }),
      );
      return posts;
    } catch (e) {
      console.log(e);
      throw new Error();
    }
  }
  async mapPost(post: PostCreateDTO, userId?: string): Promise<PostViewDTO> {
    const status = await this.likesService.getLikeStatusCurrentUser(
      post.id,
      userId,
    );
    console.log(status);
    const countsLikeAndDis = await this.likesService.countLikesDisLikes(
      post.id,
    );

    const lastLikes: LikeViewDTO[] = await this.likesService.getLastLikes(
      post.id,
    );

    return {
      id: post.id,
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId,
      blogName: post.blogName,
      createdAt: post.addedAt.toISOString(),
      extendedLikesInfo: {
        likesCount: countsLikeAndDis.likes,
        dislikesCount: countsLikeAndDis.disLikes,
        myStatus: status,
        newestLikes: lastLikes,
      },
    };
  }
}
