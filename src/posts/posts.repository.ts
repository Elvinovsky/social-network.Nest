import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument, PostModel } from './post.schemas';
import { BlogPostInputModel, PostCreateDTO, PostViewDTO } from './post.models';
import { PostMapper } from './post.helpers';
import { objectIdHelper } from '../common/helpers';

@Injectable()
export class PostsRepository {
  constructor(
    @InjectModel(Post.name) private readonly postModel: PostModel,
    private readonly postMapper: PostMapper,
  ) {}
  async findPostById(id: string) {
    try {
      if (!objectIdHelper(id)) return null;

      return await this.postModel.findById(objectIdHelper(id)).exec();
    } catch (e) {
      console.log(e, 'error findPostById method by PostRepository');
      throw new InternalServerErrorException();
    }
  }

  async createPostBlog(inputDTO: PostCreateDTO): Promise<PostViewDTO | null> {
    try {
      const post: PostDocument = new this.postModel(inputDTO);
      await post.save();

      return this.postMapper.mapPost(post);
    } catch (e) {
      console.log(e, 'error createPost method');
      throw new InternalServerErrorException();
    }
  }
  async createPost(inputModel: PostCreateDTO): Promise<PostViewDTO | null> {
    try {
      const post: PostDocument = new this.postModel(inputModel);
      await post.save();

      return this.postMapper.mapPost(post);
    } catch (e) {
      console.log(e, 'error createPost method');
      throw new InternalServerErrorException();
    }
  }

  async updatePostById(
    postId: string,
    inputModel: BlogPostInputModel,
  ): Promise<boolean> {
    try {
      if (!objectIdHelper(postId)) return false;

      const result = await this.postModel.updateOne(
        { _id: objectIdHelper(postId) },
        {
          $set: {
            title: inputModel.title,
            shortDescription: inputModel.shortDescription,
            content: inputModel.content,
          },
        },
      );
      return result.matchedCount === 1;
    } catch (e) {
      console.log(e, 'error updatePostById by postsRepository');
      throw new InternalServerErrorException();
    }
  }

  async deletePost(postId: string): Promise<Document | null> {
    try {
      if (!objectIdHelper(postId)) return null;

      return this.postModel.findByIdAndDelete(objectIdHelper(postId));
    } catch (e) {
      console.log(e, 'error deletePost by postsRepository');
      throw new InternalServerErrorException();
    }
  }
}
