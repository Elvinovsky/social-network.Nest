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
    inputModel: BlogPostInputModel,
  ): Promise<PostViewDTO | null | void> {
    const foundBlog: void | BlogViewDTO | null =
      await this.blogsQueryRepo.getBlogById(blogId);
    if (!foundBlog) {
      return null;
    }

    return this.postsRepository.createPostBlog(
      inputModel,
      blogId,
      foundBlog.name,
    );
  }

  async createPost(
    inputModel: PostInputModel,
  ): Promise<PostViewDTO | null | void> {
    const foundBlog: void | BlogViewDTO | null =
      await this.blogsQueryRepo.getBlogById(inputModel.blogId);
    if (!foundBlog) {
      return null;
    }

    return this.postsRepository.createPost(inputModel, foundBlog.name);
  }

  async updatePost(
    postId: string,
    inputModel: PostInputModel,
  ): Promise<boolean | null | void> {
    const foundBlog: void | BlogViewDTO | null =
      await this.blogsQueryRepo.getBlogById(inputModel.blogId);

    if (foundBlog) {
      return this.postsRepository.updatePostById(postId, inputModel);
    }

    return foundBlog;
  }
}
