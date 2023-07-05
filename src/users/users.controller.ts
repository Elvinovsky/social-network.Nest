import { Body, Controller, Get, Param, Post } from '@nestjs/common';

@Controller('users')
export class UsersController {
  @Get()
  getUsers() {
    return [{ id: 1 }, { id: 2 }];
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
}

type CreateUserInputType = {
  name: string;
  childrenCount: number;
};
