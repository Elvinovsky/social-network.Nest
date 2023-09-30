import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { appSettings } from '../src/infrastructure/settings/app-settings';
import { BlogViewDTO } from '../src/blogs/dto/blog.models';

export const blogViewModel: BlogViewDTO = {
  id: expect.stringMatching(
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  ),
  name: 'elvinovsky blog',
  description: 'blog of elvinovsky',
  websiteUrl: 'https://elvinovsky.ru',
  createdAt: expect.any(String),
  isMembership: false,
};

describe('BLOGS', () => {
  let app: INestApplication;
  let httpServer: any;

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

  it('1 – GET BLOGS, should return 200 and empty array items', async () => {
    await request(httpServer).get('/blogs').expect(HttpStatus.OK, {
      pagesCount: 0,
      page: 1,
      pageSize: 10,
      totalCount: 0,
      items: [],
    });
  });

  it('CREATE BLOG FOR SA, should return 201 and BlogViewModel', async () => {
    const createdBlog = await request(httpServer)
      .post(`/sa/blogs`)
      .auth('admin', 'qwerty', { type: 'basic' })
      .send({
        name: blogViewModel.name,
        description: blogViewModel.description,
        websiteUrl: blogViewModel.websiteUrl,
      })
      .expect(HttpStatus.CREATED);

    expect(createdBlog.body).toEqual(blogViewModel);

    await request(httpServer)
      .get(`/blogs/${createdBlog.body.id}`)
      .expect(createdBlog.body);
  });

  it('GET BLOG BY ID, should 404', async () => {
    await request(httpServer).get('/blogs/1').expect(HttpStatus.NOT_FOUND);
  });
});
