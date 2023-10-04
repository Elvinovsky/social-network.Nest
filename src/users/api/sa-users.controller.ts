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
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BasicAuthGuard } from '../../auth/infrastructure/guards/basic-auth.guard';
import { ResultsAuthForErrors } from '../../auth/infrastructure/config/auth-exceptions.constants';
import { UserRegistrationToAdminCommand } from '../application/use-cases/user-registration-to-admin-use-case';
import { CommandBus } from '@nestjs/cqrs';
import { UsersService } from '../application/users.service';
import {
  QueryBanStatus,
  QueryInputModel,
  SearchEmailTerm,
  SearchLoginTerm,
} from '../../infrastructure/pagination/pagination.models';
import { UsersQueryRepository } from '../infrastructure/repositories/mongo/users.query.repo';
import {
  BanUserInputModel,
  UserInputModel,
} from '../dto/input/user-input.models';

@Controller('sa/users')
export class SaUsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly usersQueryRepo: UsersQueryRepository,
    private commandBus: CommandBus,
  ) {}

  @Post()
  @UseGuards(BasicAuthGuard)
  async createUser(@Body() inputModel: UserInputModel) {
    //ищем юзера в БД по эл/почте
    const isUserExists: true | ResultsAuthForErrors =
      await this.usersService._isUserAlreadyExists(inputModel);

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

  @Get()
  @UseGuards(BasicAuthGuard)
  async getUsers(
    @Query()
    query: QueryInputModel,
    @Query() queryEmail: SearchEmailTerm,
    @Query() queryLogin: SearchLoginTerm,
    @Query() queryBanStatus: QueryBanStatus,
  ) {
    return this.usersQueryRepo.getSortedUsersForSA(
      queryBanStatus.banStatus,
      query.pageNumber,
      query.pageSize,
      query.sortBy,
      query.sortDirection,
      queryEmail.searchEmailTerm,
      queryLogin.searchLoginTerm,
    );
  }

  @Put(':id/ban')
  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBanStatus(
    @Param('id') userId: string,
    @Body() inputModel: BanUserInputModel,
  ) {
    const result = await this.usersService.updateBanStatus(userId, inputModel);

    if (result === null) {
      throw new NotFoundException();
    }

    if (result === false) {
      throw new BadRequestException([
        {
          field: 'isBanned',
          message: 'user already banned',
        },
      ]);
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
