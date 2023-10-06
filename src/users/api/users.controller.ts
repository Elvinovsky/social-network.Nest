import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
} from '@nestjs/common';
import { UsersService } from '../application/users.service';
import {
  QueryInputModel,
  SearchEmailTerm,
  SearchLoginTerm,
} from '../../infrastructure/pagination/pagination.models';
import { UsersMongooseQueryRepository } from '../infrastructure/repositories/mongo/users-mongoose.query.repo';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly usersQueryRepo: UsersMongooseQueryRepository,
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
    const result = await this.usersService.getUserSA(userId);
    if (!result) {
      throw new NotFoundException();
    }
    return result;
  }
}
