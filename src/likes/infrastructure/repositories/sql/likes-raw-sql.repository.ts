import { Injectable } from '@nestjs/common';
import { LikeCreateDTO } from '../../../dto/like.models';
import { Status } from '../../../../infrastructure/common/constants';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ILikesRepository } from '../../../../infrastructure/repositoriesModule/repositories.module';

@Injectable()
export class LikesRawSqlRepository implements ILikesRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}
  // async getLastLikes(postId: string) {
  //   const newestLikes = await this.dataSource.query(
  //     `
  //         SELECT
  //                   l."userId", u."login", l."addedAt"
  //         FROM
  //                   "features"."likes" l
  //         LEFT JOIN
  //                   "user"."accountData" u
  //         ON
  //                   u."id" = l."userId"
  //         WHERE
  //                   l."postIdOrCommentId" = $1
  //                   and "status" = $2
  //         ORDER BY
  //                   l."addedAt" Desc
  //         LIMIT 3
  //     `,
  //     [postId, Status.Like],
  //   );
  //   return newestLikes.length < 1 ? [] : newestLikes;
  // }
  // async currentStatus(commentId: string, userId?: string): Promise<string>
  //   const myStatus = await this.dataSource.query(
  //     `
  //     SELECT "status"
  //     FROM "features"."likes"
  //     WHERE "postIdOrCommentId" = $1 and "userId" = $2
  //     `,
  //     [commentId, userId],
  //   );
  //   return (await myStatus.length) < 1 ? 'None' : myStatus[0].status;
  // }

  async countLikes(id: string): Promise<number> {
    const likes = await this.dataSource.query(
      `
      SELECT COUNT(*) as "total"
      FROM 
            "features"."likes"
      WHERE "postIdOrCommentId" = $1 
             and "status" =  $2
             and "isBanned" = false
    `,
      [id, Status.Like],
    );
    return +likes[0].total;
  }
  async countDisLikes(id: string): Promise<number> {
    const disLikes = await this.dataSource.query(
      `
      SELECT COUNT(*) as "total"
      FROM 
            "features"."likes"
      WHERE "postIdOrCommentId" = $1 
             and "status" =  $2
             and "isBanned" = false
    `,
      [id, Status.Dislike],
    );
    return +disLikes[0].total;
  }
  async getLikes(id: string): Promise<LikeCreateDTO[]> {
    return this.dataSource.query(
      `
      SELECT 
            l."status", l."userId", u."login" as "userLogin", l."postIdOrCommentId", l."addedAt"
      FROM 
            "features"."likes" l
      LEFT JOIN 
            "user"."accountData" u
      ON
            u."id" = l."userId"
      WHERE 
            "postIdOrCommentId" = $1 
            and "status" =  $2
            and "isBanned" = false
    `,
      [id, Status.Like],
    );
  }

  async getLikeInfo(
    postOrCommentId: string,
    userId?: string,
  ): Promise<LikeCreateDTO | null> {
    if (!userId) {
      return null;
    }

    try {
      const likeInfo = await this.dataSource.query(
        `
      SELECT 
            l."status", l."userId", u."login" as "userLogin", l."postIdOrCommentId", l."addedAt"
      FROM 
            "features"."likes" l
      LEFT JOIN 
            "user"."accountData" u
      ON
            u."id" = l."userId"
      WHERE 
            l."userId" = $1
            and l."postIdOrCommentId" = $2 
            and l."isBanned" = false
    `,
        [userId, postOrCommentId],
      );

      if (likeInfo.length < 1) return null;
      console.log({
        status: likeInfo[0].status,
        userId: likeInfo[0].userId,
        userLogin: likeInfo[0].userLogin,
        postIdOrCommentId: likeInfo[0].postIdOrCommentId,
        addedAt: likeInfo[0].addedAt,
        isBanned: likeInfo[0].isBanned,
      });

      return {
        status: likeInfo[0].status,
        userId: likeInfo[0].userId,
        userLogin: likeInfo[0].userLogin,
        postIdOrCommentId: likeInfo[0].postIdOrCommentId,
        addedAt: likeInfo[0].addedAt,
        isBanned: likeInfo[0].isBanned,
      };
    } catch (e) {
      console.log(e);
      throw new Error();
    }
  }

  async updateLikeInfo(
    userId: string,
    postIdOrCommentId: string,
    statusType: string,
  ): Promise<boolean> {
    const result = await this.dataSource.query(
      `
        UPDATE 
                "features"."likes"
        SET
                "status" = $3
        WHERE   
                "postIdOrCommentId" = $2
                and "userId" = $1
    `,
      [userId, postIdOrCommentId, statusType],
    );
    return result.matchedCount === 1;
  }
  async addLikeInfo(inputModel: LikeCreateDTO): Promise<boolean> {
    const newLikeInfo = await this.dataSource.query(
      `
        INSERT INTO features.likes(
                "status", "userId", "postIdOrCommentId", "addedAt", "isBanned")
        VALUES ($1, $2, $3, $4, $5);
    `,
      [
        inputModel.status,
        inputModel.userId,
        inputModel.postIdOrCommentId,
        inputModel.addedAt,
        inputModel.isBanned,
      ],
    );
    return newLikeInfo.length === 0;
  }

  async banLikes(userId: string): Promise<boolean> {
    const result = await this.dataSource.query(
      `
        UPDATE 
                "features"."likes"
        SET
                "isBanned" = true
        WHERE   
                "userId" = $1
    `,
      [userId],
    );
    return result[1] === 1;
  }

  async unBanLikes(userId: string): Promise<boolean> {
    const result = await this.dataSource.query(
      `
        UPDATE 
                "features"."likes"
        SET
                "isBanned" = false
        WHERE   
                "userId" = $1
    `,
      [userId],
    );
    return result[1] === 1;
  }
}
