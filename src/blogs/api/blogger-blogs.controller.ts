import {
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
import {
  PaginatorType,
  QueryInputModel,
  SearchNameTerm,
} from '../../infrastructure/pagination/pagination.models';
import { BlogsQueryRepo } from '../infrastructure/repositories/mongo/blogs.query.repo';
import { BlogInputModel, BlogViewDTO } from '../dto/blog.models';
import { JwtBearerGuard } from '../../auth/infrastructure/guards/jwt-bearer-auth.guard';
import { BlogsService } from '../application/blogs.service';
import { DevicesService } from '../../devices/application/devices.service';
import { PostsService } from '../../posts/application/posts.service';
import { BlogPostInputModel, PostViewDTO } from '../../posts/dto/post.models';
import { UserInfo } from '../../users/dto/view/user-view.models';
import { CurrentSessionInfoFromAccessJWT } from '../../auth/infrastructure/decorators/current-session-info-jwt';
import { CommentsQueryRepo } from '../../comments/infrastructure/repositories/mongo/comments.query.repository';

@Controller('blogger/blogs')
export class BloggerBlogsController {
  constructor(
    private blogsQueryRepo: BlogsQueryRepo,
    private blogsService: BlogsService,
    private devicesService: DevicesService,
    private postsService: PostsService,
    private commentsQueryRepo: CommentsQueryRepo,
  ) {}

  // Получение всех комментариев для блогов текущего пользователя
  @Get('comments')
  @UseGuards(JwtBearerGuard)
  async getAllCommentsForBlogs(
    @Query() query: QueryInputModel,
    @CurrentSessionInfoFromAccessJWT()
    sessionInfo: { userInfo: UserInfo; deviceId: string },
  ) {
    return this.commentsQueryRepo.getAllCommentsForCurrentBlogger(
      query,
      sessionInfo.userInfo,
    );
  }

  // Создание нового блога текущего пользователя
  @Post()
  @UseGuards(JwtBearerGuard)
  @HttpCode(HttpStatus.CREATED)
  async createBlog(
    @Body() inputModel: BlogInputModel,
    @CurrentSessionInfoFromAccessJWT()
    sessionInfo: { userInfo: UserInfo; deviceId: string },
  ) {
    const result: BlogViewDTO = await this.blogsService.createBlog(
      inputModel,
      sessionInfo.userInfo,
    );
    return result;
  }

  // Получение отсортированных блогов текущего пользователя
  @Get()
  @UseGuards(JwtBearerGuard)
  async getBlogs(
    @Query() query: QueryInputModel,
    @Query() queryName: SearchNameTerm,
    @CurrentSessionInfoFromAccessJWT()
    sessionInfo: { userInfo: UserInfo; deviceId: string },
  ) {
    return this.blogsQueryRepo.getSortedBlogsForCurrentBlogger(
      sessionInfo.userInfo,
      query.pageNumber,
      query.pageSize,
      query.sortBy,
      query.sortDirection,
      queryName.searchNameTerm,
    );
  }

  // Обновление блога текущего пользователя
  @Put(':blogId')
  @UseGuards(JwtBearerGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlog(
    @Param('blogId') blogId: string,
    @Body() inputModel: BlogInputModel,
    @CurrentSessionInfoFromAccessJWT()
    sessionInfo: { userInfo: UserInfo; deviceId: string },
  ) {
    const result: boolean | null | number = await this.blogsService.updateBlog(
      blogId,
      inputModel,
      sessionInfo.userInfo,
    );

    if (result === null) {
      throw new NotFoundException();
    }

    if (result === false) {
      throw new ForbiddenException();
    }
  }

  // Удаление блога текущего пользователя
  @Delete(':blogId')
  @UseGuards(JwtBearerGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog(
    @Param('blogId') blogId: string,
    @CurrentSessionInfoFromAccessJWT()
    sessionInfo: { userInfo: UserInfo; deviceId: string },
  ) {
    const result = await this.blogsService.deleteBlog(
      blogId,
      sessionInfo.userInfo,
    );

    if (result === null) {
      throw new NotFoundException();
    }

    if (result === false) {
      throw new ForbiddenException();
    }
  }

  // Создание нового поста в блоге текущего пользователя
  @UseGuards(JwtBearerGuard)
  @Post(':blogId/posts')
  @HttpCode(HttpStatus.CREATED)
  async createPost(
    @Param('blogId') blogId: string,
    @Body() inputModel: BlogPostInputModel,
    @CurrentSessionInfoFromAccessJWT()
    sessionInfo: { userInfo: UserInfo; deviceId: string },
  ) {
    const result: boolean | PostViewDTO | null =
      await this.postsService.createPostByBLog(
        blogId,
        inputModel,
        sessionInfo.userInfo,
      );

    if (result === null) {
      throw new NotFoundException();
    }

    if (result === false) {
      throw new ForbiddenException();
    }

    return result;
  }

  // Получение постов в блоге текущего пользователя
  @Get(':blogId/posts')
  @UseGuards(JwtBearerGuard)
  async getPostsByBlog(
    @Param('blogId') blogId: string,
    @Query() query: QueryInputModel,
    @CurrentSessionInfoFromAccessJWT()
    sessionInfo: { userInfo: UserInfo; deviceId: string },
  ): Promise<PaginatorType<PostViewDTO[]>> {
    const getPostsByBlogId = await this.blogsQueryRepo.getSortedPostsBlog(
      blogId,
      query.pageNumber,
      query.pageSize,
      query.sortBy,
      query.sortDirection,
      sessionInfo.userInfo.userId,
    );

    if (!getPostsByBlogId) {
      throw new NotFoundException();
    }
    return getPostsByBlogId;
  }

  // Обновление поста в блоге текущего пользователя
  @Put(':blogId/posts/:postId')
  @UseGuards(JwtBearerGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePost(
    @Param('blogId') blogId: string,
    @Param('postId') postId: string,
    @Body() inputModel: BlogPostInputModel,
    @CurrentSessionInfoFromAccessJWT()
    sessionInfo: { userInfo: UserInfo; deviceId: string },
  ) {
    const result: boolean | null = await this.postsService.updatePost(
      postId,
      blogId,
      sessionInfo.userInfo,
      inputModel,
    );

    if (result === null) {
      throw new NotFoundException('Not Found');
    }
    if (result === false) {
      throw new ForbiddenException();
    }
  }

  // Удаление поста в блоге текущего пользователя
  @UseGuards(JwtBearerGuard)
  @Delete(':blogId/posts/:postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(
    @Param('blogId') blogId: string,
    @Param('postId') postId: string,
    @CurrentSessionInfoFromAccessJWT()
    sessionInfo: { userInfo: UserInfo; deviceId: string },
  ) {
    const result: Document | null | boolean =
      await this.postsService.deletePost(postId, blogId, sessionInfo.userInfo);

    if (result === null) {
      throw new NotFoundException('Not Found');
    }

    if (result === false) {
      throw new ForbiddenException();
    }
  }
}
