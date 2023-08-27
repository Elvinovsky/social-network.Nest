import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('PublicBlogsController (e2e)', () => {
  let app: INestApplication;
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    await request(app.getHttpServer()).delete('/testing/all-data');
  });

  it('1 – GET:/blogs – return 200 and empty array', async () => {
    await request(app.getHttpServer()).get('/blogs').expect(HttpStatus.OK, {
      pagesCount: 0,
      page: 1,
      pageSize: 10,
      totalCount: 0,
      items: [],
    });
  });

  it('2 – GET:/blogs/:id – return 404 for not existing blog', async () => {
    await request(app.getHttpServer())
      .get('/blogs/1')
      .expect(HttpStatus.NOT_FOUND);
  });
  it("3 – GET:/blogs/:id/posts – return 404 & can't get posts of not existing blog", async () => {
    await request(app.getHttpServer())
      .get('/blogs/1/posts')
      .expect(HttpStatus.NOT_FOUND);
  });
  it("4 – POST:/blogs/:id/posts – return 404 & can't create posts of not existing blog", async () => {
    await request(app.getHttpServer())
      .post(`/blogs/1/posts`)
      .auth('admin', 'qwerty', { type: 'basic' })
      .send({
        title: 'valid-title',
        shortDescription: 'valid-shortDescription',
        content: 'valid-content',
      })
      .expect(HttpStatus.NOT_FOUND);
  });
});
