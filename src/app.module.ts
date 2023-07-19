import { ConfigModule } from '@nestjs/config';
export const configModule = ConfigModule.forRoot();
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersController } from './users/users.controller';
import { UsersService } from './users/users.service';
import { UsersRepository } from './users/users.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './users/users.schema';
import { BlogsController } from './blogs/blogs.controller';
import { BlogsQueryRepo } from './blogs/blogs.query.repo';
import { Blog, BlogSchema } from './blogs/blog.schemas';
import { LikesQueryRepo } from './likes/likes.query.repo';
import { LikesInfoRepository } from './likes/likes.repository';
import { PostMapper } from './posts/post.helpers';
import { LikeAndDisQuantity } from './likes/like.helpers';
import { Post, PostSchema } from './posts/post.schemas';
import { BlogsService } from './blogs/blogs.service';
import { BlogsRepository } from './blogs/blogs.repository';
import { DeleteDBController } from './CLEAR.DB.TESTS/delete.db.controller';
import { DeleteDbRepository } from './CLEAR.DB.TESTS/delete.db.repository';
import { PostsService } from './posts/posts.service';
import { PostsRepository } from './posts/posts.repository';
import { PostsQueryRepo } from './posts/posts.query.repo';
import { PostsController } from './posts/posts.controller';
import { UsersQueryRepository } from './users/users.query.repo';
import { Like, LikeSchema } from './likes/like.schemas';

const Mongo_Uri = process.env.MONGO_URL;
if (!Mongo_Uri) {
  throw new Error('not db connect');
}
@Module({
  imports: [
    configModule,
    MongooseModule.forRoot(Mongo_Uri),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Blog.name, schema: BlogSchema }]),
    MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
    MongooseModule.forFeature([{ name: Like.name, schema: LikeSchema }]),
  ],
  controllers: [
    AppController,
    DeleteDBController,
    UsersController,
    BlogsController,
    PostsController,
  ],
  providers: [
    DeleteDbRepository,

    AppService,
    UsersService,
    UsersRepository,
    UsersQueryRepository,

    BlogsQueryRepo,
    BlogsRepository,
    BlogsService,

    PostsService,
    PostsRepository,
    PostsQueryRepo,

    LikesQueryRepo,
    LikesInfoRepository,
    PostMapper,
    LikeAndDisQuantity,
  ],
})
export class AppModule {}
