import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { UserViewDTO } from '../src/users/dto/view/user-view.models';
import { AppModule } from '../src/app.module';
import { appSettings } from '../src/infrastructure/settings/app-settings';

describe('SA USERS', () => {
  let app: INestApplication;
  let httpServer: any;
  let createdUserView: UserViewDTO;
  let accessToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    appSettings(app);

    await app.init();

    httpServer = app.getHttpServer();

    await request(httpServer).delete('/testing/all-data');

    // const loginGetTokens = await request(httpServer)
    //   .post('/auth/login')
    //   .send({
    //     loginOrEmail: 'elvinovsky',
    //     password: '123qwer',
    //   })
    //   .expect(HttpStatus.OK);

    // accessToken = loginGetTokens.body.accessToken;
  });

  it('CREATE USER, should return 401', async () => {
    await request(httpServer)
      .post('/sa/users')
      .auth('invalid', 'qwerty', { type: 'basic' })
      .send({
        login: 'elvinovsky',
        password: '123qwer',
        email: 'elvinovsky@google.com',
      })
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it('CREATE USER, should return 201', async () => {
    const createdUser = await request(httpServer)
      .post('/sa/users')
      .auth('admin', 'qwerty', { type: 'basic' })
      .send({
        login: 'elvinovsky',
        password: '123qwer',
        email: 'elvinovsky@google.com',
      });

    expect(createdUser.body).toEqual({
      id: expect.any(String),
      login: 'elvinovsky',
      email: 'elvinovsky@google.com',
      createdAt: expect.any(String),
    });

    createdUserView = createdUser.body;
  });

  it('GET USERS, should return 200 and array items', async () => {
    await request(httpServer)
      .get('/sa/users')
      .auth('admin', 'qwerty', { type: 'basic' })
      .expect(HttpStatus.OK, {
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [createdUserView],
      });
  });

  it('CREATE USER (already exists Login and Email), should return 400', async () => {
    await request(httpServer)
      .post('/sa/users')
      .auth('admin', 'qwerty', { type: 'basic' })
      .send({
        login: 'elvinovsky',
        password: '123qwer',
        email: 'elvin@google.com',
      })
      .expect(HttpStatus.BAD_REQUEST, {
        errorsMessages: [
          {
            field: 'login',
            message: 'login already exists',
          },
        ],
      });

    await request(httpServer)
      .post('/sa/users')
      .auth('admin', 'qwerty', { type: 'basic' })
      .send({
        login: 'elvin',
        password: '123qwer',
        email: 'elvinovsky@google.com',
      })
      .expect(HttpStatus.BAD_REQUEST, {
        errorsMessages: [
          {
            field: 'email',
            message: 'email already exists',
          },
        ],
      });
  });

  it('DELETE USER, should return 204', async () => {
    await request(httpServer)
      .delete(`/sa/users/${createdUserView.id}`)
      .auth('admin', 'qwerty', { type: 'basic' })
      .expect(HttpStatus.NO_CONTENT);
  });

  it('1 – GET USERS, should return 200 and empty array items', async () => {
    await request(httpServer)
      .get('/sa/users')
      .auth('admin', 'qwerty', { type: 'basic' })
      .expect(HttpStatus.OK, {
        pagesCount: 0,
        page: 1,
        pageSize: 10,
        totalCount: 0,
        items: [],
      });
  });
});
