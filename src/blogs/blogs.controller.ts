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
import { ParamObjectId } from '../common/models';

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
  async getBlog(@Param() params: ParamObjectId): Promise<BlogViewDTO> {
    const blog = await this.blogsQueryRepo.getBlogById(params.id);

    if (!blog) {
      throw new NotFoundException();
    }
    return blog;
  }

  @Get(':id/posts')
  async getPostsByBlog(
    @Param() params: ParamObjectId,
    @Query() query: QueryInputModel,
  ): Promise<PaginatorType<PostViewDTO[]>> {
    const getPostsByBlogId = await this.blogsQueryRepo.getSortedPostsBlog(
      params.id,
      Number(query.pageNumber),
      Number(query.pageSize),
      query.sortBy,
      query.sortDirection,
      // user?.id,
    );

    if (!getPostsByBlogId) {
      throw new NotFoundException();
    }
    return getPostsByBlogId;
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createBlog(@Body() inputModel: BlogInputModel) {
    const result: BlogViewDTO = await this.blogsService.createBlog(inputModel);

    if (result === null) {
      throw new NotFoundException();
    }
    return result;
  }

  @Post(':blogId/posts')
  @HttpCode(HttpStatus.CREATED)
  async createPostByBlog(
    @Param() params: ParamObjectId,
    @Body() inputModel: BlogPostInputModel,
  ) {
    const foundBlog: PostViewDTO | null =
      await this.postsService.createPostByBLog(params.id, inputModel);

    if (foundBlog === null) {
      throw new NotFoundException();
    }
    return foundBlog;
  }

  @Put(':blogId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlog(
    @Param() params: ParamObjectId,
    @Body() inputModel: BlogInputModel,
  ) {
    const result: boolean | null = await this.blogsService.updateBlog(
      params.id,
      inputModel,
    );

    if (result === null) {
      throw new NotFoundException();
    }
  }
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog(@Param() params: ParamObjectId) {
    const result = await this.blogsService.deleteBlog(params.id);

    if (result === null) {
      throw new NotFoundException();
    }
  }
}
