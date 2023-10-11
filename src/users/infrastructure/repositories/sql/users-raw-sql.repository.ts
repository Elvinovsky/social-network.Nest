import { DataSource } from 'typeorm';
import { SAUserViewDTO, UserViewDTO } from '../../../dto/view/user-view.models';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { BanUserInputModel } from '../../../dto/input/user-input.models';
import { UserFullDTO } from '../../../dto/create/users-create.models';

@Injectable()
export class UsersRawSQLRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async findUserLoginOrEmail(
    loginOrEmail: string,
  ): Promise<UserFullDTO | null> {
    try {
      // Ищем пользователя в базе данных по логину или адресу электронной почты
      const user = await this.dataSource.query(
        `
        SELECT u."id", u."login", u."passwordHash", u."email", u."addedAt", e."isConfirmed", e."expirationDate", e."confirmationCode", b."isBanned", b."banDate", b."banReason"
        FROM "user"."accountData" u
        LEFT JOIN "user"."emailConfirmation" e
        ON u."id" = e."userId" 
        LEFT JOIN "user"."banInfo" b
        ON u."id" = b."userId" 
        WHERE "login" = $1 OR "email" = $1;
        `,
        [loginOrEmail],
      );

      // Если пользователь не найден, возвращаем null
      if (user.length < 1) return null;

      // Возвращаем найденного пользователя
      return {
        id: user[0].id,
        login: user[0].login,
        passwordHash: user[0].passwordHash,
        email: user[0].email,
        addedAt: user[0].addedAt,
        emailConfirmation: {
          isConfirmed: user[0].isConfirmed,
          expirationDate: user[0].expirationDate,
          confirmationCode: user[0].confirmationCode,
        },
        banInfo: {
          isBanned: user[0].isBanned,
          banDate: user[0].banDate,
          banReason: user[0].banReason,
        },
      };
    } catch (e) {
      console.log(e);
      throw new InternalServerErrorException();
    }
  }

  async getUser(userId: string): Promise<UserViewDTO | null> {
    try {
      const user = await this.dataSource.query(
        `
      SELECT "id", "login", "email", "addedAt"
      FROM "user"."accountData"
      WHERE "id" = $1;
      `,
        [userId],
      );

      if (user.length < 1) return null;

      return {
        id: user[0].id,
        login: user[0].login,
        email: user[0].email,
        createdAt: user[0].addedAt.toISOString(),
      };
    } catch (e) {
      console.log('error usersRepository', e);
      throw new InternalServerErrorException();
    }
  }

  async findUser(userId: string): Promise<SAUserViewDTO | null> {
    const user = await this.dataSource.query(
      `
            SELECT u."id", u."login", u."email", u."addedAt", b."isBanned", b."banDate", b."banReason"
            FROM "user"."accountData" u
            LEFT JOIN "user"."banInfo" b
            ON u."id" = b."userId" 
            WHERE u."id" = $1
            `,
      [userId],
    );

    if (user.length < 1) return null;

    return {
      id: user[0].id,
      login: user[0].login,
      email: user[0].email,
      createdAt: user[0].addedAt.toISOString(),
      banInfo: {
        isBanned: user[0].isBanned,
        banDate: user[0].banDate,
        banReason: user[0].banReason,
      },
    };
  }

  async findUserByEmail(email: string): Promise<UserFullDTO | null> {
    const user = await this.dataSource.query(
      `
            SELECT u."id", u."login", u."passwordHash", u."email", u."addedAt", 
                   e."isConfirmed", e."expirationDate", e."confirmationCode", 
                   b."isBanned", b."banDate", b."banReason"
            FROM "user"."accountData" u
            LEFT JOIN "user"."emailConfirmation" e
            ON u."id" = e."userId" 
            LEFT JOIN "user"."banInfo" b
            ON u."id" = b."userId" 
            WHERE u."email" = $1
            `,
      [email],
    );
    if (user.length < 1) return null;
    return {
      id: user[0].id,
      login: user[0].login,
      passwordHash: user[0].passwordHash,
      email: user[0].email,
      addedAt: user[0].addedAt,
      banInfo: {
        isBanned: user[0].isBanned,
        banDate: user[0].banDate,
        banReason: user[0].banReason,
      },
      emailConfirmation: {
        isConfirmed: user[0].isConfirmed,
        expirationDate: user[0].expirationDate,
        confirmationCode: user[0].confirmationCode,
      },
    };
  }

  async findUserByLogin(login: string): Promise<UserFullDTO | null> {
    const user = await this.dataSource.query(
      `
            SELECT u."id", u."login", u."passwordHash", u."email", u."addedAt", e."isConfirmed", e."expirationDate", e."confirmationCode", b."isBanned", b."banDate", b."banReason"
            FROM "user"."accountData" u
            LEFT JOIN "user"."emailConfirmation" e
            ON u."id" = e."userId" 
            LEFT JOIN "user"."banInfo" b
            ON u."id" = b."userId" 
            WHERE u."login" = $1
            `,
      [login],
    );
    if (user.length < 1) return null;

    return {
      id: user[0].id,
      login: user[0].login,
      passwordHash: user[0].passwordHash,
      email: user[0].email,
      addedAt: user[0].addedAt,
      banInfo: {
        isBanned: user[0].isBanned,
        banDate: user[0].banDate,
        banReason: user[0].banReason,
      },
      emailConfirmation: {
        isConfirmed: user[0].isConfirmed,
        expirationDate: user[0].expirationDate,
        confirmationCode: user[0].confirmationCode,
      },
    };
  }

  async createUser(inputModel: UserFullDTO): Promise<UserViewDTO> {
    try {
      const newUser = await this.dataSource.query(
        `INSERT INTO "user"."accountData" (
                    "id", "login", "passwordHash", "email", "addedAt") 
              VALUES ($1, $2, $3, $4, $5)`,
        [
          inputModel.id,
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
          inputModel.id,
          inputModel.banInfo.banDate,
          inputModel.banInfo.banReason,
          inputModel.banInfo.isBanned,
        ],
      );

      const emailConfirmation = await this.dataSource.query(
        `
    INSERT INTO "user"."emailConfirmation"(
            "confirmationCode", "isConfirmed", "expirationDate", "userId")
    VALUES ($1, $2, $3, $4);`,
        [
          inputModel.emailConfirmation.confirmationCode,
          inputModel.emailConfirmation.isConfirmed,
          inputModel.emailConfirmation.expirationDate,
          inputModel.id,
        ],
      );
      return {
        id: inputModel.id,
        login: inputModel.login,
        email: inputModel.email,
        createdAt: inputModel.addedAt.toISOString(),
      };
    } catch (e) {
      console.log(e);
      throw new Error();
    }
  }
  async updateEmail(userId: string, email: string) {
    try {
      return this.dataSource.query(
        `
      UPDATE "user"."accountData"
        SET email=$2
        WHERE "id"=$1;
      `,
        [userId, email],
      );
    } catch (e) {
      console.log(e);
      throw new InternalServerErrorException();
    }
  }

  async updateLogin(userId: string, login: string) {
    try {
      return this.dataSource.query(
        `
      UPDATE "user"."accountData"
        SET login=$2 
        WHERE "id"=$1;
      `,
        [userId, login],
      );
    } catch (e) {
      console.log(e);
      throw new InternalServerErrorException();
    }
  }

  async deleteUserById(userId: string): Promise<Document | null> {
    try {
      //todo realize cascade delete
      const result = await this.dataSource.query(
        `
      DELETE FROM "user"."accountData"
        WHERE "id" = $1;
      `,
        [userId],
      );
      if (result[1] !== 1) return null;
      return result;
    } catch (e) {
      console.log(e);
      throw new InternalServerErrorException();
    }
  }

  async findUserByCode(code: string): Promise<UserFullDTO | null> {
    const user = await this.dataSource.query(
      `
    SELECT u."id", u."login", u."passwordHash", u."email", u."addedAt", e."isConfirmed", e."expirationDate", e."confirmationCode", b."isBanned", b."banDate", b."banReason"
    FROM "user"."emailConfirmation" e
    LEFT JOIN "user"."accountData" u
    ON u."id" = e."userId"
    LEFT JOIN "user"."banInfo" b
    ON u."id" = b."userId"
    WHERE e."confirmationCode" = $1 
    `,
      [code],
    );
    // Если пользователь не найден, возвращаем null
    if (user.length < 1) return null;

    // Возвращаем найденного пользователя
    return {
      id: user[0].id,
      login: user[0].login,
      passwordHash: user[0].passwordHash,
      email: user[0].email,
      addedAt: user[0].addedAt,
      banInfo: {
        isBanned: user[0].isBanned,
        banDate: user[0].banDate,
        banReason: user[0].banReason,
      },
      emailConfirmation: {
        isConfirmed: user[0].isConfirmed,
        expirationDate: user[0].expirationDate,
        confirmationCode: user[0].confirmationCode,
      },
    };
  }

  async confirmEmail(code: string): Promise<boolean> {
    try {
      // Обновляем статус подтверждения адреса электронной почты пользователя
      const updateResult = await this.dataSource.query(
        `
      UPDATE "user"."emailConfirmation"
      SET "isConfirmed"= true, "expirationDate"= null
      WHERE "confirmationCode"= $1;
      `,
        [code],
      );

      const isConfirmed = await this.dataSource.query(
        `
      SELECT "isConfirmed"
      FROM "user"."emailConfirmation"
      WHERE "confirmationCode"= $1;
      `,
        [code],
      );
      return isConfirmed[0].isConfirmed as boolean;
    } catch (e) {
      console.log(e);
      throw new InternalServerErrorException();
    }
  }

  async updateConfirmationCodeByEmail(email: string, newCode: string) {
    const update = await this.dataSource.query(
      `
    UPDATE "user"."emailConfirmation" 
    SET "confirmationCode"= $2
    FROM (
        SELECT "id"
        FROM "user"."accountData" 
        WHERE "email" = $1
    ) as a
    WHERE "userId" = a."id"
    `,
      [email, newCode],
    );
    return update[1] === 1;
  }

  async updatePasswordForUser(hash: string, code: string) {
    try {
      const result = await this.dataSource.query(
        `
               UPDATE "user"."accountData" 
               SET "passwordHash" = $1
               FROM(
                    SELECT "userId"
                    FROM "user"."emailConfirmation" 
                     WHERE "confirmationCode" = $2
               ) e
               WHERE "id" = e."userId"
                               `,
        [hash, code],
      );

      return result[1] === 1;
    } catch (e) {
      console.log(e);
      throw new InternalServerErrorException();
    }
  }

  async banUser(userId: string, inputModel: BanUserInputModel) {
    try {
      const updateResult = await this.dataSource.query(
        `UPDATE "user"."banInfo"
               SET "isBanned" = $1, "banReason" = $2, "banDate" = ${new Date()}
               FROM (
                    SELECT "id"
                    FROM "user"."accountData"
                    WHERE "id" = $3
               ) a
               WHERE "userId" = a."id" 
                `,
        [inputModel.isBanned, inputModel.banReason, userId],
      );
      return updateResult[1] === 1;
    } catch (e) {
      console.log(e);
      throw new Error('something went wrong');
    }
  }

  async unBanUser(userId: string, inputModel: BanUserInputModel) {
    try {
      const updateResult = await this.dataSource.query(
        `
               UPDATE "user"."banInfo"
               SET "isBanned" = $1, "banReason" = null, "banDate" = null
               FROM (
                    SELECT "id"
                    FROM "user"."accountData"
                    WHERE "id" = $2
               ) a
               WHERE "userId" = a."id" 
                `,
        [inputModel.isBanned, userId],
      );
      return updateResult[1] === 1;
    } catch (e) {
      console.log(e);
      throw new Error('something went wrong');
    }
  }
}
