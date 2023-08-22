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
import { UsersService } from './aplication/users.service';
import { UserInputModel } from './user.models';
import {
  QueryInputModel,
  SearchEmailTerm,
  SearchLoginTerm,
} from '../pagination/pagination.models';
import { UsersQueryRepository } from './infrastructure/users.query.repo';
import { BasicAuthGuard } from '../auth/guards/basic-auth.guard';
import { ResultsAuthForErrors } from '../auth/auth.constants';
import { UserRegistrationToAdminCommand } from './aplication/use-cases/user-registration-to-admin-use-case.service';
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
      Number(query.pageNumber),
      Number(query.pageSize),
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
  @Post()
  async createUser(@Body() inputModel: UserInputModel) {
    //ищем юзера в БД по эл/почте
    const isUserExists: true | ResultsAuthForErrors =
      await this.usersService._isUserExists(inputModel);

    // если находим совпадения по емайлу возвращаем в ответе ошибку.
    if (isUserExists === ResultsAuthForErrors.email) {
      throw new BadRequestException([
        {
          field: 'email',
          message: 'email already exists',
        },
      ]);
    }

    // если находим совпадения по логину возвращаем в ответе ошибку.
    if (isUserExists === ResultsAuthForErrors.login) {
      throw new BadRequestException([
        {
          field: 'login',
          message: 'login already exists',
        },
      ]);
    }

    //регистрируем юзера в БД.
    return this.commandBus.execute(
      new UserRegistrationToAdminCommand(inputModel),
    );
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
