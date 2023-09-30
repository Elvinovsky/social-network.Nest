import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from '../application/users.service';
import {
  QueryInputModel,
  SearchEmailTerm,
  SearchLoginTerm,
} from '../../infrastructure/pagination/pagination.models';
import { UsersQueryRepository } from '../infrastructure/repositories/mongo/users.query.repo';
import { CommandBus } from '@nestjs/cqrs';

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
    const result = await this.usersService.getUserSA(userId);
    if (!result) {
      throw new NotFoundException();
    }
    return result;
  }
}
