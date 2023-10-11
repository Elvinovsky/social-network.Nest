import request from 'supertest';
import { HttpStatus } from '@nestjs/common';
import { BlogViewDTO } from '../../src/blogs/dto/blog.models';

export function delayedRequest(delay) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve('Результат запроса');
    }, delay);
  });
}

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

export const createBlog = async (httpServer) => {
  const createdBlog = await request(httpServer)
    .post(`/sa/blogs`)
    .auth('admin', 'qwerty', { type: 'basic' })
    .send({
      name: blogViewModel.name,
      description: blogViewModel.description,
      websiteUrl: blogViewModel.websiteUrl,
    })
    .expect(HttpStatus.CREATED);

  return createdBlog.body;
};

export const createPost = async (httpServer, createdBlog: BlogViewDTO) => {
  const createdPost = await request(httpServer)
    .post(`/sa/blogs/${createdBlog.id}/posts`)
    .auth('admin', 'qwerty', { type: 'basic' })
    .send({
      title: 'post valid',
      content: 'post of elvinovsky',
      shortDescription: 'checking logic create post',
    })
    .expect(HttpStatus.CREATED);
  return createdPost.body;
};

export const createUser = async (httpServer) => {
  const createdUser = await request(httpServer)
    .post('/sa/users')
    .auth('admin', 'qwerty', { type: 'basic' })
    .send({
      login: 'elvinovsky',
      password: '123qwer',
      email: 'elvinovsky@google.com',
    })
    .expect(HttpStatus.CREATED);
  return createdUser.body;
};
