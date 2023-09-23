import { Injectable } from '@nestjs/common';
import { LikeCreateDTO } from '../../like.models';
import { Status } from '../../../common/constants';
import { UserInfo } from '../../../users/user.models';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class LikesRawSqlRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}
  async countLikes(id: string): Promise<number> {
    const likes = await this.dataSource.query(
      `
      SELECT COUNT(*) as "total"
      FROM 
            "features"."likes"
      WHERE "postIdOrCommentId" = $1 
             and "status" =  ${Status.Like}
             "isBanned" = false
    `,
      [id],
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
             and "status" =  ${Status.Dislike}
             "isBanned" = false
    `,
      [id],
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
            and "status" =  ${Status.Like}
            and "isBanned" = false
    `,
      [id],
    );
  }

  async getLikeInfo(
    userId: string,
    postOrCommentId: string,
  ): Promise<LikeCreateDTO | null> {
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
            and l."status" =  ${Status.Like}
            and l."isBanned" = false
    `,
      [userId, postOrCommentId],
    );

    if (likeInfo.length < 1) return null;

    return {
      status: likeInfo[0].status,
      userId: likeInfo[0].userId,
      userLogin: likeInfo[0].userLogin,
      postIdOrCommentId: likeInfo[0].postIdOrCommentId,
      addedAt: likeInfo[0].addedAt,
    };
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
  async addLikeInfo(
    userInfo: UserInfo,
    postOrCommentId: string,
    statusType: string,
  ): Promise<boolean> {
    const newLikeInfo = await this.dataSource.query(
      `
        INSERT INTO features.likes(
                "status", "userId", "postIdOrCommentId", "addedAt", "isBanned")
        VALUES ($1, $2, $3, $4, ${new Date()}, false);
    `,
      [statusType, userInfo.userId, postOrCommentId],
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
