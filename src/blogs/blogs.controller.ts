import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  PaginatorType,
  QueryInputModel,
  SearchNameTerm,
} from '../pagination/pagination.models';
import { BlogsQueryRepo } from './blogs.query.repo';
import { BlogInputModel, BlogViewDTO } from './blog.models';
import { BlogPostInputModel, PostViewDTO } from '../posts/post.models';
import { BlogsService } from './blogs.service';
import { PostsService } from '../posts/posts.service';
import { BasicAuthGuard } from '../auth/guards/basic-auth.guard';
import { ObjectIdPipe } from '../common/pipes/trim.pipe';
import { OptionalBearerGuard } from '../auth/guards/optional-bearer.guard';
import { CurrentUserIdOptional } from '../auth/decorators/current-userId-optional.decorator';

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
      Number(query.pageNumber),
      Number(query.pageSize),
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
      Number(query.pageNumber),
      Number(query.pageSize),
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
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createBlog(@Body() inputModel: BlogInputModel) {
    const result: BlogViewDTO = await this.blogsService.createBlog(inputModel);

    if (result === null) {
      throw new NotFoundException();
    }
    return result;
  }

  @UseGuards(BasicAuthGuard)
  @Post(':blogId/posts')
  @HttpCode(HttpStatus.CREATED)
  async createPostByBlog(
    @Param('blogId', ObjectIdPipe) blogId: string, // todo урать везде objectIdHelper() засетать пайп ObjectIdPipe
    @Body() inputModel: BlogPostInputModel,
  ) {
    const foundBlog: PostViewDTO | null =
      await this.postsService.createPostByBLog(blogId, inputModel);

    if (foundBlog === null) {
      throw new NotFoundException();
    }
    return foundBlog;
  }

  @UseGuards(BasicAuthGuard)
  @Put(':blogId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlog(
    @Param('blogId') blogId: string,
    @Body() inputModel: BlogInputModel,
  ) {
    const result: boolean | null = await this.blogsService.updateBlog(
      blogId,
      inputModel,
    );

    if (result === null) {
      throw new NotFoundException();
    }
  }

  @UseGuards(BasicAuthGuard)
  @Delete(':blogId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog(@Param('blogId') blogId: string) {
    const result = await this.blogsService.deleteBlog(blogId);

    if (result === null) {
      throw new NotFoundException();
    }
  }
}
