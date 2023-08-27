import { Injectable } from '@nestjs/common';
import { BlogCreateDTO, BlogInputModel, BlogViewDTO } from '../blog.models';
import { BlogsRepository } from '../infrastructure/repositories/blogs.repository';
import { Blog, BlogDocument } from '../blog.schemas';

//input: BlogViewDTO, output: BlogViewDTO, BlogDocument
// производится проверка заданной бизнес логики, никаких трансформаций с сущностми только передача запросов между сервисами и валидация бизнес задач
@Injectable()
export class BlogsService {
  constructor(private readonly blogsRepository: BlogsRepository) {}
  async findById(id: string): Promise<BlogDocument | null> {
    return this.blogsRepository.findBlogById(id);
  }
  async createBlog(
    inputModel: BlogInputModel,
    userId: string,
  ): Promise<BlogViewDTO> {
    const createBlog: BlogCreateDTO = Blog.createBlog(inputModel, userId);
    return await this.blogsRepository.addNewBlog(createBlog);
  }

  async updateBlog(
    id: string,
    inputModel: BlogInputModel,
    userId: string,
  ): Promise<boolean | null | number> {
    const validateResult: BlogDocument | null | boolean =
      await this._isOwnerFoundBlog(id, userId);
    if (!validateResult) {
      return validateResult;
    }

    return this.blogsRepository.updateBlogById(id, inputModel);
  }

  async deleteBlog(
    id: string,
    userId: string,
  ): Promise<Document | null | boolean> {
    const validateResult: BlogDocument | null | boolean =
      await this._isOwnerFoundBlog(id, userId);
    if (!validateResult) {
      return validateResult;
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
    if (blog.authorId !== userId) {
      return false;
    }

    return blog;
  }
}
