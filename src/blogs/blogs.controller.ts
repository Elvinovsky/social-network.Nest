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
    const blog = await this.blogsQueryRepo.getBlogById(blogId);

    if (!blog) {
      throw new NotFoundException();
    }
    return blog;
  }

  @Get(':blogId/posts')
  async getPostsByBlog(
    @Param('blogId') blogId: string,
    @Query() query: QueryInputModel,
  ): Promise<PaginatorType<PostViewDTO[]>> {
    const getPostsByBlogId = await this.blogsQueryRepo.getSortedPostsBlog(
      blogId,
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
    @Param('blogId') blogId: string,
    @Body() inputModel: BlogPostInputModel,
  ) {
    const foundBlog = await this.postsService.createPostByBLog(
      blogId,
      inputModel,
    );

    if (foundBlog === null) {
      throw new NotFoundException();
    }
    return foundBlog;
  }

  @Put(':blogId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlog(
    @Param('blogId') blogId: string,
    @Body() inputModel: BlogInputModel,
  ) {
    const result: boolean | null | void = await this.blogsService.updateBlog(
      blogId,
      inputModel,
    );

    if (result === null) {
      throw new NotFoundException();
    }
  }
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog(@Param('id') blogId: string) {
    const result = await this.blogsService.deleteBlog(blogId);

    if (result === null) {
      throw new NotFoundException();
    }
  }
}
