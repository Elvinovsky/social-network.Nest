import { Injectable } from '@nestjs/common';
import { PostsRepository } from './posts.repository';
import { BlogPostInputModel, PostInputModel, PostViewDTO } from './post.models';
import { BlogsQueryRepo } from '../blogs/blogs.query.repo';
import { BlogViewDTO } from '../blogs/blog.models';

@Injectable()
export class PostsService {
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly blogsQueryRepo: BlogsQueryRepo,
  ) {}

  async createPostByBLog(
    id: string,
    inputModel: BlogPostInputModel, // todo repository
  ): Promise<PostViewDTO | null> {
    const foundBlog: BlogViewDTO | null = await this.blogsQueryRepo.getBlogById(
      id,
    );
    if (!foundBlog) {
      return null;
    }

    return this.postsRepository.createPostBlog(inputModel, id, foundBlog.name);
  }

  async createPost(inputModel: PostInputModel): Promise<PostViewDTO | null> {
    const foundBlog: BlogViewDTO | null = await this.blogsQueryRepo.getBlogById(
      inputModel.blogId,
    );
    if (!foundBlog) {
      return null;
    }

    return this.postsRepository.createPost(inputModel, foundBlog.name);
  }

  async updatePost(
    id: string,
    inputModel: PostInputModel, // todo repository!!
  ): Promise<boolean | null> {
    const foundBlog: BlogViewDTO | null = await this.blogsQueryRepo.getBlogById(
      inputModel.blogId,
    );

    if (foundBlog) {
      return this.postsRepository.updatePostById(id, inputModel);
    }

    return foundBlog;
  }

  async deletePost(id: string): Promise<Document | null> {
    return this.postsRepository.deletePost(id);
  }
}
