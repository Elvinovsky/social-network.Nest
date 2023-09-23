import {
  PaginatorType,
  QueryInputModel,
} from '../../../../pagination/pagination.models';
import { CommentViewDTO } from '../../../comment.models';
import { InjectModel } from '@nestjs/mongoose';
import {
  Comment,
  CommentDocument,
  CommentModel,
} from '../../../comment.schemas';
import { CommentMapper } from '../../../helpers/comment.mapping';
import { Post, PostModel } from '../../../../posts/post.schemas';
import {
  getDirection,
  getPageNumber,
  getPageSize,
  getSkip,
  getSortBy,
  pagesCountOfBlogs,
} from '../../../../pagination/pagination.helpers';
import { DEFAULT_PAGE_SortBy } from '../../../../common/constants';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

export class CommentsQueryRawSqlRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    private readonly commentMapper: CommentMapper,
  ) {}
  async getCommentsByPostId(
    postId: string,
    pageNumber: number,
    pageSize: number,
    sortBy: string,
    sortDirection: string,
    userId?: string,
  ): Promise<PaginatorType<CommentViewDTO[]> | null> {
    const queryString = `
       SELECT 
            c."id" as "id",
            c."content" as "content",
            c."userId" as "userId",
            u."login" as "userLogin",
            c."addedAt" AS "createdAt",
            SUM(CASE WHEN l."status" = 'Like' THEN 1 ELSE 0 END) as "likesCount",
            SUM(CASE WHEN l."status" = 'DisLike' THEN 1 ELSE 0 END) as "disLikesCount",
            MAX(CASE WHEN l."userId" = $2 THEN l."status" ELSE null END) as "myStatus"
      FROM 
            "features"."comments" c
      LEFT JOIN 
             "user"."accountData" u
      ON 
             u."id" = c."userId"
      LEFT JOIN 
            "features"."likes" l
      ON
            l."userId" = u."id"
            and l."postIdOrCommentId" = c."id"
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
            c."${sortBy}" ${sortDirection === 'asc' ? 'asc' : 'desc'}
      OFFSET $3 
      LIMIT $4`; // todo добавить валидацию на офсет для ограничения пролистования записей .

    const comments = await this.dataSource
      .query(queryString, [
        postId,
        userId,
        getSkip(pageNumber, pageSize),
        pageSize,
      ])
      .then()
      .catch((e) => console.log(e));
    const commentsMap = await comments.map((el) => {
      return {
        id: el.id,
        content: el.content,
        commentatorInfo: {
          userId: el.userId,
          userLogin: el.userLogin,
        },
        likesInfo: {
          likesCount: el.likesCount,
          dislikesCount: el.dislikesCount,
          myStatus: el.myStatus ? el.myStatus : 'None',
        },
        createdAt: el.createdAt.toISOString(),
      };
    });

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
      items: commentsMap,
    };
  }
}
