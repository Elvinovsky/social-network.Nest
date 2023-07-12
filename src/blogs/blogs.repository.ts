import { BlogCreateDTO, BlogViewDTO } from './blog.models';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogModel } from './blog.schemas';
import { blogMapping } from './blog.helpers';
import { objectIdHelper } from '../common/helpers';

@Injectable()
export class BlogsRepository {
  constructor(@InjectModel(Blog.name) private blogModel: BlogModel) {}
  //поиск блога по ID.
  async findBlogById(id: string): Promise<BlogViewDTO | null | void> {
    try {
      const blog = await this.blogModel.findById(objectIdHelper(id));
      if (!blog) {
        return null;
      }
      return blogMapping(blog);
    } catch (e) {
      return console.log(e, 'error findBlogById method by BlogsRepository');
    }
  }
  async addNewBlog(inputModel: BlogCreateDTO): Promise<BlogViewDTO> {
    const newBlog = await new this.blogModel(inputModel);
    await newBlog.save();
    return blogMapping(newBlog);
  }

  //поиск блога по ID для удаления.
  async deleteBlogById(id: string): Promise<boolean> {
    const deleteResult = await this.blogModel.deleteOne({
      _id: objectIdHelper(id),
    });
    return deleteResult.deletedCount === 1;
  }
}
