import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import mongoose from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import {
  Post,
  PostDocument,
  PostModel,
} from '../../../entities/mongoose/post-no-sql.schemas';
import { PaginatorType } from '../../../../infrastructure/pagination/pagination.models';
import { PostCreateDTO, PostViewDTO } from '../../../dto/post.models';
import {
  getDirection,
  getPageNumber,
  getPageSize,
  getSkip,
  getSortBy,
  pagesCountOfBlogs,
} from '../../../../infrastructure/pagination/pagination.helpers';
import { DEFAULT_PAGE_SortBy } from '../../../../infrastructure/common/constants';
import { PostMapper } from '../post-mapper';

@Injectable()
export class PostsQueryRepository {
  constructor(
    @InjectModel(Post.name) private postModel: PostModel,
    private postMapper: PostMapper,
  ) {}

  async getSortedPosts(
    pageNumber?: number,
    pageSize?: number,
    sortBy?: string,
    sortDirection?: string,
    userId?: string,
    searchTitleTerm?: string,
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
      items: await this.postMapper.mapPosts(foundPosts, userId),
    };
  }

  async getPostById(
    postId: string,
    userId?: string,
  ): Promise<PostViewDTO | null> {
    try {
      const post: PostCreateDTO | null = await this.postModel
        .findOne({ id: postId })
        .lean();

      if (!post) {
        return null;
      }

      return this.postMapper.mapPost(post, userId);
    } catch (e) {
      console.log(e, 'error getPostById method');
      throw new HttpException('failed', HttpStatus.EXPECTATION_FAILED);
    }
  }
}
