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
  async findPostById(id: string) {
    return this.postsRepository.findPostById(id);
  }

  async createPostByBLog(
    blogId: string,
    inputModel: BlogPostInputModel,
    userId: string,
  ): Promise<PostViewDTO | null | boolean> {
    const validateResult: BlogDocument | null | boolean =
      await this.blogService._isOwnerFoundBlog(blogId, userId);

    if (!validateResult) {
      return validateResult;
    }

    return this.postsRepository.createPostBlog(
      inputModel,
      blogId,
      validateResult.name,
    );
  }

  async createPost(inputModel: PostInputModel): Promise<PostViewDTO | null> {
    // валидация избыточна так как проверям блог на существование через pipe
    const foundBlog: BlogDocument | null = await this.blogService.findById(
      inputModel.blogId,
    );
    if (!foundBlog) {
      return null;
    }

    return this.postsRepository.createPost(inputModel, foundBlog.name);
  }

  async updatePost(
    postId: string,
    blogId: string,
    userId: string,
    inputModel: BlogPostInputModel,
  ): Promise<boolean | null> {
    const validateResult: boolean | BlogDocument | null =
      await this.blogService._isOwnerFoundBlog(blogId, userId);

    if (!validateResult) {
      return validateResult;
    }

    const foundPost = await this.findPostById(postId);

    if (foundPost?.blogId !== blogId) {
      return false;
    }

    return this.postsRepository.updatePostById(postId, inputModel);
  }

  async deletePost(
    postId: string,
    blogId: string,
    userId: string,
  ): Promise<Document | null | boolean> {
    // поиск блога и его принадлежности пользователю
    const validateResult: boolean | BlogDocument | null =
      await this.blogService._isOwnerFoundBlog(blogId, userId);

    if (!validateResult) {
      return validateResult;
    }
    // поиск поста по айди
    const foundPost = await this.findPostById(postId);
    // проверка на совпадение предаваемого айди блога через params внутри документа поста
    if (foundPost?.blogId !== blogId) {
      return false;
    }
    return this.postsRepository.deletePost(postId);
  }
}
