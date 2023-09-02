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
import { BasicAuthGuard } from '../../auth/guards/basic-auth.guard';
import { BanUserInputModel, UserInputModel } from '../../users/user.models';
import { ResultsAuthForErrors } from '../../auth/auth.constants';
import { UserRegistrationToAdminCommand } from '../../users/aplication/use-cases/user-registration-to-admin-use-case';
import { CommandBus } from '@nestjs/cqrs';
import { UsersService } from '../../users/aplication/users.service';
import {
  QueryBanStatus,
  QueryInputModel,
  SearchEmailTerm,
  SearchLoginTerm,
} from '../../pagination/pagination.models';
import { UsersQueryRepository } from '../../users/infrastructure/users.query.repo';

@Controller('sa/users')
export class SaUsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly usersQueryRepo: UsersQueryRepository,
    private commandBus: CommandBus,
  ) {}

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

  @Get()
  @UseGuards(BasicAuthGuard)
  async getUsers(
    @Query()
    query: QueryInputModel & SearchEmailTerm & SearchLoginTerm & QueryBanStatus,
  ) {
    return this.usersQueryRepo.getSortedUsersForSA(
      query.banStatus,
      query.searchEmailTerm,
      query.searchLoginTerm,
      query.pageNumber,
      query.pageSize,
      query.sortBy,
      query.sortDirection,
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
