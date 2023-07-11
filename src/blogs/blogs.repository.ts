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
  async findBlogById(id: string): Promise<BlogViewDTO | null> {
    const blog = await this.blogModel.findById({ _id: objectIdHelper(id) });
    if (!blog) {
      return null;
    }
    return blogMapping(blog);
  }
  async addNewBlog(inputModel: BlogCreateDTO): Promise<BlogViewDTO> {
    const newBlog = await new this.blogModel(inputModel);
    await newBlog.save();
    return blogMapping(newBlog);
  }
  async updateBlogById(
    id: string,
    name: string,
    description: string,
    websiteUrl: string,
  ): Promise<boolean> {
    const result = await this.blogModel.updateOne(
      { _id: objectIdHelper(id) },
      {
        $set: {
          name,
          description,
          websiteUrl,
        },
      },
    );
    return result.matchedCount === 1;
  } //поиск блога по ID для удаления.
  async deleteBlogById(id: string): Promise<boolean> {
    const deleteResult = await this.blogModel.deleteOne({
      _id: objectIdHelper(id),
    });
    return deleteResult.deletedCount === 1;
  }
}
