import { Injectable } from '@nestjs/common';
import { PostsRepository } from './posts.repository';
import { BlogPostInputModel, PostCreateDTO, PostViewDTO } from './post.models';
import { BlogsQueryRepo } from '../blogs/blogs.query.repo';

@Injectable()
export class PostsService {
  constructor(
    private readonly postsRepository: PostsRepository,
    private blogsQueryRepo: BlogsQueryRepo,
  ) {}
  async createPostByBLog(
    blogId: string,
    inputModel: BlogPostInputModel,
  ): Promise<PostViewDTO | boolean | null> {
    const foundBlog = await this.blogsQueryRepo.getBlogById(blogId);
    if (!foundBlog) {
      return null;
    }

    const newPost: PostCreateDTO = {
      title: inputModel.title,
      shortDescription: inputModel.shortDescription,
      content: inputModel.content,
      blogId: foundBlog.id,
      blogName: foundBlog.name,
      addedAt: new Date().toISOString(),
    };

    return this.postsRepository.createPost(newPost);
  }
}
