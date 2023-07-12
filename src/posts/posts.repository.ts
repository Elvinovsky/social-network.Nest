import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PostModel } from './post.schemas';

@Injectable()
export class PostsRepository {
  constructor(@InjectModel('posts') private readonly postModel: PostModel) {}
}
