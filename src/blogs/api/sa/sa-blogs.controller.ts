import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { BasicAuthGuard } from '../../../auth/guards/basic-auth.guard';
import {
  QueryInputModel,
  SearchNameTerm,
} from '../../../pagination/pagination.models';
import { BlogsQueryRepo } from '../../infrastructure/repositories/blogs.query.repo';

@Controller('sa/blogs')
export class SaBlogsController {
  constructor(private blogsQueryRepo: BlogsQueryRepo) {}
  @Get()
  @UseGuards(BasicAuthGuard)
  async getBlogs(@Query() query: QueryInputModel & SearchNameTerm) {
    return this.blogsQueryRepo.getSortedBlogs();
  }
}
