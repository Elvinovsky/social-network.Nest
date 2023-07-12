import { Controller, Get, Query } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsQueryRepo } from './posts.query.repo';
import {
  QueryInputModel,
  SearchTitleTerm,
} from '../pagination/pagination.models';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly postsQueryRepo: PostsQueryRepo,
  ) {}
  @Get('/')
  async getPosts(@Query() query: QueryInputModel & SearchTitleTerm) {
    return await this.postsQueryRepo.getSortedPosts(
      query.searchTitleTerm,
      Number(query.pageNumber),
      Number(query.pageSize),
      query.sortBy,
      query.sortDirection,
      //user?.id
    );
  }
}
