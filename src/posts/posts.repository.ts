import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument, PostModel } from './post.schemas';
import { PostCreateDTO } from './post.models';
import { PostsMapping } from './post.helpers';

@Injectable()
export class PostsRepository {
  constructor(
    @InjectModel(Post.name) private readonly postModel: PostModel,
    private readonly postsMapping: PostsMapping,
  ) {}

  async createPost(inputDTO: PostCreateDTO) {
    try {
      const post: PostDocument = new this.postModel(inputDTO);
      await post.save();
      return this.postsMapping.post(post);
    } catch (e) {
      const foundNewPost: PostDocument | null = await this.postModel.findOne({
        addedAt: inputDTO.addedAt,
      });

      if (!foundNewPost) {
        console.log(e, 'post not created');
        return false;
      }

      console.log(e, 'post created');
      return true;
    }
  }
}
