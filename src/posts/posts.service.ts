import { Injectable } from '@nestjs/common';
import { PostsRepository } from './posts.repository';
import { BlogPostInputModel, PostInputModel, PostViewDTO } from './post.models';
import { BlogsService } from '../blogs/blogs.service';
import { BlogDocument } from '../blogs/blog.schemas';

@Injectable()
export class PostsService {
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly blogService: BlogsService,
  ) {}

  async createPostByBLog(
    blogId: string,
    inputModel: BlogPostInputModel,
  ): Promise<PostViewDTO | null> {
    const foundBlog: BlogDocument | null = await this.blogService.findById(
      blogId,
    );
    if (!foundBlog) {
      return null;
    }

    return this.postsRepository.createPostBlog(
      inputModel,
      blogId,
      foundBlog.name,
    );
  }

  async createPost(inputModel: PostInputModel): Promise<PostViewDTO | null> {
    const foundBlog: BlogDocument | null = await this.blogService.findById(
      inputModel.blogId,
    );
    if (!foundBlog) {
      return null;
    }

    return this.postsRepository.createPost(inputModel, foundBlog.name);
  }

  async updatePost(
    id: string,
    inputModel: PostInputModel,
  ): Promise<boolean | null> {
    const foundBlog: BlogDocument | null = await this.blogService.findById(
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
