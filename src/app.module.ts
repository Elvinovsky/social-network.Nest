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
import { PostsMapping } from './posts/post.helpers';
import { LikeAndDisQuantity } from './likes/like.helpers';
import { Like, LikeSchema, Post, PostSchema } from './posts/post.schemas';
import { BlogsService } from './blogs/blogs.service';
import { BlogsRepository } from './blogs/blogs.repository';
import { DeleteDBController } from './CLEAR.DB.TESTS/delete.db.controller';
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
  controllers: [AppController, UsersController, BlogsController],
  providers: [
    DeleteDBController,
    DeleteDBController,

    AppService,
    UsersService,
    UsersRepository,

    BlogsQueryRepo,
    BlogsRepository,
    BlogsService,

    LikesQueryRepo,
    LikesInfoRepository,
    PostsMapping,
    LikeAndDisQuantity,
  ],
})
export class AppModule {}
