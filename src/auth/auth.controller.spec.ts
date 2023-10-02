import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../app.module';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { appSettings } from '../infrastructure/settings/app-settings';
import request from 'supertest';
describe('AUTH', () => {
  let app: INestApplication;
  let httpServer: INestApplication<any>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    appSettings(app);

    await app.init();

    httpServer = app.getHttpServer();

    await request(httpServer).delete('/testing/all-data');
  });

  it('REGISTRATION, should return 400, because login more than 10 characters', async () => {
    await request(httpServer)
      .post('/auth/registration')
      .send({
        password: 'validpassword',
        email: 'valid@gg.com',
        login: 'loginmoretensimbols',
      })
      .expect(HttpStatus.BAD_REQUEST, {
        errorsMessages: [
          {
            field: 'login',
            message: 'login must be shorter than or equal to 10 characters',
          },
        ],
      });
  });

  it('REGISTRATION, should return 400, because login less than 3 characters', async () => {
    await request(httpServer)
      .post('/auth/registration')
      .send({
        password: 'validpassword',
        email: 'valid@gg.com',
        login: 'in',
      })
      .expect(HttpStatus.BAD_REQUEST, {
        errorsMessages: [
          {
            field: 'login',
            message: 'login must be longer than or equal to 3 characters',
          },
        ],
      });
  });

  it('SUCCESSFUL REGISTRATION, should return 204', async () => {
    const user = await request(httpServer)
      .post('/auth/registration')
      .send({
        password: 'validpassword',
        email: 'valid@gg.com',
        login: 'validLogin',
      })
      .expect(HttpStatus.NO_CONTENT);

    const users = await request(httpServer)
      .get('/sa/users')
      .auth('admin', 'qwerty', { type: 'basic' })
      .expect(HttpStatus.OK);

    expect(users.body).toEqual({
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: 1,
      items: [
        {
          id: expect.any(String),
          login: 'validLogin',
          email: 'valid@gg.com',
          createdAt: expect.any(String),
        },
      ],
    });
  });
});
