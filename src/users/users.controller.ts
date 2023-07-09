import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Get()
  async getUsers() {
    return this.usersService.getUsers();
  }
  @Get(':id')
  async getUser(@Param('id') userId: string) {
    return this.usersService.getUser(userId.toString());
  }
  @Post()
  async createUsers(@Body() inputModel: CreateUserInputType) {
    return this.usersService.createUser(inputModel);
  }
  @Put(':id')
  async updateUser(
    @Param('id') userId: number,
    @Body() inputModel: CreateUserInputType,
  ) {
    const user = await this.usersService.getUser(userId.toString());
    if (user) user.setChildren(inputModel.childrenCount);
    return this.usersService.updateUser(user);
  }
}

export type CreateUserInputType = {
  name: string;
  childrenCount: number;
};
