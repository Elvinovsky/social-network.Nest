import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';

@Controller('users')
export class UsersController {
  @Get()
  getUsers(@Query() query: { term: string }) {
    return [
      { id: 1, name: 'elvin' },
      { id: 2, name: 'dima' },
    ].filter((el) => !query.term || el.name.indexOf(query.term) > -1);
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
