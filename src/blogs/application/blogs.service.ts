import { Injectable } from '@nestjs/common';
import { BlogCreateDTO, BlogInputModel, BlogViewDTO } from '../blog.models';
import { BlogsRepository } from '../infrastructure/repositories/blogs.repository';
import { Blog, BlogDocument } from '../blog.schemas';
import { UserInfo } from '../../users/user.models';

//input: BlogInputModel, output: BlogViewDTO, BlogDocument
// производится проверка заданной бизнес логики, никаких трансформаций с сущностми только передача запросов между сервисами и валидация бизнес задач
@Injectable()
export class BlogsService {
  constructor(private readonly blogsRepository: BlogsRepository) {}
  async findById(id: string): Promise<BlogDocument | null> {
    return this.blogsRepository.findBlogById(id);
  }
  async createBlogSA(inputModel: BlogInputModel): Promise<BlogViewDTO> {
    const createBlog: BlogCreateDTO = Blog.createBlogSA(inputModel);
    return await this.blogsRepository.addNewBlog(createBlog);
  }

  async createBlog(
    inputModel: BlogInputModel,
    userInfo: UserInfo,
  ): Promise<BlogViewDTO> {
    const createBlog: BlogCreateDTO = Blog.createBlog(inputModel, userInfo);
    return await this.blogsRepository.addNewBlog(createBlog);
  }

  async updateBlog(
    id: string,
    inputModel: BlogInputModel,
    userInfo?: UserInfo,
  ): Promise<boolean | null | number> {
    if (userInfo) {
      const validateResult: BlogDocument | null | boolean =
        await this._isOwnerFoundBlog(id, userInfo.userId);
      if (!validateResult) {
        return validateResult;
      }
    }

    return this.blogsRepository.updateBlogById(id, inputModel);
  }

  async deleteBlog(
    id: string,
    userInfo?: UserInfo,
  ): Promise<Document | null | boolean> {
    if (userInfo) {
      const validateResult: BlogDocument | null | boolean =
        await this._isOwnerFoundBlog(id, userInfo.userId);
      if (!validateResult) {
        return validateResult;
      }
    }
    return this.blogsRepository.deleteBlogById(id);
  }

  async _isOwnerFoundBlog(id: string, userId: string) {
    // поиск блога в базе данных.
    const blog: BlogDocument | null = await this.blogsRepository.findBlogById(
      id,
    );
    if (!blog) {
      return null;
    }

    // проверка принадлежности блога автору
    if (blog.blogOwnerInfo.userId !== userId) {
      return false;
    }

    return blog;
  }

  async bindWithUser(userId: UserInfo, id: string) {
    return this.blogsRepository.updateBlogOwnerInfo(userId, id);
  }
}
