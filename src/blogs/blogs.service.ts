import { Injectable } from '@nestjs/common';
import { BlogViewDTO } from './blog.models';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogModel } from './blog.schemas';

//output  view model
// @Injectable()
// export class BlogsService {
//   constructor(@InjectModel(Blog.name) private blogModel: BlogModel) {}
//   async createBlog(
//     name: string,
//     description: string,
//     websiteUrl: string,
//   ): Promise<BlogViewDTO> {
//     const createdBlog: Blog = {
//       name: name,
//       description: description,
//       websiteUrl: websiteUrl,
//       addedAt: new Date().toString(),
//       isMembership: false,
//     };
//
//     return await blogsRepository.addNewBlog(createdBlog);
//   }
//
//   async updateBlogById(
//     id: string,
//     name: string,
//     description: string,
//     websiteUrl: string,
//   ): Promise<boolean> {
//     return blogsRepository.updateBlogById(id, name, description, websiteUrl);
//   }
//
//   async BlogByIdDelete(id: string): Promise<boolean> {
//     return blogsRepository.searchBlogByIdDelete(id);
//   }
// }
