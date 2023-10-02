import {
  BlogCreateDTO,
  BlogInputModel,
  BlogViewDTO,
} from '../../../dto/blog.models';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Blog,
  BlogModel,
} from '../../../entities/mongoose/blog-no-sql.schemas';
import { blogMapping } from '../../helpers/blog.helpers';
import { UserInfo } from '../../../../users/dto/view/user-view.models';

// Репозиторий блогов, который используется для выполнения операций CRUD
@Injectable()
export class BlogsRepository {
  constructor(@InjectModel(Blog.name) private blogModel: BlogModel) {}

  // Находит блог по заданному ID
  // Возвращает BlogDocument или null, если блог не найден
  async findBlogById(id: string): Promise<BlogCreateDTO | null> {
    try {
      return await this.blogModel.findOne({ id: id }).lean();
    } catch (e) {
      console.log(e, 'error findBlogById method by BlogsRepository');
      throw new InternalServerErrorException();
    }
  }

  // Добавляет новый блог в ДБ на основе входной модели BlogCreateDTO
  // Возвращает BlogViewDTO созданного блога
  async addNewBlog(blog: BlogCreateDTO): Promise<BlogViewDTO> {
    try {
      const createdBlog = new this.blogModel(blog);
      await createdBlog.save();

      return blogMapping(blog);
    } catch (e) {
      console.log(e);
      throw new InternalServerErrorException();
    }
  }

  // Обновляет блог с заданным ID на основе входной модели BlogInputModel
  // Возвращает true, если блог был успешно обновлен, false в противном случае
  async updateBlogById(
    id: string,
    inputModel: BlogInputModel,
  ): Promise<number> {
    try {
      const result = await this.blogModel
        .updateOne(
          { id: id },
          {
            $set: {
              name: inputModel.name,
              description: inputModel.description,
              websiteUrl: inputModel.websiteUrl,
            },
          },
        )
        .exec();
      return result.matchedCount;
    } catch (e) {
      console.log('error updateBlogById', e);
      throw new InternalServerErrorException();
    }
  }

  // Удаляет блог с заданным ID
  // Возвращает true, false если блог не найден
  async deleteBlogById(id: string): Promise<boolean> {
    try {
      return await this.blogModel
        .deleteOne({ id: id })
        .then((result) => Promise.resolve(result.deletedCount === 1))
        .catch((error) => Promise.reject(error));
    } catch (e) {
      console.log(e, 'error deleteBlogById');
      throw new InternalServerErrorException();
    }
  }

  async updateBlogOwnerInfo(userInfo: UserInfo, id: string): Promise<boolean> {
    try {
      return await this.blogModel
        .updateOne({ id: id }, { $set: { blogOwnerInfo: userInfo } })
        .then((result) => Promise.resolve(result.matchedCount === 1))
        .catch((error) => Promise.reject(error));
    } catch (e) {
      console.log(e);
      throw new InternalServerErrorException();
    }
  }
}
