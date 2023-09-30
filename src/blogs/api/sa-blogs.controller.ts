import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
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
import { BasicAuthGuard } from '../../auth/infrastructure/guards/basic-auth.guard';
import {
  PaginatorType,
  QueryInputModel,
  SearchNameTerm,
} from '../../infrastructure/pagination/pagination.models';
import { BlogsQueryRepo } from '../infrastructure/repositories/mongo/blogs.query.repo';
import { UsersService } from '../../users/application/users.service';
import { BlogsService } from '../application/blogs.service';
import { BlogInputModel, BlogViewDTO } from '../dto/blog.models';
import { BlogPostInputModel, PostViewDTO } from '../../posts/dto/post.models';
import { PostsService } from '../../posts/application/posts.service';

@Controller('sa/blogs')
export class SaBlogsController {
  constructor(
    private blogsQueryRepo: BlogsQueryRepo,
    private blogsService: BlogsService,
    private usersService: UsersService,
    private postsService: PostsService,
  ) {}

  @Get()
  @UseGuards(BasicAuthGuard)
  async getBlogs(
    @Query() query: QueryInputModel,
    @Query() search: SearchNameTerm,
  ) {
    console.log(query);
    return this.blogsQueryRepo.getSortedBlogsForSA(
      query.pageNumber,
      query.pageSize,
      query.sortBy,
      query.sortDirection,
      search.searchNameTerm,
    );
  }

  @Post()
  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createBlog(@Body() inputModel: BlogInputModel) {
    const result: BlogViewDTO = await this.blogsService.createBlogSA(
      inputModel,
    );
    return result;
  }

  @Put(':blogId')
  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlog(
    @Param('blogId') blogId: string,
    @Body() inputModel: BlogInputModel,
  ) {
    const result: boolean | null | number =
      await this.blogsService.updateBlogSA(blogId, inputModel);

    if (result === null) {
      throw new NotFoundException();
    }
    if (result === false) {
      throw new ForbiddenException();
    }
  }
  @Delete(':blogId')
  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog(@Param('blogId') blogId: string) {
    const result = await this.blogsService.deleteBlogSA(blogId);

    if (result === null) {
      throw new NotFoundException();
    }
  }

  // Получение постов в блоге текущего пользователя
  @Get(':blogId/posts')
  @UseGuards(BasicAuthGuard)
  async getPostsByBlog(
    @Param('blogId') blogId: string,
    @Query() query: QueryInputModel,
  ): Promise<PaginatorType<PostViewDTO[]>> {
    const getPostsByBlogId = await this.blogsQueryRepo.getSortedPostsBlog(
      blogId,
      query.pageNumber,
      query.pageSize,
      query.sortBy,
      query.sortDirection,
    );

    if (!getPostsByBlogId) {
      throw new NotFoundException();
    }
    return getPostsByBlogId;
  }
  @Post(':blogId/posts')
  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createPost(
    @Param('blogId') blogId: string,
    @Body() inputModel: BlogPostInputModel,
  ) {
    const result: boolean | PostViewDTO | null =
      await this.postsService.createPostByBLog(blogId, inputModel);

    if (result === null) {
      throw new NotFoundException();
    }

    return result;
  }

  @Put(':blogId/posts/:postId')
  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePost(
    @Param('blogId') blogId: string,
    @Param('postId') postId: string,
    @Body() inputModel: BlogPostInputModel,
  ) {
    const result: boolean | null = await this.postsService.updatePostSA(
      postId,
      blogId,
      inputModel,
    );

    if (result === null) {
      throw new NotFoundException('Not Found');
    }
    if (result === false) {
      throw new ForbiddenException();
    }
  }

  @Delete(':blogId/posts/:postId')
  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(
    @Param('blogId') blogId: string,
    @Param('postId') postId: string,
  ) {
    const result: Document | null | boolean =
      await this.postsService.deletePostSA(postId, blogId);

    if (result === null) {
      throw new NotFoundException('Not Found');
    }

    if (result === false) {
      throw new ForbiddenException();
    }
  }

  @Put(':id/bind-with-user/:userId')
  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async bindWithUser(@Param('id') id: string, @Param('userId') userId: string) {
    const foundBlog = await this.blogsService.findById(id);

    if (!foundBlog) {
      throw new BadRequestException([
        {
          field: 'blogId',
          message: 'Blog with given id does not exist',
        },
      ]);
    } else if (foundBlog.blogOwnerInfo?.userId) {
      throw new BadRequestException([
        {
          field: 'blogId',
          message: 'Blog already bound to user',
        },
      ]);
    }

    const foundUser = await this.usersService.getUserSA(userId);

    if (!foundUser) {
      throw new BadRequestException([
        {
          field: 'userId',
          message: 'User with given id does not exist',
        },
      ]);
    }
    const userInfo = {
      userId: foundUser.id,
      userLogin: foundUser.login,
    };
    const bind = await this.blogsService.bindWithUser(userInfo, id);
  }
}
