import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PaginatorType } from '../../../../infrastructure/pagination/pagination.models';
import { PostViewDTO } from '../../../dto/post.models';
import {
  getSkip,
  pagesCountOfBlogs,
} from '../../../../infrastructure/pagination/pagination.helpers';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { IPostQueryRepository } from '../../../../infrastructure/repositoriesModule/repositories.module';
import { PostMapper } from '../../helpers/post-mapper';

@Injectable()
export class PostsRawSqlQueryRepository implements IPostQueryRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    private postMapper: PostMapper,
  ) {}

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
                    p."id",
                    p."title",
                    p."shortDescription", 
                    p."content",
                    p."blogId", 
                    p."blogName",
                    p."addedAt",
                    SUM(CASE WHEN l."status" = 'Like' THEN 1 ELSE 0 END) as "likesCount",
                    SUM(CASE WHEN l."status" = 'Dislike' THEN 1 ELSE 0 END) as "dislikesCount"
            FROM 
                    "features"."posts" p
            LEFT JOIN 
                    "features"."likes" l
            ON
                    l."postIdOrCommentId" = p."id"
                    and l."isBanned" = false
            WHERE 
                    p."title" ilike $1
            GROUP BY
                    p."id",
                    p."title", 
                    p."shortDescription",  
                    p."content",
                    p."blogId", 
                    p."blogName", 
                    p."addedAt"
            ORDER BY 
                    "${sortBy}" ${sortDirection === 'asc' ? 'Asc' : 'Desc'}
            OFFSET  $2 
            LIMIT   $3`;

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

    return {
      pagesCount: pagesCountOfBlogs(+calculateOfFiles[0].totalCount, pageSize),
      page: pageNumber,
      pageSize: pageSize,
      totalCount: +calculateOfFiles[0].totalCount,
      items: await this.postMapper.mapPosts(foundPosts, userId),
    };
  }

  async getPostById(
    postId: string,
    userId?: string,
  ): Promise<PostViewDTO | null> {
    try {
      const post = await this.dataSource.query(
        `
       SELECT 
                p."id", 
                p."title", 
                p."shortDescription",  
                p."content", 
                p."blogId", 
                p."blogName", 
                p."addedAt" as "createdAt",
                SUM(CASE WHEN l."status" = 'Like' THEN 1 ELSE 0 END) as "likesCount",
                SUM(CASE WHEN l."status" = 'Dislike' THEN 1 ELSE 0 END) as "dislikesCount"
       FROM 
                "features"."posts" p 
       LEFT JOIN 
                "features"."likes" l
       ON
                l."postIdOrCommentId" = p."id"
                and l."isBanned" = false
       WHERE 
                p."id" = $1
       GROUP BY
                p."id",
                p."title", 
                p."shortDescription",  
                p."content",
                p."blogId", 
                p."blogName", 
                p."addedAt";
      `,
        [postId],
      );

      if (post.length < 1) {
        return null;
      }

      return this.postMapper.mapPost(post, userId);
    } catch (e) {
      console.log(e, 'error getPostById method');
      throw new HttpException('failed', HttpStatus.EXPECTATION_FAILED);
    }
  }
}
