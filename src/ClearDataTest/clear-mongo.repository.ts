import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogModel } from '../blogs/entities/blog.schemas';
import { Injectable } from '@nestjs/common';
import { Post, PostModel } from '../posts/entities/post.schemas';
import { User } from '../users/entities/mongoose/users.schema';
import { Model } from 'mongoose';
import { Like, LikeModel } from '../likes/entitties/like.schemas';
import { Comment, CommentModel } from '../comments/entities/comment.schemas';
import { Device, DeviceModel } from '../devices/entities/device.schemas';

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
