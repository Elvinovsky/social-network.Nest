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
} from '../../pagination/pagination.models';
import { CurrentUserIdFromBearerJWT } from '../../auth/decorators/current-userId-jwt';
import { BlogsQueryRepo } from '../../blogs/infrastructure/repositories/blogs.query.repo';
import { BlogInputModel, BlogViewDTO } from '../../blogs/blog.models';
import { JwtBearerGuard } from '../../auth/guards/jwt-bearer-auth.guard';
import { BlogsService } from '../../blogs/application/blogs.service';
import { DevicesService } from '../../devices/devices.service';
import { ObjectIdPipe } from '../../common/pipes/object-id.pipe';
import { PostsService } from '../../posts/posts.service';
import { BlogPostInputModel, PostViewDTO } from '../../posts/post.models';
import { UserInfo } from '../../users/user.models';
// import { CommentsQueryRepo } from '../../comments/comments.query.repository';

@Controller('blogger/blogs')
export class BloggerBlogsController {
  constructor(
    private blogsQueryRepo: BlogsQueryRepo,
    private blogsService: BlogsService,
    private devicesService: DevicesService,
    private postsService: PostsService, // private commentsQueryRepo: CommentsQueryRepo,
  ) {}
  // @Get('comments')
  // @UseGuards(JwtBearerGuard)
  // async getAllCommentsForBlogs(
  //   @Query() query: QueryInputModel,
  //   @CurrentUserIdFromBearerJWT()
  //   sessionInfo: { userInfo: UserInfo; deviceId: string },
  // ) {
  //   return this.commentsQueryRepo.getAllCommentsForCurrentBlogger(
  //     query,
  //     sessionInfo.userInfo,
  //   );
  // }

  @Post()
  @UseGuards(JwtBearerGuard)
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
  @UseGuards(JwtBearerGuard)
  async getBlogs(
    @Query() query: QueryInputModel & SearchNameTerm,
    @CurrentUserIdFromBearerJWT()
    sessionInfo: { userInfo: UserInfo; deviceId: string },
  ) {
    return this.blogsQueryRepo.getSortedBlogsForCurrentBlogger(
      sessionInfo.userInfo,
      query.searchNameTerm,
      query.pageNumber,
      query.pageSize,
      query.sortBy,
      query.sortDirection,
    );
  }

  @Put(':blogId')
  @UseGuards(JwtBearerGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlog(
    @Param('blogId', ObjectIdPipe) blogId: string,
    @Body() inputModel: BlogInputModel,
    @CurrentUserIdFromBearerJWT()
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

  @Delete(':blogId')
  @UseGuards(JwtBearerGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog(
    @Param('blogId', ObjectIdPipe) blogId: string,
    @CurrentUserIdFromBearerJWT()
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

  @UseGuards(JwtBearerGuard)
  @Post(':blogId/posts')
  @HttpCode(HttpStatus.CREATED)
  async createPost(
    @Param('blogId', ObjectIdPipe) blogId: string,
    @Body() inputModel: BlogPostInputModel,
    @CurrentUserIdFromBearerJWT()
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

  @Get(':blogId/posts/:postId')
  @UseGuards(JwtBearerGuard)
  async getPostsByBlog(
    @Param('blogId') blogId: string,
    @Query() query: QueryInputModel,
    @CurrentUserIdFromBearerJWT()
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

  @Put(':blogId/posts/:postId')
  @UseGuards(JwtBearerGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePost(
    @Param('blogId', ObjectIdPipe) blogId: string,
    @Param('postId', ObjectIdPipe) postId: string,
    @Body() inputModel: BlogPostInputModel,
    @CurrentUserIdFromBearerJWT()
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

  @UseGuards(JwtBearerGuard)
  @Delete(':blogId/posts/:postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(
    @Param('blogId', ObjectIdPipe) blogId: string,
    @Param('postId', ObjectIdPipe) postId: string,
    @CurrentUserIdFromBearerJWT()
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
