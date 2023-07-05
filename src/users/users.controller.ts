import { Body, Controller, Get, Post } from '@nestjs/common';

@Controller('users')
export class UsersController {
  @Get()
  getUsers() {
    return [{ id: 1 }, { id: 2 }];
  }
  @Post()
  createUsers(@Body() inputModel: CreateUserInputType) {
    return {
      id: new Date().toString(),
      name: inputModel.name,
      childrenCount: inputModel.childrenCount,
    };
  }
}

type CreateUserInputType = {
  name: string;
  childrenCount: number;
};
