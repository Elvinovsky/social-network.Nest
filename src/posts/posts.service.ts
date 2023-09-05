import { Injectable } from '@nestjs/common';
import { PostsRepository } from './posts.repository';
import {
  BlogPostInputModel,
  PostCreateDTO,
  PostInputModel,
  PostViewDTO,
} from './post.models';
import { BlogsService } from '../blogs/application/blogs.service';
import { BlogDocument } from '../blogs/blog.schemas';
import { UserInfo } from '../users/user.models';
import { Post } from './post.schemas';

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
    userInfo?: UserInfo,
  ): Promise<PostViewDTO | null | boolean> {
    if (userInfo) {
      const validateResult: BlogDocument | null | boolean =
        await this.blogService._isOwnerFoundBlog(blogId, userInfo.userId);

      if (!validateResult) {
        return validateResult;
      }
    }
    const foundBlog: BlogDocument | null = await this.blogService.findById(
      blogId,
    );
    if (!foundBlog) {
      return null;
    }
    const newPost = Post.create(inputModel, foundBlog.name, blogId);

    return this.postsRepository.createPostBlog(newPost);
  }

  async createPost(inputModel: PostInputModel): Promise<PostViewDTO | null> {
    // валидация избыточна так как проверям блог на существование через pipe
    const foundBlog: BlogDocument | null = await this.blogService.findById(
      inputModel.blogId,
    );
    if (!foundBlog) {
      return null;
    }

    const newPost: PostCreateDTO = Post.create(
      inputModel,
      foundBlog.name,
      inputModel.blogId,
    );

    return this.postsRepository.createPost(newPost);
  }

  async updatePost(
    postId: string,
    blogId: string,
    userInfo: UserInfo,
    inputModel: BlogPostInputModel,
  ): Promise<boolean | null> {
    const validateResult: boolean | BlogDocument | null =
      await this.blogService._isOwnerFoundBlog(blogId, userInfo.userId);

    if (!validateResult) {
      return validateResult;
    }

    const foundPost = await this.findPostById(postId);

    if (!foundPost) {
      return null;
    }

    // if (foundPost?.blogId !== blogId) {
    //   return false;
    // }

    return this.postsRepository.updatePostById(postId, inputModel);
  }

  async updatePostSA(
    postId: string,
    inputModel: PostInputModel,
  ): Promise<boolean | null> {
    const foundPost = await this.findPostById(postId);

    if (!foundPost) {
      return null;
    }

    // if (foundPost?.blogId !== blogId) {
    //   return false;
    // }

    return this.postsRepository.updatePostById(postId, inputModel);
  }

  async deletePost(
    postId: string,
    blogId?: string,
    userInfo?: UserInfo,
  ): Promise<Document | null | boolean> {
    if (userInfo && blogId) {
      // поиск блога и его принадлежности пользователю
      const validateResult: boolean | BlogDocument | null =
        await this.blogService._isOwnerFoundBlog(blogId, userInfo.userId);

      if (!validateResult) {
        return validateResult;
      }
    }
    // // поиск поста по айди
    const foundPost = await this.findPostById(postId);

    if (!foundPost) {
      return null;
    }

    // // проверка на совпадение предаваемого айди блога через params внутри документа поста
    // if (foundPost?.blogId !== blogId) {
    //   return false;
    // }
    return this.postsRepository.deletePost(postId);
  }
}
