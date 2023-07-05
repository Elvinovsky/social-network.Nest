import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersRepository {
  getUsers(query: { term: string }) {
    return [
      { id: 1, name: 'elvin' },
      { id: 2, name: 'dima' },
    ].filter((el) => !query.term || el.name.indexOf(query.term) > -1);
  }
}
