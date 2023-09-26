import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PaginatorType } from '../../../pagination/pagination.models';
import { PostViewDTO } from '../../post.models';
import {
  getSkip,
  pagesCountOfBlogs,
} from '../../../pagination/pagination.helpers';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { LikesRawSqlRepository } from '../../../likes/infrastructure/sql/likes-raw-sql.repository';

@Injectable()
export class PostsRawSqlQueryRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    private likesRawSqlRepository: LikesRawSqlRepository,
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

    const usersMap = await Promise.all(
      foundPosts.map(async (el) => {
        return {
          id: el.id,
          title: el.title,
          shortDescription: el.shortDescription,
          content: el.content,
          blogId: el.blogId,
          blogName: el.blogName,
          createdAt: el.addedAt.toISOString(),
          extendedLikesInfo: {
            likesCount: +el.likesCount,
            dislikesCount: +el.dislikesCount,
            myStatus: await this.likesRawSqlRepository.currentStatus(
              el.id,
              userId,
            ),
            newestLikes: await this.likesRawSqlRepository.newestLikes(el.id),
          },
        };
      }),
    );

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

      return {
        id: post[0].id,
        title: post[0].title,
        shortDescription: post[0].shortDescription,
        content: post[0].content,
        blogId: post[0].blogId,
        blogName: post[0].blogName,
        createdAt: post[0].createdAt.toISOString(),
        extendedLikesInfo: {
          likesCount: +post[0].likesCount,
          dislikesCount: +post[0].dislikesCount,
          myStatus: await this.likesRawSqlRepository.currentStatus(
            postId,
            userId,
          ),
          newestLikes: await this.likesRawSqlRepository.newestLikes(postId),
        },
      };
    } catch (e) {
      console.log(e, 'error getPostById method');
      throw new HttpException('failed', HttpStatus.EXPECTATION_FAILED);
    }
  }
}
