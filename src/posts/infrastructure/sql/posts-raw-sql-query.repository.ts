import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PaginatorType } from '../../../pagination/pagination.models';
import { PostViewDTO } from '../../post.models';
import {
  getSkip,
  pagesCountOfBlogs,
} from '../../../pagination/pagination.helpers';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class PostsRawSqlQueryRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async getSortedPosts(
    pageNumber: number,
    pageSize: number,
    sortBy: string,
    sortDirection: string,
    userId?: string,
    searchTitleTerm?: string,
  ): Promise<PaginatorType<PostViewDTO[]>> {
    const getTitleTerm = (searchTitleTerm) =>
      searchTitleTerm ? `%${searchTitleTerm}%` : `%%`;

    const queryData = `
    SELECT 
        p."id", p."title", p."shortDescription",  p."content", p."blogId", p."blogName", p."addedAt"
    FROM "features"."posts" p
    WHERE p."title" ilike $1
    ORDER BY "${sortBy}" ${sortDirection === 'asc' ? 'Asc' : 'Desc'}
    OFFSET $2 LIMIT $3`;

    const foundPosts = await this.dataSource.query(queryData, [
      getTitleTerm(searchTitleTerm),
      getSkip(pageNumber, pageSize),
      pageSize,
    ]);

    const calculateOfFiles = await this.dataSource.query(
      `
    SELECT COUNT(*) as "totalCount"
    FROM(SELECT 
        p."id", p."title", p."shortDescription",  p."content", p."blogId", p."blogName", p."addedAt"
    FROM "features"."posts" p
    WHERE p."title" ilike $1)
    `,
      [getTitleTerm(searchTitleTerm)],
    );

    const usersMap = foundPosts.map((el) => {
      return {
        id: el.id,
        title: el.title,
        shortDescription: el.shortDescription,
        content: el.content,
        blogId: el.blogId,
        blogName: el.blogName,
        createdAt: el.addedAt.toISOString(),
        extendedLikesInfo: {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: 'None',
          newestLikes: [],
        },
      };
    });

    return {
      pagesCount: pagesCountOfBlogs(+calculateOfFiles[0].totalCount, pageSize),
      page: pageNumber,
      pageSize: pageSize,
      totalCount: +calculateOfFiles[0].totalCount,
      items: usersMap,
    };
  }

  async getPostById(
    postId: string,
    userId?: string,
  ): Promise<PostViewDTO | null> {
    try {
      const post = await this.dataSource.query(
        `
       SELECT p."id", p."title", p."shortDescription",  p."content", p."blogId", p."blogName", p."addedAt"
       FROM "features"."posts" p 
       WHERE "id" = $1
      `,
        [postId],
      );

      if (post.length < 1) {
        return null;
      }

      return {
        id: post[0].id,
        title: post[0].title,
        shortDescription: post[0].shortDescription,
        content: post[0].content,
        blogId: post[0].blogId,
        blogName: post[0].blogName,
        createdAt: post[0].addedAt.toISOString(),
        extendedLikesInfo: {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: 'None',
          newestLikes: [],
        },
      };
    } catch (e) {
      console.log(e, 'error getPostById method');
      throw new HttpException('failed', HttpStatus.EXPECTATION_FAILED);
    }
  }
}
