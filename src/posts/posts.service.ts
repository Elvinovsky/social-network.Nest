import { Injectable } from '@nestjs/common';
import { PostsRepository } from './posts.repository';
import { BlogPostInputModel, PostInputModel, PostViewDTO } from './post.models';
import { BlogsQueryRepo } from '../blogs/blogs.query.repo';
import { BlogViewDTO } from '../blogs/blog.models';

@Injectable()
export class PostsService {
  constructor(
    private readonly postsRepository: PostsRepository,
    private blogsQueryRepo: BlogsQueryRepo,
  ) {}

  async createPostByBLog(
    blogId: string,
    inputDTO: BlogPostInputModel,
  ): Promise<PostViewDTO | null | void> {
    const foundBlog: void | BlogViewDTO | null =
      await this.blogsQueryRepo.getBlogById(blogId);
    if (!foundBlog) {
      return null;
    }

    return this.postsRepository.createPostBlog(
      inputDTO,
      blogId,
      foundBlog.name,
    );
  }
  async createPost(
    inputDTO: PostInputModel,
  ): Promise<PostViewDTO | null | void> {
    const foundBlog: void | BlogViewDTO | null =
      await this.blogsQueryRepo.getBlogById(inputDTO.blogId);
    if (!foundBlog) {
      return null;
    }

    return this.postsRepository.createPost(inputDTO, foundBlog.name);
  }
}
