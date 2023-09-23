import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  PaginatorType,
  QueryInputModel,
  SearchNameTerm,
} from '../pagination/pagination.models';
import { BlogsQueryRepo } from './infrastructure/repositories/blogs.query.repo';
import { BlogViewDTO } from './blog.models';
import { PostViewDTO } from '../posts/post.models';
import { OptionalBearerGuard } from '../auth/guards/optional-bearer.guard';
import { CurrentUserIdOptional } from '../auth/decorators/current-userId-optional.decorator';
import { ParamUUIdPipe } from '../common/pipes/object-id.pipe';

@Controller('blogs')
export class BlogsController {
  constructor(private readonly blogsQueryRepo: BlogsQueryRepo) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getBlogs(
    @Query() query: QueryInputModel,
    @Query() queryName: SearchNameTerm,
  ): Promise<PaginatorType<BlogViewDTO[]>> {
    console.log(query);
    return await this.blogsQueryRepo.getSortedBlogs(
      query.pageNumber,
      query.pageSize,
      query.sortBy,
      query.sortDirection,
      queryName?.searchNameTerm,
    );
  }

  @Get(':blogId')
  @HttpCode(HttpStatus.OK)
  async getBlog(
    @Param('blogId', ParamUUIdPipe) blogId: string,
  ): Promise<BlogViewDTO> {
    const blog: BlogViewDTO | null = await this.blogsQueryRepo.getBlogById(
      blogId,
    );

    if (!blog) {
      throw new NotFoundException();
    }
    return blog;
  }

  @Get(':blogId/posts')
  @UseGuards(OptionalBearerGuard)
  async getPostsByBlog(
    @Param('blogId') blogId: string,
    @Query() query: QueryInputModel,
    @CurrentUserIdOptional() userId?: string,
  ): Promise<PaginatorType<PostViewDTO[]>> {
    console.log(query);
    const getPostsByBlogId = await this.blogsQueryRepo.getSortedPostsBlog(
      blogId,
      query.pageNumber,
      query.pageSize,
      query.sortBy,
      query.sortDirection,
      userId,
    );

    if (!getPostsByBlogId) {
      throw new NotFoundException();
    }
    return getPostsByBlogId;
  }
}
