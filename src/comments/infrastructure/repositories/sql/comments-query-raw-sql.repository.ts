import { PaginatorType } from '../../../../infrastructure/pagination/pagination.models';
import { CommentViewDTO } from '../../../dto/comment.models';
import {
  getSkip,
  pagesCountOfBlogs,
} from '../../../../infrastructure/pagination/pagination.helpers';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { LikesRawSqlRepository } from '../../../../likes/infrastructure/repositories/sql/likes-raw-sql.repository';

export class CommentsQueryRawSqlRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    private likesRawSqlRepository: LikesRawSqlRepository,
  ) {}

  async getCommentsByPostId(
    postId: string,
    pageNumber: number,
    pageSize: number,
    sortBy: string,
    sortDirection: string,
    userId?: string,
  ): Promise<PaginatorType<CommentViewDTO[]> | null> {
    const post = await this.dataSource
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

    if (!post) return null;

    const queryString = `
       SELECT 
            c."id" as "id",
            c."content" as "content",
            c."userId" as "userId",
            u."login" as "userLogin",
            c."addedAt" AS "createdAt",
            SUM(CASE WHEN l."status" = 'Like' THEN 1 ELSE 0 END) as "likesCount",
            SUM(CASE WHEN l."status" = 'Dislike' THEN 1 ELSE 0 END) as "dislikesCount"
      FROM 
            "features"."comments" c
      LEFT JOIN 
             "user"."accountData" u
      ON 
             u."id" = c."userId"
      LEFT JOIN 
            "features"."likes" l
      ON
            l."postIdOrCommentId" = c."id"
            and l."isBanned" = false
      WHERE 
            c."postId" = $1
      GROUP BY
            c."id",
            c."content",
            c."userId",
            u."login",
            c."addedAt"
      ORDER BY 
            c."${sortBy}" ${sortDirection === 'asc' ? 'Asc' : 'Desc'}
      OFFSET $2 
      LIMIT $3`; // todo добавить валидацию на офсет для ограничения пролистования записей .

    const comments = await this.dataSource
      .query(queryString, [postId, getSkip(pageNumber, pageSize), pageSize])
      .then()
      .catch((e) => console.log(e));

    const commentsMap = Promise.all(
      comments.map(async (el) => {
        return {
          id: el.id,
          content: el.content,
          commentatorInfo: {
            userId: el.userId,
            userLogin: el.userLogin,
          },
          likesInfo: {
            likesCount: +el.likesCount,
            dislikesCount: +el.dislikesCount,
            myStatus: await this.likesRawSqlRepository.currentStatus(
              el.id,
              userId,
            ),
          },
          createdAt: el.createdAt.toISOString(),
        };
      }),
    );

    const calculateOfFiles = await this.dataSource.query(
      `
        SELECT count(*) as "pages"
        FROM "features"."comments" 
        WHERE "postId" = $1
        `,
      [postId],
    );

    return {
      pagesCount: pagesCountOfBlogs(+calculateOfFiles[0].pages, pageSize),
      page: pageNumber,
      pageSize: pageSize,
      totalCount: +calculateOfFiles[0].pages,
      items: await commentsMap,
    };
  }
}
