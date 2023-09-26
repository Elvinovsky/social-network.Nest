import {
  HttpException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CommentMapper } from '../../../helpers/comment.mapping';
import { CommentCreateDTO, CommentViewDTO } from '../../../comment.models';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class CommentsRawSqlRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    private readonly commentMapper: CommentMapper,
  ) {}
  async getCommentById(commentId: string, userId: string) {
    try {
      const result = await this.dataSource.query(
        `
      SELECT 
            c."id" as "id",
            c."content" as "content",
            c."userId" as "userId",
            u."login" as "userLogin",
            c."addedAt" as "createdAt",
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
            c."id" = $1
      GROUP BY
            c."id",
            c."content",
            c."userId",
            u."login",
            c."addedAt";
      `,
        [commentId],
      );

      const myStatus = await this.dataSource.query(
        `
      SELECT "status"
      FROM "features"."likes"
      WHERE "postIdOrCommentId" = $1 and "userId" = $2
      `,
        [commentId, userId],
      );

      if (result.length < 1) return null;

      return {
        id: result[0].id,
        content: result[0].content,
        commentatorInfo: {
          userId: result[0].userId,
          userLogin: result[0].userLogin,
        },
        likesInfo: {
          likesCount: +result[0].likesCount,
          dislikesCount: +result[0].dislikesCount,
          myStatus: myStatus.length < 1 ? 'None' : myStatus[0].status,
        },
        createdAt: result[0].createdAt,
      };
    } catch (e) {
      console.log(e, 'error getCommentById');
      throw new HttpException('server error', 500);
    }
  }

  async addNewComment(newComment: CommentCreateDTO): Promise<CommentViewDTO> {
    try {
      const comment = await this.dataSource.query(
        `
      INSERT INTO "features"."comments"(
             "id", "postId", "content", "userId", "addedAt", "isBanned")
      VALUES ($1, $2, $3, $4, $5, false);
      `,
        [
          newComment.id,
          newComment.postId,
          newComment.content,
          newComment.commentatorInfo.userId,
          newComment.addedAt,
        ],
      );

      return this.commentMapper.comment(newComment);
    } catch (e) {
      console.log(e, 'error addNewComment method');
      throw new InternalServerErrorException();
    }
  }

  async updateCommentById(
    commentId: string,
    content: string,
  ): Promise<boolean> {
    const result = await this.dataSource.query(
      `
    UPDATE 
            "features"."comments"
    SET    
            "content" = $2
    WHERE 
            "id" = $1
    
    `,
      [commentId, content],
    );
    return result[1] === 1;
  }

  async findCommentById(
    commentId: string,
  ): Promise<CommentCreateDTO | boolean> {
    try {
      const result = await this.dataSource.query(
        `
       SELECT 
                "id", "postId", "content", "userId", "addedAt", "isBanned"
       FROM 
                "features"."comments"
        WHERE 
                "id" = $1;
             
      `,
        [commentId],
      );
      if (result.length < 1 || result[0].isBanned) return false;

      return {
        id: result[0].id,
        content: result[0].content,
        postId: result[0].postId,
        commentatorInfo: {
          userId: result[0].userId,
          userLogin: result[0].userLogin,
          isBanned: result[0].isBanned,
        },
        addedAt: result[0].addedAt,
      };
    } catch (e) {
      console.log(e, 'error getCommentById');
      throw new HttpException('server error', 500);
    }
  }

  async deleteComment(commentId: string): Promise<boolean> {
    try {
      const resultDeleted = await this.dataSource.query(
        `
        DELETE FROM 
                    "features"."comments"
        WHERE
                    "id" = $1
        
    `,
        [commentId],
      );
      return resultDeleted[1] === 1;
    } catch (e) {
      console.log(e, 'error deleteComment');
      throw new HttpException('server error', 500);
    }
  }

  async banCommentsUserId(userId: string): Promise<boolean> {
    const bannedComments = await this.dataSource.query(
      `
        UPDATE 
                "features"."comments"
        SET 
                "isBanned" = true
        WHERE 
                "userId" = $1
        
    `,
      [userId],
    );
    return bannedComments[1] >= 1;
  }
  async unBanCommentsUserId(userId: string) {
    const unBannedComments = await this.dataSource.query(
      `
        UPDATE 
                "features"."comments"
        SET 
                "isBanned" = false
        WHERE 
                "userId" = $1
        
    `,
      [userId],
    );
    return unBannedComments[1] >= 1;
  }
}
