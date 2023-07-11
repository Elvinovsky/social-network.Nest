import { Injectable } from '@nestjs/common';
import { BlogCreateDTO, BlogInputModel, BlogViewDTO } from './blog.models';
import { Blog } from './blog.schemas';
import { BlogsRepository } from './blogs.repository';

//output  view model
@Injectable()
export class BlogsService {
  constructor(private readonly blogsRepository: BlogsRepository) {}
  async createBlog(inputModel: BlogInputModel): Promise<BlogViewDTO> {
    const newBlog: BlogCreateDTO = Blog.buildModel(inputModel);

    return await this.blogsRepository.addNewBlog(newBlog);
  }

  async updateBlog(
    id: string,
    name: string,
    description: string,
    websiteUrl: string,
  ): Promise<boolean> {
    return this.blogsRepository.updateBlogById(
      id,
      name,
      description,
      websiteUrl,
    );
  }

  async deleteBlog(id: string): Promise<boolean> {
    return this.blogsRepository.deleteBlogById(id);
  }
}
