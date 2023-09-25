import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { PostMapper } from '../../post.helpers';
import {
  BlogPostInputModel,
  PostCreateDTO,
  PostViewDTO,
} from '../../post.models';

@Injectable()
export class PostsRawSqlRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    private readonly postMapper: PostMapper,
  ) {}

  async findPostById(postId: string): Promise<boolean> {
    return this.dataSource
      .query(
        `
    SELECT "title", "blogId"
    FROM "features"."posts" 
    WHERE "id" = $1
    `,
        [postId],
      )
      .then((result) => result.length === 1)
      .catch((error) => Promise.reject(error));
  }

  async createPost(inputModel: PostCreateDTO): Promise<PostViewDTO> {
    await this.dataSource
      .query(
        `
    INSERT INTO "features"."posts"(
    "id", "title", "shortDescription", "content", "blogId", "blogName", "addedAt")
        VALUES ($1, $2, $3, $4, $5, $6, $7);
    `,
        [
          inputModel.id,
          inputModel.title,
          inputModel.shortDescription,
          inputModel.content,
          inputModel.blogId,
          inputModel.blogName,
          inputModel.addedAt,
        ],
      )
      .catch((error) => Promise.reject(console.log(error)));

    return this.postMapper.mapPost(inputModel);
  }

  async updatePostById(
    postId: string,
    blogId: string,
    inputModel: BlogPostInputModel,
  ): Promise<boolean> {
    return this.dataSource
      .query(
        `
      UPDATE "features"."posts"
      SET  "title" = $3, "shortDescription" = $4, "content"=$5
      WHERE "id" = $1 and "blogId" = $2;
      `,
        [
          postId,
          blogId,
          inputModel.title,
          inputModel.shortDescription,
          inputModel.content,
        ],
      )
      .then((result) => result[1] === 1)
      .catch((error) => error);
  }

  async deletePost(postId: string): Promise<boolean | null> {
    return this.dataSource
      .query(
        `
      DELETE FROM features.posts
      WHERE "id" = $1;
      `,
        [postId],
      )
      .then((result) => result[1] === 1)
      .catch((error) => error);
  }
}
