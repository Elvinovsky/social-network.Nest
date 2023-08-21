// this module should be first line of app.module.ts
import { configModule } from './configuration/config-module';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
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
import { Like, LikeSchema } from './likes/like.schemas';
import { Comment, CommentSchema } from './comments/comment.schemas';
import { CommentsService } from './comments/comments.service';
import { CommentsRepository } from './comments/comments.repository';
import { CommentsController } from './comments/comments.controller';
import { CommentMapper } from './comments/helpers/comment.mapping';
import { EmailService } from './email/email.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { Device, DeviceSchema } from './devices/device.schemas';
import { CommentsQueryRepo } from './comments/comments.query.repository';
import { DevicesModule } from './devices/devices.module';
import { BlogIdExistenceCheck } from './posts/post.models';
import { getConfiguration } from './configuration/getConfiguration';

@Module({
  imports: [
    configModule,
    UsersModule,
    AuthModule,
    DevicesModule,
    MongooseModule.forRoot(getConfiguration().db.MONGO_URI),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Blog.name, schema: BlogSchema },
      { name: Post.name, schema: PostSchema },
      { name: Like.name, schema: LikeSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: Device.name, schema: DeviceSchema },
    ]),
  ],
  controllers: [
    AppController,
    DeleteDBController,
    BlogsController,
    PostsController,
    CommentsController,
  ],
  providers: [
    BlogIdExistenceCheck,
    AppService,
    DeleteDbRepository,
    EmailService,

    BlogsQueryRepo,
    BlogsRepository,
    BlogsService,

    PostsService,
    PostsRepository,
    PostsQueryRepo,
    PostMapper,

    CommentsService,
    CommentsRepository,
    CommentsQueryRepo,
    CommentMapper,

    LikesService,
    LikesRepository,
  ],
})
export class AppModule {}
