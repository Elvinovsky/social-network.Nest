import { PaginatorType } from '../pagination/pagination.models';
import { BlogViewDTO } from './blog.models';
import * as mongoose from 'mongoose';
import { Blog, BlogDocument, BlogModel } from './blog.schemas';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  getDirection,
  getPageNumber,
  getPageSize,
  getSkip,
  getSortBy,
  pagesCountOfBlogs,
} from '../pagination/pagination.helpers';
import { DEFAULT_PAGE_SortBy } from '../common/constant';
import { blogMapping, blogsMapping } from './blog.helpers';
import { objectIdHelper } from '../common/helpers';
import { PostViewDTO } from '../posts/post.models';
import { Post, PostDocument, PostModel } from '../posts/post.schemas';
import { PostMapper } from '../posts/post.helpers';
@Injectable()
export class BlogsQueryRepo {
  constructor(
    @InjectModel(Blog.name) private readonly blogModel: BlogModel,
    @InjectModel(Post.name) private readonly postModel: PostModel,
    private readonly postMapper: PostMapper,
  ) {}

  async getBlogById(id: string): Promise<BlogViewDTO | null> {
    try {
      if (!objectIdHelper(id)) return null;

      const foundBlog: BlogDocument | null = await this.blogModel
        .findById(objectIdHelper(id))
        .exec();
      if (!foundBlog) {
        return null;
      }

      return blogMapping(foundBlog);
    } catch (e) {
      console.log(e, 'error findBlogById method');
      throw new HttpException('failed', HttpStatus.EXPECTATION_FAILED);
    }
  }

  async getSortedBlogs(
    searchNameTerm?: string,
    pageNumber?: number,
    pageSize?: number,
    sortBy?: string,
    sortDirection?: string,
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
          [getSortBy(sortBy)]: getDirection(sortDirection),
          [DEFAULT_PAGE_SortBy]: getDirection(sortDirection),
        })
        .skip(getSkip(getPageNumber(pageNumber), getPageSize(pageSize)))
        .limit(getPageSize(pageSize))
        .lean()
        .exec();

      return {
        pagesCount: pagesCountOfBlogs(calculateOfFiles, pageSize),
        page: getPageNumber(pageNumber),
        pageSize: getPageSize(pageSize),
        totalCount: calculateOfFiles,
        items: blogsMapping(foundBlogs),
      };
    } catch (e) {
      console.log(e, 'getSortedBlogs method error');
      throw new HttpException('failed', HttpStatus.EXPECTATION_FAILED);
    }
  }
  async getSortedPostsBlog(
    blogId: string,
    pageNumber: number,
    pageSize: number,
    sortBy?: string,
    sortDirection?: string,
    userId?: string,
  ): Promise<PaginatorType<PostViewDTO[]> | null> {
    try {
      if (!objectIdHelper(blogId)) return null;

      const blogIdForPosts = await this.blogModel.findById(
        objectIdHelper(blogId),
      );
      if (!blogIdForPosts) {
        return null;
      }

      const calculateOfFiles = await this.postModel.countDocuments({ blogId });
      const Posts: PostDocument[] = await this.postModel
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
        pagesCount: pagesCountOfBlogs(calculateOfFiles, pageSize),
        page: getPageNumber(pageNumber),
        pageSize: getPageSize(pageSize),
        totalCount: calculateOfFiles,
        items: await this.postMapper.mapPosts(Posts, userId),
      };
    } catch (e) {
      console.log(e, 'error getSortedPostsByBlogID');
      throw new HttpException('failed', HttpStatus.EXPECTATION_FAILED);
    }
  }
}
