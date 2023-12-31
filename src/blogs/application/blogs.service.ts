import { Injectable } from '@nestjs/common';
import { BlogCreateDTO, BlogInputModel, BlogViewDTO } from '../dto/blog.models';
import { UserInfo } from '../../users/dto/view/user-view.models';
import { blogCreator } from '../infrastructure/helpers/blog.helpers';
import { IBlogRepository } from '../../infrastructure/repositoriesModule/repositories.module';

//input: BlogInputModel, output: BlogViewDTO, BlogDocument
// производится проверка заданной бизнес логики, никаких трансформаций с сущностми только передача запросов между сервисами и валидация бизнес задач
@Injectable()
export class BlogsService {
  constructor(private readonly blogsRepository: IBlogRepository) {}
  async findById(id: string): Promise<BlogCreateDTO | null> {
    return this.blogsRepository.findBlogById(id);
  }
  async createBlogSA(inputModel: BlogInputModel): Promise<BlogViewDTO> {
    const createBlog: BlogCreateDTO = blogCreator.createSA(inputModel);
    return await this.blogsRepository.addNewBlog(createBlog);
  }

  async createBlog(
    inputModel: BlogInputModel,
    userInfo: UserInfo,
  ): Promise<BlogViewDTO> {
    const createBlog: BlogCreateDTO = blogCreator.create(inputModel, userInfo);
    return await this.blogsRepository.addNewBlog(createBlog);
  }

  async updateBlog(
    id: string,
    inputModel: BlogInputModel,
    userInfo?: UserInfo,
  ): Promise<boolean | null | number> {
    if (userInfo) {
      const validateResult: BlogCreateDTO | null | boolean =
        await this._isOwnerFoundBlog(id, userInfo.userId);
      if (!validateResult) {
        return validateResult;
      }
    }

    return this.blogsRepository.updateBlogById(id, inputModel);
  }

  async updateBlogSA(
    id: string,
    inputModel: BlogInputModel,
  ): Promise<boolean | null | number> {
    const validateResult: BlogCreateDTO | null = await this.findById(id);
    if (!validateResult) {
      return null;
    }

    if (validateResult.blogOwnerInfo?.userId) {
      return false;
    }

    return this.blogsRepository.updateBlogById(id, inputModel);
  }

  async deleteBlog(
    id: string,
    userInfo: UserInfo,
  ): Promise<Document | null | boolean> {
    const validateResult: BlogCreateDTO | null | boolean =
      await this._isOwnerFoundBlog(id, userInfo.userId);

    if (!validateResult) {
      return validateResult;
    }

    return this.blogsRepository.deleteBlogById(id);
  }

  async deleteBlogSA(id: string): Promise<Document | null | boolean> {
    const validateResult: BlogCreateDTO | null = await this.findById(id);
    if (!validateResult) {
      return null;
    }

    return this.blogsRepository.deleteBlogById(id);
  }
  async _isOwnerFoundBlog(id: string, userId: string) {
    // поиск блога в базе данных.
    const blog: BlogCreateDTO | null = await this.blogsRepository.findBlogById(
      id,
    );
    if (!blog) {
      return null;
    }

    // проверка принадлежности блога автору
    if (blog.blogOwnerInfo?.userId !== userId) {
      return false;
    }

    return blog;
  }

  async bindWithUser(userId: UserInfo, id: string) {
    return this.blogsRepository.updateBlogOwnerInfo(userId, id);
  }
}
