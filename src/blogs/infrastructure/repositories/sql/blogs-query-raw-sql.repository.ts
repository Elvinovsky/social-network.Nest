import { PaginatorType } from '../../../../pagination/pagination.models';
import { BlogViewDTO, SABlogViewDTO } from '../../../blog.models';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import {
  getDirection,
  getPageNumber,
  getPageSize,
  getSkip,
  getSortBy,
  pagesCountOfBlogs,
} from '../../../../pagination/pagination.helpers';
import { DEFAULT_PAGE_SortBy } from '../../../../common/constants';
import { blogsMapperSA, blogsMapping } from '../../../blog.helpers';
import { PostViewDTO } from '../../../../posts/post.models';
import { PostDocument } from '../../../../posts/post.schemas';
import { PostMapper } from '../../../../posts/post.helpers';
import { UserInfo } from '../../../../users/user.models';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
@Injectable()
export class BlogsQueryRawSqlRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    private readonly postMapper: PostMapper,
  ) {}

  async getBlogById(blogId: string): Promise<BlogViewDTO | null> {
    try {
      const blog = await this.dataSource.query(
        `
      SELECT *
      FROM "features"."blogs"
      WHERE "id" = $1`,
        [blogId],
      );
      if (blog.length < 1) {
        return null;
      }

      return {
        id: blog[0].id,
        name: blog[0].name,
        description: blog[0].description,
        websiteUrl: blog[0].websiteUrl,
        createdAt: blog[0].addedAt.toISOString(),
        isMembership: blog[0].isMembership,
      };
    } catch (e) {
      console.log(e, 'error findBlogById method');
      throw new InternalServerErrorException();
    }
  }

  async getSortedBlogs(
    pageNumber: number,
    pageSize: number,
    sortBy: string,
    sortDirection: string,
    searchNameTerm?: string,
  ): Promise<PaginatorType<BlogViewDTO[]>> {
    const getNameTerm = (searchNameTerm) =>
      searchNameTerm ? `%${searchNameTerm}%` : `%%`;

    const queryData = `
    SELECT 
            b."id", b."name", b."description", b."websiteUrl", b."addedAt", b."isMembership", b."userId", b."userLogin"
    FROM "features"."blogs" b
    WHERE b."name" ilike $1
    ORDER BY "${getSortBy(sortBy)}" ${
      getDirection(sortDirection) === 1 ? 'asc' : 'desc'
    }
    OFFSET $2 LIMIT $3`;

    try {
      const calculateOfFiles = await this.dataSource.query(
        `
      SELECT COUNT(*) as "totalCount"
      FROM(
        SELECT 
            b."id", b."name", b."description", b."websiteUrl", b."addedAt", b."isMembership", b."userId", b."userLogin"
        FROM "features"."blogs" b
        WHERE b."name" ilike $1)
      `,
        [getNameTerm(searchNameTerm)],
      );

      const foundBlogs = await this.dataSource.query(queryData, [
        getNameTerm(searchNameTerm),
        getSkip(pageNumber, pageSize),
        pageSize,
      ]);

      const blogsMap = foundBlogs.map((el) => {
        return {
          id: el.id,
          name: el.name,
          description: el.description,
          websiteUrl: el.websiteUrl,
          createdAt: el.addedAt.toISOString(),
          isMembership: el.isMembership,
        };
      });

      return {
        pagesCount: pagesCountOfBlogs(
          +calculateOfFiles[0].totalCount,
          pageSize,
        ),
        page: getPageNumber(pageNumber),
        pageSize: getPageSize(pageSize),
        totalCount: +calculateOfFiles[0].totalCount,
        items: blogsMap,
      };
    } catch (e) {
      console.log(e, 'getSortedBlogs method error');
      throw new InternalServerErrorException();
    }
  }
  async getSortedBlogsForCurrentBlogger(
    userInfo: UserInfo,
    pageNumber: number,
    pageSize: number,
    sortBy: string,
    sortDirection: string,
    searchNameTerm?: string,
  ): Promise<PaginatorType<BlogViewDTO[]>> {
    const getNameTerm = (searchNameTerm) =>
      searchNameTerm ? `%${searchNameTerm}%` : `%%`;

    const queryData = `
    SELECT 
            b."id", b."name", b."description", b."websiteUrl", b."addedAt", b."isMembership", b."userId", b."userLogin"
    FROM "features"."blogs" b
    WHERE b."name" ilike $1 and b."userId" = $2
    ORDER BY "${sortBy}" ${sortDirection === 'asc' ? 'Asc' : 'Desc'}
    OFFSET $3 LIMIT $4`;

    try {
      const calculateOfFiles = await this.dataSource.query(
        `
      SELECT COUNT(*) as "totalCount"
      FROM(
        SELECT 
            b."id", b."name", b."description", b."websiteUrl", b."addedAt", b."isMembership", b."userId", b."userLogin"
        FROM "features"."blogs" b
        WHERE b."name" ilike $1 and b."userId" = $2) 
      `,
        [getNameTerm(searchNameTerm), userInfo.userId],
      );
      console.log(calculateOfFiles);

      const foundBlogs = await this.dataSource.query(queryData, [
        getNameTerm(searchNameTerm),
        userInfo.userId,
        getSkip(pageNumber, pageSize),
        pageSize,
      ]);

      const blogsMap = foundBlogs.map((el) => {
        return {
          id: el.id,
          name: el.name,
          description: el.description,
          websiteUrl: el.websiteUrl,
          createdAt: el.addedAt.toISOString(),
          isMembership: el.isMembership,
        };
      });

      return {
        pagesCount: pagesCountOfBlogs(calculateOfFiles[0].totalCount, pageSize),
        page: getPageNumber(pageNumber),
        pageSize: getPageSize(pageSize),
        totalCount: Number(calculateOfFiles[0].totalCount),
        items: blogsMap,
      };
    } catch (e) {
      console.log(e, 'getSortedBlogs method error');
      throw new InternalServerErrorException();
    }
  }

  async getSortedPostsBlog(
    blogId: string,
    pageNumber: number,
    pageSize: number,
    sortBy: string,
    sortDirection: string,
    userId?: string,
  ): Promise<PaginatorType<PostViewDTO[]> | null> {
    try {
      const queryData = `
    SELECT 
        p."id", p."title", p."shortDescription",  p."content", p."blogId", p."blogName", p."addedAt"
    FROM "features"."posts" p
    WHERE p."blogId" = $1
    ORDER BY "${sortBy}" ${sortDirection === 'asc' ? 'asc' : 'desc'}
    OFFSET $2 LIMIT $3`;

      const foundPosts = await this.dataSource.query(queryData, [
        blogId,
        getSkip(pageNumber, pageSize),
        pageSize,
      ]);

      const calculateOfFiles = await this.dataSource.query(
        `
    SELECT COUNT(*) as "totalCount"
    FROM(SELECT 
        p."id", p."title", p."shortDescription",  p."content", p."blogId", p."blogName", p."addedAt"
    FROM "features"."posts" p
    WHERE p."blogId" = $1)
    `,
        [blogId],
      );

      const usersMap = foundPosts.map((el) => {
        return {
          id: el.id,
          title: el.title,
          shortDescription: el.shortDescription,
          content: el.content,
          blogId: el.blogId,
          blogName: el.blogName,
          createdAt: el.addedAt.toISOString(),
          extendedLikesInfo: {
            likesCount: 0,
            dislikesCount: 0,
            myStatus: 'None',
            newestLikes: [],
          },
        };
      });

      return {
        pagesCount: pagesCountOfBlogs(
          +calculateOfFiles[0].totalCount,
          pageSize,
        ),
        page: pageNumber,
        pageSize: pageSize,
        totalCount: +calculateOfFiles[0].totalCount,
        items: usersMap,
      };
    } catch (e) {
      console.log(e);
      throw new InternalServerErrorException();
    }
  }
  async getSortedBlogsForSA(
    pageNumber: number,
    pageSize: number,
    sortBy: string,
    sortDirection: string,
    searchNameTerm?: string,
  ): Promise<PaginatorType<SABlogViewDTO[]>> {
    const getNameTerm = (searchNameTerm) =>
      searchNameTerm ? `%${searchNameTerm}%` : `%%`;

    const queryData = `
    SELECT 
            b."id", b."name", b."description", b."websiteUrl", b."addedAt", b."isMembership", b."userId", b."userLogin"
    FROM "features"."blogs" b
    WHERE b."name" ilike $1
    ORDER BY "${sortBy}" ${sortDirection === 'asc' ? 'Asc' : 'Desc'}
    OFFSET $2 LIMIT $3`;

    try {
      const calculateOfFiles = await this.dataSource.query(
        `
      SELECT COUNT(*) as "totalCount"
      FROM(
        SELECT 
            b."id", b."name", b."description", b."websiteUrl", b."addedAt", b."isMembership", b."userId", b."userLogin"
        FROM "features"."blogs" b
        WHERE b."name" ilike $1)
      `,
        [getNameTerm(searchNameTerm)],
      );

      const foundBlogs = await this.dataSource.query(queryData, [
        getNameTerm(searchNameTerm),
        getSkip(pageNumber, pageSize),
        pageSize,
      ]);

      const blogsMap = foundBlogs.map((el) => {
        return {
          id: el.id,
          name: el.name,
          description: el.description,
          websiteUrl: el.websiteUrl,
          createdAt: el.addedAt.toISOString(),
          isMembership: el.isMembership,
        };
      });

      return {
        pagesCount: pagesCountOfBlogs(
          +calculateOfFiles[0].totalCount,
          pageSize,
        ),
        page: getPageNumber(pageNumber),
        pageSize: getPageSize(pageSize),
        totalCount: +calculateOfFiles[0].totalCount,
        items: blogsMap,
      };
    } catch (e) {
      console.log(e, 'getSortedBlogs method error');
      throw new InternalServerErrorException();
    }
  }
}
