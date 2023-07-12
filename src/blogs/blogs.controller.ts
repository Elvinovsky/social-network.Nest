import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
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

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getBlog(@Param('id') blogId: string): Promise<BlogViewDTO> {
    const blog = await this.blogsQueryRepo.getBlogById(blogId);

    if (!blog) {
      throw new NotFoundException();
    }
    //todo if (!blog) {
    //   throw new Ex();
    // }

    return blog;
  }

  @Get(':blogId/posts')
  async getPostsByBlog(
    @Param('blogId') blogId: string,
    @Query() query: QueryInputModel,
  ): Promise<PaginatorType<PostViewDTO[]>> {
    const getPostsByBlogId = await this.blogsQueryRepo.getPostsByBlogID(
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
  async createBlog(@Body() inputModel: BlogInputModel): Promise<BlogViewDTO> {
    const newBlog: BlogViewDTO = await this.blogsService.createBlog(inputModel);

    return newBlog;
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
    if (!foundBlog) {
      throw new HttpException('post not create', HttpStatus.EXPECTATION_FAILED);
    }

    return foundBlog;
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlog(
    @Param('id') blogId: string,
    @Body() inputModel: BlogInputModel,
  ) {
    const result: boolean | null = await this.blogsService.updateBlog(
      blogId,
      inputModel,
    );

    if (result === null) {
      throw new NotFoundException();
    }
    if (!result) {
      throw new HttpException('failed', HttpStatus.EXPECTATION_FAILED);
    }
  }
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog(@Param('id') blogId: string) {
    const result = await this.blogsService.deleteBlog(blogId);

    if (result === null) {
      throw new NotFoundException();
    }
    if (!result) {
      throw new HttpException('failed', HttpStatus.EXPECTATION_FAILED);
    }
  }
}
