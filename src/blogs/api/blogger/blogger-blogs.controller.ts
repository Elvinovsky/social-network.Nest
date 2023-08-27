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
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {
  QueryInputModel,
  SearchNameTerm,
} from '../../../pagination/pagination.models';
import { CurrentUserIdFromBearerJWT } from '../../../auth/decorators/current-userId-jwt';
import { BlogsQueryRepo } from '../../infrastructure/repositories/blogs.query.repo';
import { BlogInputModel, BlogViewDTO } from '../../blog.models';
import { JwtBearerGuard } from '../../../auth/guards/jwt-bearer-auth.guard';
import { BlogsService } from '../../application/blogs.service';
import { DevicesService } from '../../../devices/devices.service';
import { ObjectIdPipe } from '../../../common/pipes/object-id.pipe';
import { PostsService } from '../../../posts/posts.service';
import { BlogPostInputModel, PostViewDTO } from '../../../posts/post.models';

@Controller('blogger/blogs')
export class BloggerBlogsController {
  constructor(
    private blogsQueryRepo: BlogsQueryRepo,
    private blogsService: BlogsService,
    private devicesService: DevicesService,
    private postsService: PostsService,
  ) {}
  @Get()
  @UseGuards(JwtBearerGuard)
  async getBlogs(
    @Query() query: QueryInputModel & SearchNameTerm,
    @CurrentUserIdFromBearerJWT()
    sessionInfo: { userId: string; deviceId: string },
  ) {
    return this.blogsQueryRepo.getSortedBlogsForCurrentBlogger(
      query.searchNameTerm,
      query.pageNumber,
      query.pageSize,
      query.sortBy,
      query.sortDirection,
      sessionInfo.userId,
    );
  }

  @Post()
  @UseGuards(JwtBearerGuard)
  @HttpCode(HttpStatus.CREATED)
  async createBlog(
    @Body() inputModel: BlogInputModel,
    @CurrentUserIdFromBearerJWT()
    sessionInfo: { userId: string; deviceId: string },
  ) {
    //todo как иначе реализовать логику валидации на 'logout' юзера
    const isSessionLogged = await this.devicesService.findSessionByDeviceId(
      sessionInfo.deviceId,
    );
    if (!isSessionLogged) throw new UnauthorizedException();
    const result: BlogViewDTO = await this.blogsService.createBlog(
      inputModel,
      sessionInfo.userId,
    );
    return result;
  }

  @Put(':blogId')
  @UseGuards(JwtBearerGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlog(
    @Param('blogId', ObjectIdPipe) blogId: string,
    @Body() inputModel: BlogInputModel,
    @CurrentUserIdFromBearerJWT()
    sessionInfo: { userId: string; deviceId: string },
  ) {
    const result: boolean | null | number = await this.blogsService.updateBlog(
      blogId,
      inputModel,
      sessionInfo.userId,
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
    sessionInfo: { userId: string; deviceId: string },
  ) {
    const result = await this.blogsService.deleteBlog(
      blogId,
      sessionInfo.userId,
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
    sessionInfo: { userId: string; deviceId: string },
  ) {
    const result: boolean | PostViewDTO | null =
      await this.postsService.createPostByBLog(
        blogId,
        inputModel,
        sessionInfo.userId,
      );

    if (result === null) {
      throw new NotFoundException();
    }

    if (result === false) {
      throw new ForbiddenException();
    }

    return result;
  }

  @Put('blogId/posts/:postId')
  @UseGuards(JwtBearerGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePost(
    @Param('blogId', ObjectIdPipe) blogId: string,
    @Param('postId', ObjectIdPipe) postId: string,
    @Body() inputModel: BlogPostInputModel,
    @CurrentUserIdFromBearerJWT()
    sessionInfo: { userId: string; deviceId: string },
  ) {
    const result: boolean | null = await this.postsService.updatePost(
      postId,
      blogId,
      sessionInfo.userId,
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
  @Delete('blogId/posts/:postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(
    @Param('blogId', ObjectIdPipe) blogId: string,
    @Param('postId', ObjectIdPipe) postId: string,
    @CurrentUserIdFromBearerJWT()
    sessionInfo: { userId: string; deviceId: string },
  ) {
    const result: Document | null | boolean =
      await this.postsService.deletePost(postId, blogId, sessionInfo.userId);

    if (result === null) {
      throw new NotFoundException('Not Found');
    }

    if (result === false) {
      throw new ForbiddenException();
    }
  }
}
