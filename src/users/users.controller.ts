import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './aplication/users.service';
import {
  QueryInputModel,
  SearchEmailTerm,
  SearchLoginTerm,
} from '../pagination/pagination.models';
import { UsersQueryRepository } from './infrastructure/users.query.repo';
import { BasicAuthGuard } from '../auth/guards/basic-auth.guard';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly usersQueryRepo: UsersQueryRepository,
  ) {}
  @Get()
  async getUsers(
    @Query() query: QueryInputModel & SearchEmailTerm & SearchLoginTerm,
  ) {
    return this.usersQueryRepo.getSortedUsers(
      query.searchEmailTerm,
      query.searchLoginTerm,
      query.pageNumber,
      query.pageSize,
      query.sortBy,
      query.sortDirection,
    );
  }
  @Get(':userId')
  async getUser(@Param('userId') userId: string) {
    const result = await this.usersService.getUser(userId);
    if (!result) {
      throw new NotFoundException();
    }
    return result;
  }

  @UseGuards(BasicAuthGuard)
  @Delete(':userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Param('userId') userId: string) {
    const result: Document | null = await this.usersService.deleteUserById(
      userId,
    );

    if (result === null) {
      throw new NotFoundException('user not found');
    }
  }
}
