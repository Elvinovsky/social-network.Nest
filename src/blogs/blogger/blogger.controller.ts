import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
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

@Controller('blogger')
export class BloggerController {
  constructor(
    private blogsQueryRepo: BlogsQueryRepo,
    private blogsService: BlogsService,
    private devicesService: DevicesService,
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
    //todo как по другому реализовать логику валидации на 'logout' действие юзера
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
}
