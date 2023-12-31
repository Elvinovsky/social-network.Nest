import { Injectable, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { PostMapper } from '../../helpers/post-mapper';
import {
  BlogPostInputModel,
  PostCreateDTO,
  PostViewDTO,
} from '../../../dto/post.models';
import { IPostRepository } from '../../../../infrastructure/repositoriesModule/repositories.module';
import { PostTypeOrmEntity } from '../../../entities/typeorm/post-sql.schemas';

@Injectable()
export class PostsTypeormRepository implements IPostRepository {
  private readonly logger = new Logger(PostsTypeormRepository.name);

  constructor(
    @InjectRepository(PostTypeOrmEntity)
    private readonly postsRepository: Repository<PostTypeOrmEntity>,
    protected postMapper: PostMapper,
  ) {}

  async findPostById(postId: string): Promise<boolean> {
    try {
      const result = await this.postsRepository.findOne({
        select: ['title', 'blog'],
        where: { id: postId },
      });
      return !!result;
    } catch (error) {
      this.logger.error(`Error in findPostById: ${error.message}`);
      throw error;
    }
  }

  async createPost(inputModel: PostCreateDTO): Promise<PostViewDTO> {
    try {
      const newPost = this.postsRepository.create(inputModel);
      await this.postsRepository.save(newPost);
      return this.postMapper.mapPost(inputModel);
    } catch (error) {
      this.logger.error(`Error in createPost: ${error.message}`);
      throw error;
    }
  }

  async updatePostById(
    postId: string,
    blogId: string,
    inputModel: BlogPostInputModel,
  ): Promise<boolean> {
    try {
      const result = await this.postsRepository.update(
        { id: postId, blog: { id: blogId } },
        inputModel,
      );
      return result.affected ? result.affected > 0 : false;
    } catch (error) {
      this.logger.error(`Error in updatePostById: ${error.message}`);
      throw error;
    }
  }

  async deletePost(postId: string): Promise<boolean> {
    try {
      const result = await this.postsRepository.delete(postId);
      return result.affected ? result.affected > 0 : false;
    } catch (error) {
      this.logger.error(`Error in deletePost: ${error.message}`);
      throw error;
    }
  }
}
