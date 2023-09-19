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
import { UsersService } from './application/users.service';
import {
  QueryInputModel,
  SearchEmailTerm,
  SearchLoginTerm,
} from '../pagination/pagination.models';
import { UsersQueryRepository } from './infrastructure/users.query.repo';
import { BasicAuthGuard } from '../auth/guards/basic-auth.guard';
import { UserInputModel } from './user.models';
import { ResultsAuthForErrors } from '../auth/auth.constants';
import { UserRegistrationToAdminCommand } from './application/use-cases/user-registration-to-admin-use-case';
import { CommandBus } from '@nestjs/cqrs';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly usersQueryRepo: UsersQueryRepository,
    private commandBus: CommandBus,
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
