import {
  BlogCreateDTO,
  BlogInputModel,
  BlogViewDTO,
} from '../../../dto/blog.models';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { blogMapping } from '../../helpers/blog.helpers';
import { UserInfo } from '../../../../users/dto/view/user-view.models';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

// Репозиторий блогов, который используется для выполнения операций CRUD
@Injectable()
export class BlogsRawSqlRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  // Находит блог по заданному ID
  // Возвращает BlogDocument или null, если блог не найден
  async findBlogById(blogId: string): Promise<BlogCreateDTO | null> {
    try {
      const blog = await this.dataSource.query(
        `
      SELECT "id", "name", "description", "websiteUrl", "addedAt", "isMembership", "userId", "userLogin"
      FROM features.blogs
      WHERE "id" = $1;
      `,
        [blogId],
      );

      if (blog.length < 1) {
        return null;
      }

      return {
        id: blog[0].id,
        name: blog[0].name,
        description: blog[0].description,
        websiteUrl: blog[0].websiteUrl,
        addedAt: blog[0].addedAt,
        isMembership: blog[0].isMembership,
        blogOwnerInfo: {
          userId: blog[0].userId,
          userLogin: blog[0].userLogin,
        },
      };
    } catch (e) {
      console.log(e, 'error findBlogById method by BlogsRepository');
      throw new InternalServerErrorException();
    }
  }

  // Добавляет новый блог в ДБ на основе входной модели BlogCreateDTO
  // Возвращает BlogViewDTO созданного блога
  async addNewBlog(inputModel: BlogCreateDTO): Promise<BlogViewDTO> {
    try {
      const newBlog = await this.dataSource.query(
        `
   INSERT INTO "features"."blogs"(
        "id", "name", "description", "websiteUrl", "addedAt", "isMembership", "userId", "userLogin")
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8);
   `,
        [
          inputModel.id,
          inputModel.name,
          inputModel.description,
          inputModel.websiteUrl,
          inputModel.addedAt,
          inputModel.isMembership,
          inputModel.blogOwnerInfo?.userId,
          inputModel.blogOwnerInfo?.userLogin,
        ],
      );

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
      const result = await this.dataSource.query(
        `
        UPDATE "features"."blogs"
        SET "name" = $1, "description" = $2, "websiteUrl" = $3
        WHERE "id" = $4
        `,
        [
          inputModel.name,
          inputModel.description,
          inputModel.websiteUrl,
          blogId,
        ],
      );
      return result[1];
    } catch (e) {
      console.log('error updateBlogById', e);
      throw new InternalServerErrorException();
    }
  }

  // Удаляет блог с заданным ID
  async deleteBlogById(blogId: string): Promise<boolean> {
    return await this.dataSource
      .query(
        `
        DELETE FROM "features"."blogs"
        WHERE "id" = $1
        `,
        [blogId],
      )
      .then((result) => Promise.resolve(result[1] === 1))
      .catch((error) => Promise.reject(error));
  }

  async updateBlogOwnerInfo(
    userInfo: UserInfo,
    blogId: string,
  ): Promise<boolean> {
    try {
      return await this.dataSource
        .query(
          `
        UPDATE "feature"."blogs"
        SET "userId" = $1, "userLogin" = $2
        WHERE "id" = $3
        `,
          [userInfo.userId, userInfo.userLogin, blogId],
        )
        .then((result) => result[1] === 1);
    } catch (e) {
      console.log(e);
      throw new InternalServerErrorException();
    }
  }
}
