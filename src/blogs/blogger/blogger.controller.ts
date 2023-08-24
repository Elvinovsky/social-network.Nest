import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtRefreshGuard } from '../../auth/guards/jwt-refresh.guard';
import {
  QueryInputModel,
  SearchNameTerm,
} from '../../pagination/pagination.models';
import { CurrentUserIdHeaders } from '../../auth/decorators/current-userId-headers';
import { BlogsQueryRepo } from '../blogs.query.repo';

@Controller('/blogger')
export class BloggerController {
  constructor(private blogsQueryRepo: BlogsQueryRepo) {}
  @Get('blogs')
  @UseGuards(JwtRefreshGuard)
  async getBlogsForOwner(
    @Query() query: QueryInputModel & SearchNameTerm,
    @CurrentUserIdHeaders() userId: string,
  ) {
    return this.blogsQueryRepo.getSortedBlogsForCurrentBlogger(
      query.searchNameTerm,
      query.pageNumber,
      query.pageSize,
      query.sortBy,
      query.sortDirection,
      userId,
    );
  }
}
