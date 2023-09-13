import { DataSource } from 'typeorm';
import { UserCreateDTO } from '../../user.models';
import { Injectable } from '@nestjs/common';
import { userMappingSA } from '../../user.helpers';

@Injectable()
export class UsersPostgresRepository {
  constructor(protected dataSource: DataSource) {}

  async findUser(userId: string) {
    const user = await this.dataSource.query(
      `(
SELECT u."id", u."login", u."email", u."addedAt", b."isBanned", b."banDate", b."banReason"
  FROM "user"."accountData " u
  LEFT JOIN "user"."banInfo" b
  ON u."id" = b."userId" 
  WHERE u."id" = $1
  )`,
      [userId],
    );
    return userMappingSA(user);
  }

  async createUser(inputModel: UserCreateDTO) {
    const newUser = await this.dataSource
      .query(`(INSERT INTO "user"."accountData" ( login, "passwordHash", email, "addedAt" )
VALUES ($1, $2, $3, $4))`);
  }
}
