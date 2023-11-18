import { PaginatorType } from '../../../../infrastructure/pagination/pagination.models';
import { BlogViewDTO, SABlogViewDTO } from '../../../dto/blog.models';
import * as mongoose from 'mongoose';
import {
  BlogMongooseEntity,
  BlogDocument,
  BlogModel,
} from '../../../entities/mongoose/blog-no-sql.schemas';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  getDirection,
  getPageNumber,
  getPageSize,
  getSkip,
  getSortBy,
  pagesCounter,
} from '../../../../infrastructure/pagination/pagination.helpers';
import { DEFAULT_PAGE_SortBy } from '../../../../infrastructure/common/constants';
import {
  blogMapping,
  blogsMapperSA,
  blogsMapping,
} from '../../helpers/blog.helpers';
import { PostCreateDTO, PostViewDTO } from '../../../../posts/dto/post.models';
import {
  Post,
  PostModel,
} from '../../../../posts/entities/mongoose/post-no-sql.schemas';
import { PostMapper } from '../../../../posts/infrastructure/helpers/post-mapper';
import { UserInfo } from '../../../../users/dto/view/user-view.models';
import { IBlogQueryRepository } from '../../../../infrastructure/repositoriesModule/repositories.module';

@Injectable()
export class BlogsQueryRepo implements IBlogQueryRepository {
  constructor(
    @InjectModel(BlogMongooseEntity.name) private readonly blogModel: BlogModel,
    @InjectModel(Post.name) private readonly postModel: PostModel,
    protected postMapper: PostMapper,
  ) {}

  async getBlogById(id: string): Promise<BlogViewDTO | null> {
    try {
      const foundBlog: BlogDocument | null = await this.blogModel
        .findOne({ id: id })
        .exec();
      if (!foundBlog) {
        return null;
      }

      return blogMapping(foundBlog);
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
    const filter: mongoose.FilterQuery<BlogDocument> = {};
    try {
      if (searchNameTerm) {
        filter.name = {
          $regex: searchNameTerm,
          $options: 'i',
        };
      }

      const calculateOfFiles = await this.blogModel.countDocuments(filter);
      const foundBlogs: BlogDocument[] = await this.blogModel
        .find(filter)
        .sort({
          [sortBy]: getDirection(sortDirection),
          [DEFAULT_PAGE_SortBy]: getDirection(sortDirection),
        })
        .skip(getSkip(getPageNumber(pageNumber), pageSize))
        .limit(pageSize)
        .lean();

      return {
        pagesCount: pagesCounter(calculateOfFiles, pageSize),
        page: pageNumber,
        pageSize: pageSize,
        totalCount: calculateOfFiles,
        items: blogsMapping(foundBlogs),
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
    const filter: mongoose.FilterQuery<BlogDocument> = {
      'blogOwnerInfo.userId': userInfo.userId,
    };
    try {
      if (searchNameTerm) {
        filter.name = {
          $regex: searchNameTerm,
          $options: 'i',
        };
      }

      const calculateOfFiles = await this.blogModel.countDocuments(filter);
      const foundBlogs: BlogDocument[] = await this.blogModel
        .find(filter)
        .sort({
          [getSortBy(sortBy)]: getDirection(sortDirection),
          [DEFAULT_PAGE_SortBy]: getDirection(sortDirection),
        })
        .skip(getSkip(getPageNumber(pageNumber), getPageSize(pageSize)))
        .limit(getPageSize(pageSize))
        .lean()
        .exec();

      return {
        pagesCount: pagesCounter(calculateOfFiles, pageSize),
        page: getPageNumber(pageNumber),
        pageSize: getPageSize(pageSize),
        totalCount: calculateOfFiles,
        items: blogsMapping(foundBlogs),
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
      const blogIdForPosts = await this.blogModel.findById({ id: blogId });
      if (!blogIdForPosts) {
        return null;
      }

      const calculateOfFiles = await this.postModel.countDocuments({ blogId });
      const Posts: PostCreateDTO[] = await this.postModel
        .find({
          blogId: blogId,
        })
        .sort({
          [getSortBy(sortBy)]: getDirection(sortDirection),
          [DEFAULT_PAGE_SortBy]: getDirection(sortDirection),
        })
        .skip(getSkip(getPageNumber(pageNumber), getPageSize(pageSize)))
        .limit(getPageSize(pageSize))
        .exec();

      return {
        pagesCount: pagesCounter(calculateOfFiles, pageSize),
        page: getPageNumber(pageNumber),
        pageSize: getPageSize(pageSize),
        totalCount: calculateOfFiles,
        items: await this.postMapper.mapPosts(Posts, userId),
      };
    } catch (e) {
      console.log(e, 'error getSortedPostsByBlogID');
      throw new Error();
    }
  }

  async getSortedBlogsForSA(
    pageNumber?: number,
    pageSize?: number,
    sortBy?: string,
    sortDirection?: string,
    searchNameTerm?: string,
  ): Promise<PaginatorType<SABlogViewDTO[]>> {
    const filter: mongoose.FilterQuery<BlogDocument> = {};
    try {
      if (searchNameTerm) {
        filter.name = {
          $regex: searchNameTerm,
          $options: 'i',
        };
      }

      const calculateOfFiles = await this.blogModel.countDocuments(filter);
      const foundBlogs: BlogDocument[] = await this.blogModel
        .find(filter)
        .sort({
          [getSortBy(sortBy)]: getDirection(sortDirection),
          [DEFAULT_PAGE_SortBy]: getDirection(sortDirection),
        })
        .skip(getSkip(getPageNumber(pageNumber), getPageSize(pageSize)))
        .limit(getPageSize(pageSize))
        .lean()
        .exec();

      return {
        pagesCount: pagesCounter(calculateOfFiles, pageSize),
        page: getPageNumber(pageNumber),
        pageSize: getPageSize(pageSize),
        totalCount: calculateOfFiles,
        items: blogsMapperSA(foundBlogs),
      };
    } catch (e) {
      console.log(e, 'getSortedBlogs method error');
      throw new Error();
    }
  }
}
