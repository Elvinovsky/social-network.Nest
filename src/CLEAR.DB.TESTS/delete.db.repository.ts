import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogModel } from '../blogs/blog.schemas';
import { Injectable } from '@nestjs/common';
import { Like, LikeModel, Post, PostModel } from '../posts/post.schemas';
import { User } from '../users/users.schema';
import { Model } from 'mongoose';

@Injectable()
export class DeleteDbRepository {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Blog.name) private blogModel: BlogModel,
    @InjectModel(Post.name) private postModel: PostModel,
    @InjectModel(Like.name) private likeModel: LikeModel,
  ) {}
  async deleteDB() {
    await this.blogModel.deleteMany();
    await this.likeModel.deleteMany();
    await this.userModel.deleteMany();
    await this.postModel.deleteMany();
  }
}