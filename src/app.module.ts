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
import { LikesService } from './likes/likes.service';
import { LikesRepository } from './likes/likes.repository';
import { PostMapper } from './posts/post.helpers';
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
import { Comment, CommentSchema } from './comments/comment.schemas';
import { CommentsService } from './comments/comments.service';
import { CommentsRepository } from './comments/comments.repository';
import { CommentsController } from './comments/comments.controller';
import { CommentMapper } from './comments/helpers/comment.mapping';

//const mongoUrl = process.env.MONGO_URL;
const mongoUrl = `mongodb://0.0.0.0:27017/${process.env.DB_NAME}`;
if (!mongoUrl) {
  throw new Error('not db connect');
}
@Module({
  imports: [
    configModule,
    MongooseModule.forRoot(mongoUrl),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Blog.name, schema: BlogSchema }]),
    MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
    MongooseModule.forFeature([{ name: Like.name, schema: LikeSchema }]),
    MongooseModule.forFeature([{ name: Comment.name, schema: CommentSchema }]),
  ],
  controllers: [
    AppController,
    DeleteDBController,
    UsersController,
    BlogsController,
    PostsController,
    CommentsController,
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
    PostMapper,

    CommentsService,
    CommentsRepository,
    CommentMapper,

    LikesService,
    LikesRepository,
  ],
})
export class AppModule {}
