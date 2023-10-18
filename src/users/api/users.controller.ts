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
import { IUserQueryRepository } from '../../infrastructure/repositoriesModule/repositories.module';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly usersQueryRepo: IUserQueryRepository,
  ) {}
  @Get()
  async getUsers(
    @Query()
    query: QueryInputModel,
    @Query() queryEmail: SearchEmailTerm,
    @Query() queryLogin: SearchLoginTerm,
  ) {
    return this.usersQueryRepo.getSortedUsers(
      query.pageNumber,
      query.pageSize,
      query.sortBy,
      query.sortDirection,
      queryEmail?.searchEmailTerm,
      queryLogin?.searchLoginTerm,
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
