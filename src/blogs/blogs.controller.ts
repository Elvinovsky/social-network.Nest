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
import { BlogsQueryRepo } from './blogs.query.repo';
import { BlogViewDTO } from './blog.models';
import { BlogPostInputModel, PostViewDTO } from '../posts/post.models';
import { BlogsService } from './blogs.service';
import { PostsService } from '../posts/posts.service';
import { BasicAuthGuard } from '../auth/guards/basic-auth.guard';
import { OptionalBearerGuard } from '../auth/guards/optional-bearer.guard';
import { CurrentUserIdOptional } from '../auth/decorators/current-userId-optional.decorator';
import { ObjectIdPipe } from '../common/pipes/object-id.pipe';

@Controller('blogs')
export class BlogsController {
  constructor(
    private readonly blogsQueryRepo: BlogsQueryRepo,
    protected blogsService: BlogsService,
    private readonly postsService: PostsService,
  ) {}

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

  @UseGuards(BasicAuthGuard)
  @Post(':blogId/posts')
  @HttpCode(HttpStatus.CREATED)
  async createPostByBlog(
    @Param('blogId', ObjectIdPipe) blogId: string,
    @Body() inputModel: BlogPostInputModel,
  ) {
    const foundBlog: PostViewDTO | null =
      await this.postsService.createPostByBLog(blogId, inputModel);

    if (foundBlog === null) {
      throw new NotFoundException();
    }
    return foundBlog;
  }
}
