import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Get()
  async getUsers(@Query() query: { term: string }) {
    return this.usersService.getUsers(query);
  }
  @Get(':id')
  async getUser(@Param('id') userId: string) {
    return this.usersService.getUser(userId.toString());
  }
  @Post()
  async createUsers(@Body() inputModel: CreateUserInputType) {
    return this.usersService.createUser(inputModel);
  }
  @Delete(':id')
  deleteUsers(@Param('id') userId: number) {
    return;
  }
  @Put(':id')
  async updateUser(
    @Param('id') userId: number,
    @Body() inputModel: CreateUserInputType,
  ) {
    const user = await this.usersService.getUser(userId.toString());
    user.setChildren(inputModel.childrenCount);
    return this.usersService.updateUser(user);
  }
}

export type CreateUserInputType = {
  name: string;
  childrenCount: number;
};
