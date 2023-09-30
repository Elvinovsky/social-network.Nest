import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostModel } from '../../entities/post.schemas';
import {
  BlogPostInputModel,
  PostCreateDTO,
  PostViewDTO,
} from '../../dto/post.models';
import { PostMapper } from '../post.helpers';

@Injectable()
export class PostsRepository {
  constructor(
    @InjectModel(Post.name) private readonly postModel: PostModel,
    private readonly postMapper: PostMapper,
  ) {}

  async findPostById(id: string): Promise<boolean> {
    return !!(await this.postModel.findOne({ id: id }).exec());
  }

  async createPost(inputModel: PostCreateDTO): Promise<PostViewDTO> {
    const post = new this.postModel(inputModel);
    return post
      .save()
      .then((post) => this.postMapper.mapPost(post as PostCreateDTO))
      .catch((error) => Promise.reject(error));
  }

  async updatePostById(
    postId: string,
    blogId: string,
    inputModel: BlogPostInputModel,
  ): Promise<boolean> {
    return this.postModel
      .updateOne(
        { id: postId, blogId: blogId },
        {
          $set: {
            title: inputModel.title,
            shortDescription: inputModel.shortDescription,
            content: inputModel.content,
          },
        },
      )
      .then((result) => Promise.resolve(result.matchedCount === 1))
      .catch((error) => Promise.reject(error));
  }

  async deletePost(postId: string): Promise<boolean> {
    return this.postModel
      .deleteOne({ id: postId })
      .then((deletedPost) => Promise.resolve(deletedPost.deletedCount === 1))
      .catch((error) => Promise.reject(error));
  }
}
