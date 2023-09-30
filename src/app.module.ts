// this module should be first line of app.module.ts
import { configModule } from './infrastructure/configuration/config-module';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './users/entities/mongoose/users.schema';
import { BlogsController } from './blogs/api/blogs.controller';
import { BlogsQueryRepo } from './blogs/infrastructure/repositories/mongo/blogs.query.repo';
import { Blog, BlogSchema } from './blogs/entities/blog.schemas';
import { LikesService } from './likes/application/likes.service';
import { LikesRepository } from './likes/infrastructure/repositories/mongo/likes.repository';
import { PostMapper } from './posts/infrastructure/post.helpers';
import { Post, PostSchema } from './posts/entities/post.schemas';
import { BlogsService } from './blogs/application/blogs.service';
import { BlogsRepository } from './blogs/infrastructure/repositories/mongo/blogs.repository';
import { ClearDBController } from './ClearDataTest/clear-db.controller';
import { ClearMongoRepository } from './ClearDataTest/clear-mongo.repository';
import { PostsService } from './posts/application/posts.service';
import { PostsRepository } from './posts/infrastructure/mongo/posts.repository';
import { PostsQueryRepository } from './posts/infrastructure/mongo/posts-query-repository.service';
import { PostsController } from './posts/api/posts.controller';
import { Like, LikeSchema } from './likes/entitties/like.schemas';
import { Comment, CommentSchema } from './comments/entities/comment.schemas';
import { CommentsService } from './comments/application/comments.service';
import { CommentsRepository } from './comments/infrastructure/repositories/mongo/comments.repository';
import { CommentsController } from './comments/api/comments.controller';
import { CommentMapper } from './comments/infrastructure/helpers/comment.mapping';
import { EmailSenderService } from './infrastructure/adapters/email/email.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { Device, DeviceSchema } from './devices/entities/device.schemas';
import { CommentsQueryRepo } from './comments/infrastructure/repositories/mongo/comments.query.repository';
import { DevicesModule } from './devices/devices.module';
import { BlogIdExistenceCheck } from './posts/dto/post.models';
import { getConfiguration } from './infrastructure/configuration/getConfiguration';
import { BloggerBlogsController } from './blogs/api/blogger-blogs.controller';
import { SendSMTPAdapter } from './infrastructure/adapters/email/send-smtp-adapter';
import { SaBlogsController } from './blogs/api/sa-blogs.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClearSQLRepository } from './ClearDataTest/clear-sql.repository';
import { PostsRawSqlRepository } from './posts/infrastructure/sql/posts-raw-sql.repository';
import { PostsRawSqlQueryRepository } from './posts/infrastructure/sql/posts-raw-sql-query.repository';
import { BlogsRawSqlRepository } from './blogs/infrastructure/repositories/sql/blogs-raw-sql.repository';
import { BlogsQueryRawSqlRepository } from './blogs/infrastructure/repositories/sql/blogs-query-raw-sql.repository';
import { CommentsRawSqlRepository } from './comments/infrastructure/repositories/sql/comments-raw-sql.repository';
import { CommentsQueryRawSqlRepository } from './comments/infrastructure/repositories/sql/comments-query-raw-sql.repository';
import { LikesRawSqlRepository } from './likes/infrastructure/repositories/sql/likes-raw-sql.repository';
import * as process from 'process';

@Module({
  imports: [
    configModule,
    UsersModule,
    AuthModule,
    DevicesModule,
    TypeOrmModule.forRoot(
      process.env.NODE_ENV === 'development'
        ? getConfiguration().sqlLocalOptions
        : getConfiguration().sqlRemoteOptions,
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
    ClearDBController,
    BlogsController,
    BloggerBlogsController,
    PostsController,
    CommentsController,
  ],
  providers: [
    BlogIdExistenceCheck,
    AppService,
    {
      provide: ClearMongoRepository,
      useClass:
        getConfiguration().repo_type === 'Mongo'
          ? ClearMongoRepository
          : ClearSQLRepository,
    },

    EmailSenderService,
    SendSMTPAdapter,
    LikesRawSqlRepository,
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
    {
      provide: CommentsRepository,
      useClass:
        getConfiguration().repo_type === 'Mongo'
          ? CommentsRepository
          : CommentsRawSqlRepository,
    },
    {
      provide: CommentsQueryRepo,
      useClass:
        getConfiguration().repo_type === 'Mongo'
          ? CommentsQueryRepo
          : CommentsQueryRawSqlRepository,
    },
    CommentMapper,

    LikesService,
    {
      provide: LikesRepository,
      useClass:
        getConfiguration().repo_type === 'Mongo'
          ? LikesRepository
          : LikesRawSqlRepository,
    },
  ],
})
export class AppModule {}
