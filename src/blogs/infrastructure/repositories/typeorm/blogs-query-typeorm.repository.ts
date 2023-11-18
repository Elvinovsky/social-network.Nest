import { PaginatorType } from '../../../../infrastructure/pagination/pagination.models';
import { BlogViewDTO, SABlogViewDTO } from '../../../dto/blog.models';
import { Injectable } from '@nestjs/common';
import {
  getPageNumber,
  getPageSize,
  getSkip,
  getSortBy,
  pagesCounter,
} from '../../../../infrastructure/pagination/pagination.helpers';
import { PostViewDTO } from '../../../../posts/dto/post.models';
import { UserInfo } from '../../../../users/dto/view/user-view.models';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { IBlogQueryRepository } from '../../../../infrastructure/repositoriesModule/repositories.module';
import { PostMapper } from '../../../../posts/infrastructure/helpers/post-mapper';
import { BlogTypeOrmEntity } from '../../../entities/typeorm/blog-sql.schemas';

@Injectable()
export class BlogsQueryTypeormRepository implements IBlogQueryRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    @InjectRepository(BlogTypeOrmEntity)
    protected blogsRepo: Repository<BlogTypeOrmEntity>,
    protected postMapper: PostMapper,
  ) {}

  async getBlogById(blogId: string): Promise<BlogViewDTO | null> {
    try {
      const blog = await this.blogsRepo.findOne({
        where: {
          id: blogId,
        },
      });

      if (!blog) return null;

      return {
        id: blog.id,
        name: blog.name,
        description: blog.description,
        websiteUrl: blog.websiteUrl,
        createdAt: blog.addedAt.toISOString(),
        isMembership: blog.isMembership,
      };
    } catch (e) {
      console.log(e, 'error findBlogById method');
      throw new Error();
    }
  }

  async getSortedBlogs(
    pageNumber: number,
    pageSize: number,
    sortBy: string,
    sortDirection: string,
    searchNameTerm?: string,
  ): Promise<PaginatorType<BlogViewDTO[]>> {
    try {
      const getNameTerm = (searchNameTerm?: string): string =>
        searchNameTerm ? `%${searchNameTerm}%` : `%%`;

      const sortDirectionSQL = (sortDirection?: string) =>
        sortDirection?.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

      const queryBuilder = this.blogsRepo
        .createQueryBuilder('b')
        .where(`b.name ILIKE :name`, { name: getNameTerm(searchNameTerm) })
        .orderBy('b.' + getSortBy(sortBy), sortDirectionSQL(sortDirection))
        .offset(getSkip(pageNumber, pageSize))
        .limit(pageSize);

      const [foundBlogs, calculateOfFiles] = await Promise.all([
        queryBuilder.getMany(),
        queryBuilder.getCount(),
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
        pagesCount: pagesCounter(calculateOfFiles, pageSize),
        page: getPageNumber(pageNumber),
        pageSize: getPageSize(pageSize),
        totalCount: calculateOfFiles,
        items: blogsMap,
      };
    } catch (e) {
      console.log(e, 'getSortedBlogs method error');
      throw new Error();
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
                        b."id", 
                        b."name", 
                        b."description", 
                        b."websiteUrl", 
                        b."addedAt", 
                        b."isMembership", 
                        b."userId", 
                        b."userLogin"
            FROM 
                    "features"."blogs" b
            WHERE 
                    b."name" ilike $1 
                    and b."userId" = $2) 
      `,
        [getNameTerm(searchNameTerm), userInfo.userId],
      );

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
        pagesCount: pagesCounter(calculateOfFiles[0].totalCount, pageSize),
        page: getPageNumber(pageNumber),
        pageSize: getPageSize(pageSize),
        totalCount: Number(calculateOfFiles[0].totalCount),
        items: blogsMap,
      };
    } catch (e) {
      console.log(e, 'getSortedBlogs method error');
      throw new Error();
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
                    p."id", 
                    p."title", 
                    p."shortDescription",  
                    p."content", 
                    p."blogId", 
                    p."blogName", 
                    p."addedAt",
                    SUM(CASE WHEN l."status" = 'Like' THEN 1 ELSE 0 END) as "likesCount",
                    SUM(CASE WHEN l."status" = 'Dislike' THEN 1 ELSE 0 END) as "dislikesCount"
            FROM 
                    "features"."posts" p
            LEFT JOIN 
                    "features"."likes" l
            ON
                    l."postIdOrCommentId" = p."id"
                    and l."isBanned" = false
            WHERE 
                    p."blogId" = $1
            GROUP BY
                    p."id",
                    p."title", 
                    p."shortDescription",  
                    p."content",
                    p."blogId", 
                    p."blogName", 
                    p."addedAt"
            ORDER BY 
                    "${sortBy}" ${sortDirection === 'asc' ? 'Asc' : 'Desc'}
            OFFSET  $2 
            LIMIT   $3`;

      const foundPosts = await this.dataSource.query(queryData, [
        blogId,
        getSkip(pageNumber, pageSize),
        pageSize,
      ]);

      const calculateOfFiles = await this.dataSource.query(
        `
            SELECT COUNT(*) as "totalCount"
            FROM(SELECT 
                        p."id",     
                        p."title", 
                        p."shortDescription",  
                        p."content", 
                        p."blogId", 
                        p."blogName", 
                        p."addedAt"
            FROM 
                        "features"."posts" p
            WHERE 
                        p."blogId" = $1)
    `,
        [blogId],
      );

      return {
        pagesCount: pagesCounter(+calculateOfFiles[0].totalCount, pageSize),
        page: pageNumber,
        pageSize: pageSize,
        totalCount: +calculateOfFiles[0].totalCount,
        items: await this.postMapper.mapPosts(foundPosts, userId),
      };
    } catch (e) {
      console.log(e);
      throw new Error();
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
                    b."id", 
                    b."name", 
                    b."description", 
                    b."websiteUrl", 
                    b."addedAt", 
                    b."isMembership", 
                    b."userId", 
                    b."userLogin"
            FROM 
                    "features"."blogs" b
            WHERE 
                    b."name" ilike $1
            ORDER BY 
                    "${sortBy}" ${sortDirection === 'asc' ? 'Asc' : 'Desc'}
            OFFSET $2 
            LIMIT $3`;

    try {
      const calculateOfFiles = await this.dataSource.query(
        `
                SELECT COUNT(*) as "totalCount"
                FROM(SELECT 
                            b."id", 
                            b."name", 
                            b."description", 
                            b."websiteUrl", 
                            b."addedAt", 
                            b."isMembership", 
                            b."userId", 
                            b."userLogin"
                FROM 
                            "features"."blogs" b
                WHERE 
                            b."name" ilike $1)
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
        pagesCount: pagesCounter(+calculateOfFiles[0].totalCount, pageSize),
        page: getPageNumber(pageNumber),
        pageSize: getPageSize(pageSize),
        totalCount: +calculateOfFiles[0].totalCount,
        items: blogsMap,
      };
    } catch (e) {
      console.log(e, 'getSortedBlogs method error');
      throw new Error();
    }
  }
}
