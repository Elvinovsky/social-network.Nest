import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersRepository {
  getUsers(query: { term: string }) {
    return [
      { id: 1, name: 'elvin' },
      { id: 2, name: 'dima' },
    ].filter((el) => !query.term || el.name.indexOf(query.term) > -1);
  }
  getUser(userId: string) {
    return [{ id: 1 }, { id: 2 }].find((el) => el.id === +userId);
  }
  updateUser(id, inputModel) {
    return {
      id: id,
      name: inputModel.name,
      childrenCount: inputModel.childrenCount,
    };
  }
}
