import { Injectable } from '@nestjs/common';
import { BlogInputModel, BlogViewDTO } from './blog.models';
import { BlogsRepository } from './blogs.repository';
import { BlogDocument } from './blog.schemas';

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
    return await this.blogsRepository.addNewBlog(inputModel, userId);
  }

  async updateBlog(
    id: string,
    inputModel: BlogInputModel,
  ): Promise<boolean | null> {
    const blog: BlogDocument | null = await this.blogsRepository.findBlogById(
      id,
    );
    if (blog) {
      return this.blogsRepository.updateBlogById(id, inputModel);
    }

    return blog;
  }

  async deleteBlog(id: string): Promise<Document | null> {
    return this.blogsRepository.deleteBlogById(id);
  }
}
