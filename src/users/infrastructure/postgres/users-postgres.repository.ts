import { DataSource } from 'typeorm';
import { SAUserViewDTO, UserCreateDTO, UserViewDTO } from '../../user.models';
import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { InjectDataSource } from '@nestjs/typeorm';

@Injectable()
export class UsersPostgresRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async findUser(userId: string): Promise<SAUserViewDTO> {
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
    return {
      id: user.id,
      login: user.login,
      email: user.email,
      createdAt: user.addedAt,
      banInfo: {
        isBanned: user.isBanned,
        banDate: user.banDate,
        banReason: user.banReason,
      },
    };
  }

  async createUser(inputModel: UserCreateDTO): Promise<UserViewDTO> {
    const id = uuidv4();
    const newUser = await this.dataSource.query(
      `INSERT INTO "user"."accountData" (
                    "id", "login", "passwordHash", "email", "addedAt") 
              VALUES ($1, $2, $3, $4, $5))`,
      [
        id,
        inputModel.login,
        inputModel.passwordHash,
        inputModel.email,
        inputModel.addedAt,
      ],
    );

    const banInfo = await this.dataSource.query(
      `
    INSERT INTO "user"."banInfo"(
            "userId", "banDate", "banReason", "isBanned")
    VALUES ($1, $2, $3, $4)`,
      [
        id,
        inputModel.banInfo.banDate,
        inputModel.banInfo.banReason,
        inputModel.banInfo.isBanned,
      ],
    );

    return {
      id: id,
      login: inputModel.login,
      email: inputModel.email,
      createdAt: inputModel.addedAt,
    };
  }
}
