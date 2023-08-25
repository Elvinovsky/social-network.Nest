import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument, PostModel } from './post.schemas';
import {
  BlogPostInputModel,
  PostCreateDTO,
  PostInputModel,
  PostViewDTO,
} from './post.models';
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

      return await this.postModel.findById(objectIdHelper(id));
    } catch (e) {
      console.log(e, 'error findPostById method by PostRepository');
      throw new InternalServerErrorException();
    }
  }

  async createPostBlog(
    inputDTO: BlogPostInputModel,
    blogId: string,
    blogName: string,
  ): Promise<PostViewDTO | null> {
    try {
      const createPost: PostCreateDTO = {
        blogId: blogId,
        title: inputDTO.title,
        shortDescription: inputDTO.shortDescription,
        content: inputDTO.content,
        blogName: blogName,
        addedAt: new Date().toISOString(),
      };

      const post: PostDocument = new this.postModel(createPost);
      await post.save();

      return this.postMapper.mapPost(post);
    } catch (e) {
      console.log(e, 'error createPost method');
      throw new InternalServerErrorException();
    }
  }
  async createPost(
    inputModel: PostInputModel,
    blogName: string,
  ): Promise<PostViewDTO | null> {
    try {
      const createPost: PostCreateDTO = {
        blogId: inputModel.blogId,
        title: inputModel.title,
        shortDescription: inputModel.shortDescription,
        content: inputModel.content,
        blogName: blogName,
        addedAt: new Date().toISOString(),
      };
      const post: PostDocument = new this.postModel(createPost);
      await post.save();

      return this.postMapper.mapPost(post);
    } catch (e) {
      console.log(e, 'error createPost method');
      throw new InternalServerErrorException();
    }
  }

  async updatePostById(
    postId: string,
    inputModel: PostInputModel,
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
      throw new HttpException('failed', HttpStatus.EXPECTATION_FAILED);
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
