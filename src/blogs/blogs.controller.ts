import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  PaginatorType,
  QueryInputModel,
  SearchNameTerm,
} from '../pagination/pagination.models';
import { BlogsQueryRepo } from './infrastructure/repositories/blogs.query.repo';
import { BlogInputModel, BlogViewDTO } from './blog.models';
import { PostViewDTO } from '../posts/post.models';
import { OptionalBearerGuard } from '../auth/guards/optional-bearer.guard';
import { CurrentUserIdOptional } from '../auth/decorators/current-userId-optional.decorator';
import { JwtBearerGuard } from '../auth/guards/jwt-bearer-auth.guard';
import { CurrentUserIdFromBearerJWT } from '../auth/decorators/current-userId-jwt';
import { UserInfo } from '../users/user.models';
import { BlogsService } from './application/blogs.service';
import { LocalAuthGuard } from '../auth/guards/local-auth.guard';
import { BasicAuthGuard } from '../auth/guards/basic-auth.guard';

@Controller('blogs')
export class BlogsController {
  constructor(
    private readonly blogsQueryRepo: BlogsQueryRepo,
    private blogsService: BlogsService,
  ) {}

  @Post()
  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createBlog(
    @Body() inputModel: BlogInputModel,
    @CurrentUserIdFromBearerJWT()
    sessionInfo: { userInfo: UserInfo; deviceId: string },
  ) {
    const result: BlogViewDTO = await this.blogsService.createBlog(
      inputModel,
      sessionInfo.userInfo,
    );
    return result;
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async getBlogs(
    @Query() query: QueryInputModel & SearchNameTerm,
  ): Promise<PaginatorType<BlogViewDTO[]>> {
    return await this.blogsQueryRepo.getSortedBlogs(
      query.searchNameTerm,
      query.pageNumber,
      query.pageSize,
      query.sortBy,
      query.sortDirection,
    );
  }

  @Get(':blogId')
  @HttpCode(HttpStatus.OK)
  async getBlog(@Param('blogId') blogId: string): Promise<BlogViewDTO> {
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
