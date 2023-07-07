import { PaginatorType } from '../pagination/pagination.models';
import { BlogViewDTO } from './blog.models';
import * as mongoose from 'mongoose';
import { Blog, BlogDocument, BlogModel } from './blog.schemas';
import { Injectable } from '@nestjs/common';
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
import { blogsMapping } from './blog.helpers';
@Injectable()
export class BlogsQueryRepo {
  constructor(@InjectModel(Blog.name) private blogModel: BlogModel) {}
  async getAllBlogs(
    searchNameTerm?: string,
    pageNumber?: number,
    pageSize?: number,
    sortBy?: string,
    sortDirection?: string,
  ): Promise<PaginatorType<BlogViewDTO[]>> {
    const filter: mongoose.FilterQuery<BlogDocument> = {};
    if (searchNameTerm) {
      filter.name = { $regex: searchNameTerm, $options: 'i' };
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
      .lean();

    return {
      pagesCount: pagesCountOfBlogs(calculateOfFiles, pageSize),
      page: getPageNumber(pageNumber),
      pageSize: getPageSize(pageSize),
      totalCount: calculateOfFiles,
      items: blogsMapping(foundBlogs),
    };
  }
  // async searchPostByBlogId(
  //   blogId: string,
  //   pageNumber: number,
  //   pageSize: number,
  //   sortBy?: string,
  //   sortDirection?: string,
  //   userId?: string,
  // ): Promise<PaginatorType<PostView[]> | null> {
  //   const blogIdForPost = await PostModelClass.findOne({ blogId: blogId }); //express validator .custom
  //   if (!blogIdForPost) {
  //     return null;
  //   }
  //   const calculateOfFiles = await PostModelClass.countDocuments({ blogId });
  //
  //   const foundBlogs: WithId<PostDBModel>[] = await PostModelClass.find({
  //     blogId,
  //   })
  //     .sort({
  //       [getSortBy(sortBy)]: getDirection(sortDirection),
  //       [DEFAULT_PAGE_SortBy]: getDirection(sortDirection),
  //     })
  //     .skip(getSkip(getPageNumber(pageNumber), getPageSize(pageSize)))
  //     .limit(getPageSize(pageSize))
  //     .lean();
  //   return {
  //     pagesCount: pagesCountOfBlogs(calculateOfFiles, pageSize),
  //     page: getPageNumber(pageNumber),
  //     pageSize: getPageSize(pageSize),
  //     totalCount: calculateOfFiles,
  //     items: await postsMapping(foundBlogs, userId),
  //   };
  // }
}
