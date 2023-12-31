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
import { PostCreateDTO, PostViewDTO } from '../../../../posts/dto/post.models';
import { UserInfo } from '../../../../users/dto/view/user-view.models';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { IBlogQueryRepository } from '../../../../infrastructure/repositoriesModule/repositories.module';
import { PostMapper } from '../../../../posts/infrastructure/helpers/post-mapper';
import { BlogTypeOrmEntity } from '../../../entities/typeorm/blog-sql.schemas';
import { PostTypeOrmEntity } from '../../../../posts/entities/typeorm/post-sql.schemas';

@Injectable()
export class BlogsQueryTypeormRepository implements IBlogQueryRepository {
  constructor(
    @InjectRepository(BlogTypeOrmEntity)
    protected blogsRepo: Repository<BlogTypeOrmEntity>,
    @InjectRepository(PostTypeOrmEntity)
    protected postsRepo: Repository<PostTypeOrmEntity>,
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

  async getSortedPostsBlog(
    blogId: string,
    pageNumber: number,
    pageSize: number,
    sortBy: string,
    sortDirection: string,
    userId?: string,
  ): Promise<PaginatorType<PostViewDTO[]> | null> {
    try {
      const sortDirectionSQL = (sortDirection?: string) =>
        sortDirection?.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

      const queryBuilder = this.postsRepo
        .createQueryBuilder('p')
        .where(`p.blog = :blog`, { blog: blogId })
        .orderBy('p.' + getSortBy(sortBy), sortDirectionSQL(sortDirection))
        .offset(getSkip(pageNumber, pageSize))
        .limit(pageSize);

      const [foundPosts, calculateOfFiles] = await Promise.all([
        queryBuilder.getMany(),
        queryBuilder.getCount(),
      ]);

      console.log(foundPosts);
      const postsToMap: PostCreateDTO[] = foundPosts.map((el) => {
        return {
          id: el.id,
          title: el.title,
          shortDescription: el.shortDescription,
          content: el.content,
          blogId: el.blog.id,
          blogName: el.blog.name,
          addedAt: el.addedAt,
        };
      });
      return {
        pagesCount: pagesCounter(calculateOfFiles, pageSize),
        page: pageNumber,
        pageSize: pageSize,
        totalCount: calculateOfFiles,
        items: await this.postMapper.mapPosts(postsToMap, userId),
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
    try {
      const getNameTerm = (searchNameTerm?: string): string =>
        searchNameTerm ? `%${searchNameTerm}%` : `%%`;

      const sortDirectionSQL = (sortDirection?: string) =>
        sortDirection?.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

      const queryBuilder = this.blogsRepo
        .createQueryBuilder('b')
        .select([
          'b.id',
          'b.name',
          'b.description',
          'b.websiteUrl',
          'b.addedAt',
          'b.isMembership',
          'u.id AS userId',
          'u.login',
        ])
        .leftJoin('b.user', 'u')
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
          blogOwnerInfo: el.user
            ? ({ userId: el.user.id, userLogin: el.user.login } as UserInfo)
            : null,
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
}
