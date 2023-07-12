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
    inputModel: BlogInputModel,
  ): Promise<boolean | null> {
    const blog = await this.blogsRepository.findBlogById(id);
    if (blog) {
      return this.blogsRepository.updateBlogById(id, inputModel);
    }

    return null;
  }

  async deleteBlog(id: string): Promise<boolean> {
    return this.blogsRepository.deleteBlogById(id);
  }
}
