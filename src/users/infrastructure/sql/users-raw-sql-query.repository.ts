import { DataSource } from 'typeorm';
import { PaginatorType } from '../../../pagination/pagination.models';
import { MeViewModel, UserViewDTO } from '../../user.models';
import {
  getDirection,
  getPageNumber,
  getPageSize,
  getSkip,
  getSortBy,
  pagesCountOfBlogs,
} from '../../../pagination/pagination.helpers';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

@Injectable()
export class UsersRawSQLQueryRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}
  async getSortedUsersForSA(
    banStatus: string,
    pageNumber: number,
    pageSize: number,
    sortBy: string,
    sortDirection: string,
    searchEmailTerm?: string,
    searchLoginTerm?: string,
  ): Promise<PaginatorType<UserViewDTO[]>> {
    const getEmailTerm = (searchEmailTerm?: string): string =>
      searchEmailTerm ? `%${searchEmailTerm}%` : `%%`;

    const getLoginTerm = (searchLoginTerm?: string): string =>
      searchLoginTerm ? `%${searchLoginTerm}%` : `%%`;

    const queryString = `
        SELECT u."id", u."login", u."email", u."addedAt" as "createdAt"
        FROM "user"."accountData" u
        WHERE u."login" ilike $1 or u."email" ilike $2
        ORDER BY "${getSortBy(sortBy)}" ${
      getDirection(sortDirection) === 1 ? 'Asc' : 'Desc'
    }
      OFFSET $3 LIMIT $4`; // todo добавить валидацию на офсет для ограничения пролистования записей .

    const users = await this.dataSource.query(queryString, [
      getLoginTerm(searchLoginTerm),
      getEmailTerm(searchEmailTerm),
      getSkip(pageNumber, pageSize),
      pageSize,
    ]);

    const usersMap = await users.map((el) => {
      return {
        id: el.id,
        login: el.login,
        email: el.email,
        createdAt: el.createdAt.toISOString(),
      };
    });

    const calculateOfFiles = await this.dataSource.query(
      `
     SELECT COUNT(*) as "totalCount"
        FROM ( SELECT u."id", u."login", u."email", u."addedAt" as "createdAt"
        FROM "user"."accountData" u
        WHERE u."login" ilike $1 or u."email" ilike $2)
        `,
      [getLoginTerm(searchLoginTerm), getEmailTerm(searchEmailTerm)],
    );
    return {
      pagesCount: pagesCountOfBlogs(
        +calculateOfFiles[0].totalCount,
        getPageSize(pageSize),
      ),
      page: getPageNumber(pageNumber),
      pageSize: getPageSize(pageSize),
      totalCount: +calculateOfFiles[0].totalCount,
      items: usersMap,
    };
  }
  async getUserInfo(id: string): Promise<MeViewModel | null> {
    const user = await this.dataSource.query(
      `
    SELECT "email", "login", "id"
    FROM "user"."accountData"
    WHERE "id" = $1
    `,
      [id],
    );

    if (user[0].length < 1) {
      return null;
    }

    return {
      email: user[0].email,
      login: user[0].login,
      userId: user[0].id,
    };
  }
}
