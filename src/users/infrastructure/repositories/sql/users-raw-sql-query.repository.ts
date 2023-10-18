import { DataSource } from 'typeorm';
import { PaginatorType } from '../../../../infrastructure/pagination/pagination.models';
import { MeViewModel, UserViewDTO } from '../../../dto/view/user-view.models';
import {
  getDirection,
  getPageNumber,
  getPageSize,
  getSkip,
  getSortBy,
  pagesCountOfBlogs,
} from '../../../../infrastructure/pagination/pagination.helpers';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { IUserQueryRepository } from '../../../../infrastructure/repositoriesModule/repositories.module';

@Injectable()
export class UsersRawSQLQueryRepository implements IUserQueryRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}
  async getSortedUsers(
    pageNumber: number,
    pageSize: number,
    sortBy: string,
    sortDirection: string,
    searchEmailTerm?: string,
    searchLoginTerm?: string,
  ): Promise<PaginatorType<UserViewDTO[]>> {
    try {
      const getEmailTerm = (searchEmailTerm?: string): string =>
        searchEmailTerm ? `%${searchEmailTerm}%` : `%%`;

      const getLoginTerm = (searchLoginTerm?: string): string =>
        searchLoginTerm ? `%${searchLoginTerm}%` : `%%`;

      const queryString = `
        SELECT 
                u."id", 
                u."login", 
                u."email", 
                u."addedAt" as "createdAt"
        FROM 
                "user"."accountData" u
        WHERE 
                u."login" LIKE $1 
                or u."email" LIKE $2 
        ORDER BY 
                "${getSortBy(sortBy)}" ${
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
        FROM (  SELECT 
                u."id", 
                u."login", 
                u."email", 
                u."addedAt" as "createdAt"
        FROM 
                "user"."accountData" u 
        WHERE 
                u."login" LIKE $1 
                or u."email" LIKE $2 )
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
    } catch (e) {
      console.log(e);
      throw new Error();
    }
  }

  async getSortedUsersForSA(
    pageNumber: number,
    pageSize: number,
    sortBy: string,
    sortDirection: string,
    banStatus: string,
    searchEmailTerm?: string,
    searchLoginTerm?: string,
  ): Promise<PaginatorType<UserViewDTO[]>> {
    const banFilter = (banStatus?: string) => {
      return banStatus === 'banned' ? true : false;
    };
    const getEmailTerm = (searchEmailTerm?: string): string =>
      searchEmailTerm ? `%${searchEmailTerm}%` : `%%`;

    const getLoginTerm = (searchLoginTerm?: string): string =>
      searchLoginTerm ? `%${searchLoginTerm}%` : `%%`;

    const queryString = `
        SELECT 
                u."id", 
                u."login", 
                u."email", 
                u."addedAt" as "createdAt",
                b."isBanned"
        FROM 
                "user"."accountData" u
        LEFT JOIN 
                "user"."banInfo" b
        ON 
                b."userId" = u."id"
        WHERE 
               ( b."isBanned" = $3 )
                and (u."login" LIKE $1 
                or u."email" LIKE $2 )
        ORDER BY 
                "${getSortBy(sortBy)}" ${
      getDirection(sortDirection) === 1 ? 'Asc' : 'Desc'
    }
      OFFSET $4 LIMIT $5`; // todo добавить валидацию на офсет для ограничения пролистования записей .

    const users = await this.dataSource.query(queryString, [
      getLoginTerm(searchLoginTerm),
      getEmailTerm(searchEmailTerm),
      banFilter(banStatus),
      getSkip(pageNumber, pageSize),
      pageSize,
    ]);

    const usersMap = await users.map((el) => {
      return {
        id: el.id,
        login: el.login,
        email: el.email,
        createdAt: el.createdAt.toISOString(),
        isBanned: el.isBanned,
      };
    });

    const calculateOfFiles = await this.dataSource.query(
      `
     SELECT COUNT(*) as "totalCount"
        FROM (  SELECT 
                u."id", 
                u."login", 
                u."email", 
                u."addedAt" as "createdAt",
                b."isBanned"
        FROM 
                "user"."accountData" u
        LEFT JOIN 
                "user"."banInfo" b
        ON 
                b."userId" = u."id"
        WHERE 
               ( b."isBanned" = $3 )
                and (u."login" LIKE $1 
                or u."email" LIKE $2 )
                )
        `,
      [
        getLoginTerm(searchLoginTerm),
        getEmailTerm(searchEmailTerm),
        banFilter(banStatus),
      ],
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
