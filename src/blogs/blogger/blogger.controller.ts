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
} from '../../pagination/pagination.models';
import { CurrentUserIdFromBearerJWT } from '../../auth/decorators/current-userId-jwt';
import { BlogsQueryRepo } from '../blogs.query.repo';
import { BlogInputModel, BlogViewDTO } from '../blog.models';
import { JwtBearerGuard } from '../../auth/guards/jwt-bearer-auth.guard';
import { BlogsService } from '../blogs.service';
import { DevicesService } from '../../devices/devices.service';
import { ObjectIdPipe } from '../../common/pipes/object-id.pipe';
import { PostsService } from '../../posts/posts.service';
import { BlogPostInputModel, PostViewDTO } from '../../posts/post.models';

@Controller('blogger/blogs')
export class BloggerController {
  constructor(
    private blogsQueryRepo: BlogsQueryRepo,
    private blogsService: BlogsService,
    private devicesService: DevicesService,
    private postsService: PostsService,
  ) {}
  @Get('blogs')
  @UseGuards(JwtBearerGuard)
  async getBlogsForOwner(
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

  @Post('blogs')
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
  async createPostByBlog(
    @Param('blogId', ObjectIdPipe) blogId: string,
    @Body() inputModel: BlogPostInputModel,
    @CurrentUserIdFromBearerJWT()
    sessionInfo: { userId: string; deviceId: string },
  ) {
    const createResult: boolean | PostViewDTO | null =
      await this.postsService.createPostByBLog(
        blogId,
        inputModel,
        sessionInfo.userId,
      );

    if (createResult === null) {
      throw new NotFoundException();
    }

    if (createResult === false) {
      throw new ForbiddenException();
    }

    return createResult;
  }
}
