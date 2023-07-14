import { BlogCreateDTO, BlogInputModel, BlogViewDTO } from './blog.models';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogModel } from './blog.schemas';
import { blogMapping } from './blog.helpers';
import { objectIdHelper } from '../common/helpers';

// принимает 'BlogInputModel' трансформирует его для заданного хранения схемы 'BlogCreateDTO', вся логика изменения данных для входа и выхода производится в репозитории
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
      console.log(e, 'error findBlogById method by BlogsRepository');
    }
  }
  async addNewBlog(inputModel: BlogInputModel): Promise<BlogViewDTO | void> {
    try {
      const createBlog: BlogCreateDTO = Blog.createBlog(inputModel);
      const blogDoc = await new this.blogModel(createBlog);
      await blogDoc.save();
      return blogMapping(blogDoc);
    } catch (e) {
      console.log(e);
    }
  }
  async updateBlogById(
    id: string,
    inputModel: BlogInputModel,
  ): Promise<boolean | void> {
    try {
      const result = await this.blogModel.updateOne(
        { _id: objectIdHelper(id) },
        {
          $set: {
            name: inputModel.name,
            description: inputModel.description,
            websiteUrl: inputModel.websiteUrl,
          },
        },
      );
      return result.matchedCount === 1;
    } catch (e) {
      console.log(e, 'error updateBlogById by blogsRepository');
    }
  }

  //поиск блога по ID для удаления.
  async deleteBlogById(id: string): Promise<Document | null | void> {
    try {
      return await this.blogModel.findByIdAndDelete({
        _id: objectIdHelper(id),
      });
    } catch (e) {
      console.log(e, 'error deleteBlogById');
    }
  }
}
