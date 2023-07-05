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
  getUser(@Param('id') userId: number) {
    return [{ id: 1 }, { id: 2 }].find((el) => el.id === +userId);
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
