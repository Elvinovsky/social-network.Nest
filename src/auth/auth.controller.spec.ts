import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../app.module';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { appSettings } from '../infrastructure/settings/app-settings';
import request from 'supertest';
import { UsersMongooseRepository } from '../users/infrastructure/repositories/mongo/users-mongoose.repository';

describe('AUTH', () => {
  let app: INestApplication;
  let httpServer: INestApplication<any>;

  let usersRepo: UsersMongooseRepository;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [
        {
          provide: UsersMongooseRepository,
          useValue: {
            findOne: jest.fn(),
            findUser: jest.fn(),
          },
        },
      ],
    }).compile();

    usersRepo = moduleFixture.get<UsersMongooseRepository>(
      UsersMongooseRepository,
    );

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

  it('LOGIN, should return accessToken in body and refreshToken in cookie', async () => {
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
});
