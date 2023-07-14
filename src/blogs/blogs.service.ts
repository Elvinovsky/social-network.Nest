import { Injectable } from '@nestjs/common';
import { BlogInputModel, BlogViewDTO } from './blog.models';
import { BlogsRepository } from './blogs.repository';

//input: BlogViewDTO, output: BlogViewDTO
// производится проверка заданной бизнес логики, никаких трансформаций с сущностми только передача запросов между сервисами и валидация бизнес задач
@Injectable()
export class BlogsService {
  constructor(private readonly blogsRepository: BlogsRepository) {}
  async createBlog(inputModel: BlogInputModel): Promise<BlogViewDTO> {
    return await this.blogsRepository.addNewBlog(inputModel);
  }

  async updateBlog(
    id: string,
    inputModel: BlogInputModel,
  ): Promise<boolean | null> {
    const blog = await this.blogsRepository.findBlogById(id);
    if (blog) {
      return this.blogsRepository.updateBlogById(id, inputModel);
    }

    return blog;
  }

  async deleteBlog(id: string): Promise<Document | null> {
    return this.blogsRepository.deleteBlogById(id);
  }
}
