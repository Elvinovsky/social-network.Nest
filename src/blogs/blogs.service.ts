import { Injectable } from '@nestjs/common';
import { BlogViewDTO } from './blog.models';
//output  view model
@Injectable()
export class BlogsService {
  async createBlog(
    name: string,
    description: string,
    websiteUrl: string,
  ): Promise<BlogView> {
    const createdBlog: BlogDBModel = {
      name: name,
      description: description,
      websiteUrl: websiteUrl,
      createdAt: new Date().toString(),
      isMembership: false,
    };

    return await blogsRepository.addNewBlog(createdBlog);
  }

  async updateBlogById(
    id: string,
    name: string,
    description: string,
    websiteUrl: string,
  ): Promise<boolean> {
    return blogsRepository.updateBlogById(id, name, description, websiteUrl);
  }

  async BlogByIdDelete(id: string): Promise<boolean> {
    return blogsRepository.searchBlogByIdDelete(id);
  }
}
