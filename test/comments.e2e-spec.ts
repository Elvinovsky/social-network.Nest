import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { appSettings } from '../src/infrastructure/settings/app-settings';
import { blogViewModel } from './blogs.e2e-spec';
import { BlogViewDTO } from '../src/blogs/dto/blog.models';
import { PostViewDTO } from '../src/posts/dto/post.models';
import { UserViewDTO } from '../src/users/dto/view/user-view.models';
import { CommentCreateDTO } from '../src/comments/dto/comment.models';

describe('COMMENTS', () => {
  let app: INestApplication;
  let httpServer: any;
  let createdBlogView: BlogViewDTO;
  let createdPostView: PostViewDTO;
  let createdUserView: UserViewDTO;
  let createdCommentView: CommentCreateDTO;
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

    const createdBlog = await request(httpServer)
      .post(`/sa/blogs`)
      .auth('admin', 'qwerty', { type: 'basic' })
      .send({
        name: blogViewModel.name,
        description: blogViewModel.description,
        websiteUrl: blogViewModel.websiteUrl,
      })
      .expect(HttpStatus.CREATED);

    const createdPost = await request(httpServer)
      .post(`/sa/blogs/${createdBlog.body.id}/posts`)
      .auth('admin', 'qwerty', { type: 'basic' })
      .send({
        title: 'post valid',
        content: 'post of elvinovsky',
        shortDescription: 'checking logic create post',
      })
      .expect(HttpStatus.CREATED);

    const createdUser = await request(httpServer)
      .post('/sa/users')
      .auth('admin', 'qwerty', { type: 'basic' })
      .send({
        login: 'elvinovsky',
        password: '123qwer',
        email: 'elvinovsky@google.com',
      })
      .expect(HttpStatus.CREATED);

    const loginGetTokens = await request(httpServer)
      .post('/auth/login')
      .send({
        loginOrEmail: 'elvinovsky',
        password: '123qwer',
      })
      .expect(HttpStatus.OK);

    accessToken = loginGetTokens.body.accessToken;
    createdBlogView = createdBlog.body;
    createdPostView = createdPost.body;
    createdUserView = createdUser.body;
  });

  afterAll(async () => {
    await request(httpServer).delete('/testing/all-data');
  });

  it('GET COMMENTS, should return pagination view for comments with an empty array of objects', async () => {
    await request(httpServer)
      .get(`/posts/${createdPostView.id}/comments`)
      .expect(HttpStatus.OK, {
        pagesCount: 0,
        page: 1,
        pageSize: 10,
        totalCount: 0,
        items: [],
      });
  });

  it('1 – GET COMMENT BY ID, return 404', async () => {
    await request(httpServer).get('/comments/1').expect(HttpStatus.NOT_FOUND);
  });
  it('CREATE COMMENT, should return 401', async () => {
    await request(httpServer)
      .post(`/posts/{postId}/comments`)
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it('CREATE COMMENT, should return CommentViewDto, 201 status', async () => {
    const createdComment = await request(httpServer)
      .post(`/posts/${createdPostView.id}/comments`)
      .auth(accessToken, { type: 'bearer' })
      .send({
        content:
          'In order to create a comment, ' +
          'you need to create a user, ' +
          'log in to the system,' +
          ' create a blog, ' +
          'create a post for this blog.',
      })
      .expect(HttpStatus.CREATED);

    createdCommentView = createdComment.body;

    expect(createdComment.body).toEqual({
      id: expect.stringMatching(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      ),
      content:
        'In order to create a comment, you need to create a user, log in to the system, create a blog, create a post for this blog.',
      commentatorInfo: {
        userId: createdUserView.id,
        userLogin: createdUserView.login,
      },
      likesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: 'None',
      },
      createdAt: expect.any(String),
    });
  });

  it('GET COMMENTS, should return pagination view for created comment ', async () => {
    const getCommentsNoAuth = await request(httpServer)
      .get(`/posts/${createdPostView.id}/comments`)
      .expect(HttpStatus.OK);

    expect(getCommentsNoAuth.body).toEqual({
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: 1,
      items: [
        {
          id: expect.stringMatching(
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
          ),
          content:
            'In order to create a comment, you need to create a user, log in to the system, create a blog, create a post for this blog.',
          commentatorInfo: {
            userId: createdUserView.id,
            userLogin: 'elvinovsky',
          },
          likesInfo: {
            likesCount: expect.any(Number),
            dislikesCount: expect.any(Number),
            myStatus: expect.stringMatching(/^Like$|^Dislike$|^None$/),
          },
          createdAt: expect.any(String),
        },
      ],
    });
  });

  it('UPDATE COMMENT, should return 204', async () => {
    await request(httpServer)
      .put(`/comments/${createdCommentView.id}`)
      .auth(accessToken, { type: 'bearer' })
      .send({
        content:
          'In order to create a comment, ' +
          'you need to create a user, ' +
          'log in to the system, ' +
          'create a blog,' +
          ' create a post for this blog,' +
          ' create comment for this post.',
      });
    const getUpdatedComment = await request(httpServer)
      .get(`/comments/${createdCommentView.id}`)
      .expect(HttpStatus.OK);

    expect(getUpdatedComment.body.content).toEqual(
      'In order to create a comment, ' +
        'you need to create a user, ' +
        'log in to the system, ' +
        'create a blog,' +
        ' create a post for this blog,' +
        ' create comment for this post.',
    );
  });

  it('DELETE COMMENT, should return 404', async () => {
    await request(httpServer)
      .delete(`/comments/${createdCommentView.id}`)
      .auth(accessToken, { type: 'bearer' });

    await request(httpServer)
      .get(`/comments/${createdCommentView.id}`)
      .expect(HttpStatus.NOT_FOUND);
  });
});
