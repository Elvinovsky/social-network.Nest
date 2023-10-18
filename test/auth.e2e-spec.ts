import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { appSettings } from '../src/infrastructure/settings/app-settings';
import request from 'supertest';
import { delayedRequest } from '../test/utils/test-utils';
import { IUserRepository } from '../src/infrastructure/repositoriesModule/repositories.module';

describe('AUTH', () => {
  let app: INestApplication;
  let httpServer: INestApplication<any>;

  let usersRepo: IUserRepository;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [
        {
          provide: IUserRepository,
          useValue: {
            findOne: jest.fn(),
            findUser: jest.fn(),
          },
        },
      ],
    }).compile();

    usersRepo = moduleFixture.get<IUserRepository>(IUserRepository);

    app = moduleFixture.createNestApplication();
    appSettings(app);

    await app.init();

    httpServer = app.getHttpServer();

    await request(httpServer).delete('/testing/all-data');
  });

  afterAll(async () => {
    await request(httpServer).delete('/testing/all-data');
  });

  it('REGISTRATION, should return 400, because login more than 11 characters', async () => {
    await request(httpServer)
      .post('/auth/registration')
      .send({
        password: 'validpassword',
        email: 'valid@gg.com',
        login: 'loginmoretensimbolsss',
      })
      .expect(HttpStatus.BAD_REQUEST, {
        errorsMessages: [
          {
            field: 'login',
            message: 'login must be shorter than or equal to 11 characters',
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

  it('LOGIN, should return 401', async () => {
    await request(httpServer)
      .post('/auth/login')
      .send({
        loginOrEmail: 'validLogin',
        password: 'validpassword',
      })
      .expect(401);
  });

  it('EMAIL CONFIRMATION, should return 204', async () => {
    const email = 'valid@gg.com';
    const user = await usersRepo.findUserByEmail(email);

    if (!user) return HttpStatus.INTERNAL_SERVER_ERROR;

    await request(httpServer)
      .post('/auth/registration-confirmation')
      .send({
        code: user.emailConfirmation.confirmationCode,
      })
      .expect(HttpStatus.NO_CONTENT);
  });

  it('EMAIL CONFIRMATION, should return 400', async () => {
    const email = 'valid@gg.com';
    const user = await usersRepo.findUserByEmail(email);

    if (!user) return HttpStatus.INTERNAL_SERVER_ERROR;

    await request(httpServer)
      .post('/auth/registration-confirmation')
      .send({
        code: user.emailConfirmation.confirmationCode,
      })
      .expect(HttpStatus.BAD_REQUEST);
  });

  it('LOGIN, should return accessToken in body', async () => {
    await request(httpServer)
      .post('/auth/login')
      .send({
        loginOrEmail: 'validLogin',
        password: 'validpassword',
      })
      .expect(200)
      .then((body) =>
        expect(body.body).toEqual({ accessToken: expect.any(String) }),
      );
  });

  it('TOO_MANY_REQUESTS REGISTRATION, should return 204', async () => {
    const delay = await delayedRequest(10000);
    console.log(delay);
    const user1 = await request(httpServer)
      .post('/auth/registration')
      .send({
        password: 'valid1password',
        email: 'valid1@gg.com',
        login: 'valid1Login',
      })
      .expect(HttpStatus.NO_CONTENT);

    const user2 = await request(httpServer)
      .post('/auth/registration')
      .send({
        password: 'valid2password',
        email: 'valid2@gg.com',
        login: 'valid2Login',
      })
      .expect(HttpStatus.NO_CONTENT);

    const user3 = await request(httpServer)
      .post('/auth/registration')
      .send({
        password: 'valid3password',
        email: 'valid3@gg.com',
        login: 'valid3Login',
      })
      .expect(HttpStatus.NO_CONTENT);

    const user4 = await request(httpServer)
      .post('/auth/registration')
      .send({
        password: 'valid4password',
        email: 'valid4@gg.com',
        login: 'valid4Login',
      })
      .expect(HttpStatus.NO_CONTENT);

    const user5 = await request(httpServer)
      .post('/auth/registration')
      .send({
        password: 'valid5password',
        email: 'valid5@gg.com',
        login: 'valid5Login',
      })
      .expect(HttpStatus.NO_CONTENT);

    await request(httpServer)
      .post('/auth/registration')
      .send({
        password: 'valid6password',
        email: 'valid6@gg.com',
        login: 'valid6Login',
      })
      .expect(HttpStatus.TOO_MANY_REQUESTS);

    const delay1 = await delayedRequest(20000);
    console.log(delay1);

    const user6 = await request(httpServer)
      .post('/auth/registration')
      .send({
        password: 'valid6password',
        email: 'valid6@gg.com',
        login: 'valid6Login',
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
      totalCount: 7,
      items: [
        {
          id: expect.any(String),
          login: 'valid6Login',
          email: 'valid6@gg.com',
          createdAt: expect.any(String),
        },
        {
          id: expect.any(String),
          login: 'valid5Login',
          email: 'valid5@gg.com',
          createdAt: expect.any(String),
        },
        {
          id: expect.any(String),
          login: 'valid4Login',
          email: 'valid4@gg.com',
          createdAt: expect.any(String),
        },
        {
          id: expect.any(String),
          login: 'valid3Login',
          email: 'valid3@gg.com',
          createdAt: expect.any(String),
        },
        {
          id: expect.any(String),
          createdAt: expect.any(String),
          login: 'valid2Login',
          email: 'valid2@gg.com',
        },
        {
          id: expect.any(String),
          createdAt: expect.any(String),
          login: 'valid1Login',
          email: 'valid1@gg.com',
        },
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
