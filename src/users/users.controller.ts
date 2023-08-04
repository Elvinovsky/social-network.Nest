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
import { UsersService } from './users.service';
import { UserInputModel } from './user.models';
import {
  QueryInputModel,
  SearchEmailTerm,
  SearchLoginTerm,
} from '../pagination/pagination.models';
import { UsersQueryRepository } from './users.query.repo';
import { UserDocument } from './users.schema';
import { BasicAuthGuard } from '../auth/guards/basic-auth.guard';
import { AuthService } from '../auth/auth.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly usersQueryRepo: UsersQueryRepository,
    private readonly authService: AuthService,
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
    const isUserExists: boolean = await this.usersService._isUserExists(
      inputModel,
    );

    // если находим возвращаем в ответе ошибку.
    if (!isUserExists) {
      throw new BadRequestException([
        {
          field: 'email or login',
          message: 'email or login invalid',
        },
      ]);
    }

    return this.authService.userRegistrationSA(inputModel);
  }

  @Put(':userId')
  async updateUser(
    @Param('userId') userId: string,
    @Body() inputModel: UserInputModel,
  ) {
    const user: UserDocument | null = await this.usersService.getUser(userId);
    if (!user) {
      throw new NotFoundException();
    }
    return this.usersService.updateUser(userId, inputModel);
  }
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
