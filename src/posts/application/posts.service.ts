import { Injectable } from '@nestjs/common';
import { PostsRepository } from '../infrastructure/mongo/posts.repository';
import {
  BlogPostInputModel,
  PostCreateDTO,
  PostInputModel,
  PostViewDTO,
} from '../dto/post.models';
import { BlogsService } from '../../blogs/application/blogs.service';
import { UserInfo } from '../../users/dto/view/user-view.models';
import { Post } from '../entities/post.schemas';
import { BlogCreateDTO } from '../../blogs/dto/blog.models';

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
      const validateResult: BlogCreateDTO | null | boolean =
        await this.blogService._isOwnerFoundBlog(blogId, userInfo.userId);

      if (!validateResult) {
        return validateResult;
      }
    }
    const foundBlog: BlogCreateDTO | null = await this.blogService.findById(
      blogId,
    );
    if (!foundBlog) {
      return null;
    }
    const newPost = Post.create(inputModel, foundBlog.name, blogId);

    return this.postsRepository.createPost(newPost);
  }

  async createPost(inputModel: PostInputModel): Promise<PostViewDTO | null> {
    // валидация избыточна так как проверям блог на существование через pipe
    const foundBlog: BlogCreateDTO | null = await this.blogService.findById(
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
    const validateResult: boolean | BlogCreateDTO | null =
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

    return this.postsRepository.updatePostById(postId, blogId, inputModel);
  }

  async updatePostSA(
    postId: string,
    blogId: string,
    inputModel: BlogPostInputModel,
  ): Promise<boolean | null> {
    const foundPost = await this.findPostById(postId);
    const foundBlog = await this.blogService.findById(blogId);

    if (!foundPost || !foundBlog) {
      return null;
    }
    if (foundBlog.blogOwnerInfo?.userId) {
      return false;
    }

    return this.postsRepository.updatePostById(postId, blogId, inputModel);
  }

  async deletePost(
    postId: string,
    blogId?: string,
    userInfo?: UserInfo,
  ): Promise<Document | null | boolean> {
    if (userInfo && blogId) {
      // поиск блога и его принадлежности пользователю
      const validateResult: boolean | BlogCreateDTO | null =
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

  async deletePostSA(
    postId: string,
    blogId: string,
  ): Promise<Document | null | boolean> {
    const foundPost = await this.findPostById(postId);
    const foundBlog = await this.blogService.findById(blogId);

    if (!foundPost || !foundBlog) {
      return null;
    }
    if (foundBlog.blogOwnerInfo?.userId) {
      return false;
    }

    return this.postsRepository.deletePost(postId);
  }
}
