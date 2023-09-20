// this module should be first line of app.module.ts
import { configModule } from './configuration/config-module';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './users/users.schema';
import { BlogsController } from './blogs/blogs.controller';
import { BlogsQueryRepo } from './blogs/infrastructure/repositories/blogs.query.repo';
import { Blog, BlogSchema } from './blogs/blog.schemas';
import { LikesService } from './likes/likes.service';
import { LikesRepository } from './likes/likes.repository';
import { PostMapper } from './posts/post.helpers';
import { Post, PostSchema } from './posts/post.schemas';
import { BlogsService } from './blogs/application/blogs.service';
import { BlogsRepository } from './blogs/infrastructure/repositories/blogs.repository';
import { DeleteDBController } from './db-clear.testing/delete.db.controller';
import { DeleteDbRepository } from './db-clear.testing/delete.db.repository';
import { PostsService } from './posts/posts.service';
import { PostsRepository } from './posts/infrastructure/mongo/posts.repository';
import { PostsQueryRepository } from './posts/infrastructure/mongo/posts-query-repository.service';
import { PostsController } from './posts/posts.controller';
import { Like, LikeSchema } from './likes/like.schemas';
import { Comment, CommentSchema } from './comments/comment.schemas';
import { CommentsService } from './comments/comments.service';
import { CommentsRepository } from './comments/comments.repository';
import { CommentsController } from './comments/comments.controller';
import { CommentMapper } from './comments/helpers/comment.mapping';
import { EmailSenderService } from './email/email.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { Device, DeviceSchema } from './devices/device.schemas';
import { CommentsQueryRepo } from './comments/comments.query.repository';
import { DevicesModule } from './devices/devices.module';
import { BlogIdExistenceCheck } from './posts/post.models';
import { getConfiguration } from './configuration/getConfiguration';
import { BloggerBlogsController } from './api/blogger/blogger-blogs.controller';
import { SendSMTPAdapter } from './email/send-smtp-adapter';
import { SaBlogsController } from './api/sa/sa-blogs.controller';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DeleteDbSQLRepository } from './db-clear.testing/delete-sql-testing.repository';
import { PostsRawSqlRepository } from './posts/infrastructure/sql/posts-raw-sql.repository';
import { PostsRawSqlQueryRepository } from './posts/infrastructure/sql/posts-raw-sql-query.repository';
import { BlogsRawSqlRepository } from './blogs/infrastructure/repositories/sql/blogs-raw-sql.repository';
import { BlogsQueryRawSqlRepository } from './blogs/infrastructure/repositories/sql/blogs-query-raw-sql.repository';

@Module({
  imports: [
    configModule,
    UsersModule,
    AuthModule,
    DevicesModule,
    TypeOrmModule.forRoot(
      getConfiguration().sqlOptions as TypeOrmModuleOptions,
    ),
    MongooseModule.forRoot(getConfiguration().mongoDBOptions.MONGO_URI),
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
    SaBlogsController,
    AppController,
    DeleteDBController,
    BlogsController,
    BloggerBlogsController,
    PostsController,
    CommentsController,
  ],
  providers: [
    BlogIdExistenceCheck,
    AppService,
    {
      provide: DeleteDbRepository,
      useClass:
        getConfiguration().repo_type === 'Mongo'
          ? DeleteDbRepository
          : DeleteDbSQLRepository,
    },

    EmailSenderService,
    SendSMTPAdapter,
    {
      provide: BlogsRepository,
      useClass:
        getConfiguration().repo_type === 'Mongo'
          ? BlogsRepository
          : BlogsRawSqlRepository,
    },
    {
      provide: BlogsQueryRepo,
      useClass:
        getConfiguration().repo_type === 'Mongo'
          ? BlogsQueryRepo
          : BlogsQueryRawSqlRepository,
    },
    BlogsService,

    PostsService,
    PostsQueryRepository,
    PostMapper,
    {
      provide: PostsRepository,
      useClass:
        getConfiguration().repo_type === 'Mongo'
          ? PostsRepository
          : PostsRawSqlRepository,
    },
    {
      provide: PostsQueryRepository,
      useClass:
        getConfiguration().repo_type === 'Mongo'
          ? PostsQueryRepository
          : PostsRawSqlQueryRepository,
    },
    CommentsService,
    CommentsRepository,
    CommentsQueryRepo,
    CommentMapper,

    LikesService,
    LikesRepository,
  ],
})
export class AppModule {}
