import {
  BlogCreateDTO,
  BlogInputModel,
  BlogViewDTO,
} from '../../../dto/blog.models';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { blogMapping } from '../../helpers/blog.helpers';
import { UserInfo } from '../../../../users/dto/view/user-view.models';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BlogTypeOrmEntity } from '../../../entities/typeorm/blog-sql.schemas';
import { IBlogRepository } from '../../../../infrastructure/repositoriesModule/repositories.module';

// Репозиторий блогов, который используется для выполнения операций CRUD
@Injectable()
export class BlogsTypeOrmRepository implements IBlogRepository {
  constructor(
    @InjectRepository(BlogTypeOrmEntity)
    private blogsRepo: Repository<BlogTypeOrmEntity>,
  ) {}

  // Находит блог по заданному ID
  // Возвращает Blog или null, если блог не найден
  async findBlogById(blogId: string): Promise<BlogCreateDTO | null> {
    try {
      const blog = await this.blogsRepo.findOne({
        where: { id: blogId },
        relations: {
          user: true,
        },
      });

      if (!blog) {
        return null;
      }

      return {
        id: blog.id,
        name: blog.name,
        description: blog.description,
        websiteUrl: blog.websiteUrl,
        addedAt: blog.addedAt,
        isMembership: blog.isMembership,
        blogOwnerInfo: blog.user
          ? {
              userId: blog.user?.id,
              userLogin: blog.user.login,
            }
          : null,
      };
    } catch (e) {
      console.log(e, 'error findBlogById method by BlogsRepository');
      throw new Error();
    }
  }

  // Добавляет новый блог в ДБ на основе входной модели BlogCreateDTO
  // Возвращает BlogViewDTO созданного блога
  async addNewBlog(inputModel: BlogCreateDTO): Promise<BlogViewDTO> {
    try {
      const newBlog = this.blogsRepo.create(inputModel);
      await this.blogsRepo.save(newBlog);

      return blogMapping(inputModel);
    } catch (e) {
      console.log(e);
      throw new InternalServerErrorException();
    }
  }

  // Обновляет блог с заданным ID на основе входной модели BlogInputModel
  // Возвращает true, если блог был успешно обновлен, false в противном случае
  async updateBlogById(
    blogId: string,
    inputModel: BlogInputModel,
  ): Promise<number> {
    try {
      const result = await this.blogsRepo.update(
        { id: blogId },
        {
          name: inputModel.name,
          description: inputModel.description,
          websiteUrl: inputModel.websiteUrl,
        },
      );

      return result.affected ? result.affected : 0;
    } catch (e) {
      console.log('error updateBlogById', e);
      throw new InternalServerErrorException();
    }
  }

  // Удаляет блог с заданным ID
  async deleteBlogById(blogId: string): Promise<boolean> {
    return await this.blogsRepo
      .delete({ id: blogId })
      .then((result) => (result.affected ? result.affected === 1 : false))
      .catch((error) => error);
  }

  async updateBlogOwnerInfo(
    userInfo: UserInfo,
    blogId: string,
  ): Promise<boolean> {
    try {
      return await this.blogsRepo
        .update(
          { id: blogId },
          {
            user: { id: userInfo.userId },
          },
        )
        .then((result) => (result.affected ? result.affected === 1 : false));
    } catch (e) {
      console.log(e);
      throw new InternalServerErrorException();
    }
  }
}
