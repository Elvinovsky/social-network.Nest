import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Get()
  getUsers(@Query() query: { term: string }) {
    return this.usersService.getUsers(query);
  }
  @Get(':id')
  getUser(@Param('id') userId: string) {
    return this.usersService.getUser(userId.toString());
  }
  @Post()
  createUsers(@Body() inputModel: CreateUserInputType) {
    return {
      id: new Date().toString(),
      name: inputModel.name,
      childrenCount: inputModel.childrenCount,
    };
  }
  @Delete(':id')
  deleteUsers(@Param('id') userId: number) {
    return;
  }
}

type CreateUserInputType = {
  name: string;
  childrenCount: number;
};
