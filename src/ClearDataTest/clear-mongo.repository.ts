import { InjectModel } from '@nestjs/mongoose';
import {
  Blog,
  BlogModel,
} from '../blogs/entities/mongoose/blog-no-sql.schemas';
import { Injectable } from '@nestjs/common';
import {
  Post,
  PostModel,
} from '../posts/entities/mongoose/post-no-sql.schemas';
import { User } from '../users/entities/mongoose/user-no-sql.schema';
import { Model } from 'mongoose';
import {
  Like,
  LikeModel,
} from '../likes/entitties/mongoose/like-no-sql.schemas';
import {
  Comment,
  CommentModel,
} from '../comments/entities/mongoose/comment-no-sql.schemas';
import {
  Device,
  DeviceModel,
} from '../devices/entities/mongoose/device-no-sql.schemas';

@Injectable()
export class ClearMongoRepository {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Blog.name) private blogModel: BlogModel,
    @InjectModel(Post.name) private postModel: PostModel,
    @InjectModel(Comment.name) private commentModel: CommentModel,
    @InjectModel(Like.name) private likeModel: LikeModel,
    @InjectModel(Device.name) private deviceModel: DeviceModel,
  ) {}
  async deleteDB() {
    await this.blogModel.deleteMany();
    await this.likeModel.deleteMany();
    await this.userModel.deleteMany();
    await this.postModel.deleteMany();
    await this.commentModel.deleteMany();
    await this.deviceModel.deleteMany();
  }
}
