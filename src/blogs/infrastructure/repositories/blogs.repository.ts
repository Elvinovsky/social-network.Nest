import { BlogCreateDTO, BlogInputModel, BlogViewDTO } from '../../blog.models';
import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDocument, BlogModel } from '../../blog.schemas';
import { blogMapping } from '../../blog.helpers';
import { objectIdHelper } from '../../../common/helpers';

// Репозиторий блогов, который используется для выполнения операций CRUD
// принимает 'BlogInputModel' трансформирует его для заданного хранения схемы 'BlogCreateDTO', вся логика изменения данных для входа и выхода производится в репозитории
@Injectable()
export class BlogsRepository {
  constructor(@InjectModel(Blog.name) private blogModel: BlogModel) {}

  // Находит блог по заданному ID
  // Возвращает BlogDocument или null, если блог не найден
  async findBlogById(id: string): Promise<BlogDocument | null> {
    try {
      if (!objectIdHelper(id)) return null;

      return await this.blogModel.findById(objectIdHelper(id));
    } catch (e) {
      console.log(e, 'error findBlogById method by BlogsRepository');
      throw new HttpException('failed', HttpStatus.EXPECTATION_FAILED);
    }
  }

  // Добавляет новый блог на основе входной модели BlogInputModel
  // Возвращает BlogViewDTO созданного блога
  async addNewBlog(
    inputModel: BlogInputModel,
    userId: string,
  ): Promise<BlogViewDTO> {
    try {
      const createBlog: BlogCreateDTO = Blog.createBlog(inputModel, userId);
      const createdBlog = await new this.blogModel(createBlog);
      await createdBlog.save();

      return blogMapping(createdBlog);
    } catch (e) {
      console.log(e);
      throw new HttpException('failed', HttpStatus.EXPECTATION_FAILED);
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
          { _id: objectIdHelper(id) },
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
  // Возвращает удаленный документ или null, если блог не найден
  async deleteBlogById(id: string): Promise<Document | null> {
    try {
      return await this.blogModel.findByIdAndDelete(objectIdHelper(id));
    } catch (e) {
      console.log(e, 'error deleteBlogById');
      throw new HttpException('failed', HttpStatus.EXPECTATION_FAILED);
    }
  }
}
