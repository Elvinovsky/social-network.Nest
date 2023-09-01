import {
  BadRequestException,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BasicAuthGuard } from '../../auth/guards/basic-auth.guard';
import {
  QueryInputModel,
  SearchNameTerm,
} from '../../pagination/pagination.models';
import { BlogsQueryRepo } from '../../blogs/infrastructure/repositories/blogs.query.repo';
import { ObjectIdPipe } from '../../common/pipes/object-id.pipe';
import { UsersService } from '../../users/aplication/users.service';
import { BlogsService } from '../../blogs/application/blogs.service';

@Controller('sa/blogs')
export class SaBlogsController {
  constructor(
    private blogsQueryRepo: BlogsQueryRepo,
    private blogsService: BlogsService,
    private usersService: UsersService,
  ) {}

  @Get()
  @UseGuards(BasicAuthGuard)
  async getBlogs(@Query() query: QueryInputModel & SearchNameTerm) {
    return this.blogsQueryRepo.getSortedBlogsForSA(
      query.searchNameTerm,
      query.pageNumber,
      query.pageSize,
      query.sortBy,
      query.sortDirection,
    );
  }

  @Put(':id/bind-with-user/:userId')
  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async bindWithUser(
    @Param('id', ObjectIdPipe) id: string,
    @Param('userId') userId: string,
  ) {
    const foundBlog = await this.blogsService.findById(id);

    if (!foundBlog) {
      throw new BadRequestException([
        {
          field: 'blogId',
          message: 'Blog with given id does not exist',
        },
      ]);
    } else if (foundBlog.blogOwnerInfo.userId) {
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
