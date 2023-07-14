import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserInputModel } from './user.models';
import {
  QueryInputModel,
  SearchEmailTerm,
  SearchLoginTerm,
} from '../pagination/pagination.models';
import { UsersQueryRepository } from './users.query.repo';

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
      Number(query.pageNumber),
      Number(query.pageSize),
      query.sortBy,
      query.sortDirection,
    );
  }
  @Get(':id')
  async getUser(@Param('id') userId: string) {
    return this.usersService.getUser(userId.toString());
  }
  @Post()
  async createUsers(@Body() inputModel: UserInputModel) {
    return this.usersService.createUser(inputModel);
  }
  @Put(':id')
  async updateUser(
    @Param('id') userId: number,
    @Body() inputModel: UserInputModel,
  ) {
    const user = await this.usersService.getUser(userId.toString());
    if (user) user.canBeConfirmed(<Date>user.emailConfirmation.expirationDate);
    return this.usersService.updateUser(user);
  }
}
