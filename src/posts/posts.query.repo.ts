import { Injectable } from '@nestjs/common';
import mongoose from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument, PostModel } from './post.schemas';
import { PaginatorType } from '../pagination/pagination.models';
import { PostViewDTO } from './post.models';
import {
  getDirection,
  getPageNumber,
  getPageSize,
  getSkip,
  getSortBy,
  pagesCountOfBlogs,
} from '../pagination/pagination.helpers';
import { DEFAULT_PAGE_SortBy } from '../common/constant';
import { PostMapper } from './post.helpers';

@Injectable()
export class PostsQueryRepo {
  constructor(
    @InjectModel(Post.name) private postModel: PostModel,
    private postsMapping: PostMapper,
  ) {}

  async getSortedPosts(
    searchTitleTerm: string | undefined,
    pageNumber?: number,
    pageSize?: number,
    sortBy?: string,
    sortDirection?: string,
    userId?: string,
  ): Promise<PaginatorType<PostViewDTO[]>> {
    const filter: mongoose.FilterQuery<PostDocument> = {};
    if (searchTitleTerm) {
      filter.title = { $regex: searchTitleTerm, $options: 'i' };
    }

    const calculateOfFiles = await this.postModel.countDocuments(filter);
    const foundPosts: PostDocument[] = await this.postModel
      .find(filter)
      .sort({
        [getSortBy(sortBy)]: getDirection(sortDirection),
        [DEFAULT_PAGE_SortBy]: getDirection(sortDirection),
      })
      .skip(getSkip(getPageNumber(pageNumber), getPageSize(pageSize)))
      .limit(getPageSize(pageSize));
    return {
      pagesCount: pagesCountOfBlogs(calculateOfFiles, pageSize),
      page: getPageNumber(pageNumber),
      pageSize: getPageSize(pageSize),
      totalCount: calculateOfFiles,
      items: await this.postsMapping.posts(foundPosts, userId),
    };
  }
}
