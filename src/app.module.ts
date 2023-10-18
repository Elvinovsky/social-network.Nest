// this module should be first line of app.module.ts
import { configModule } from './infrastructure/configuration/config-module';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  UserMongooseEntity,
  UserSchema,
} from './users/entities/mongoose/user-no-sql.schema';
import { BlogsController } from './blogs/api/blogs.controller';
import {
  BlogMongooseEntity,
  BlogSchema,
} from './blogs/entities/mongoose/blog-no-sql.schemas';
import { LikesService } from './likes/application/likes.service';
import { PostMapper } from './posts/infrastructure/helpers/post-mapper';
import {
  Post,
  PostSchema,
} from './posts/entities/mongoose/post-no-sql.schemas';
import { BlogsService } from './blogs/application/blogs.service';
import { ClearDBController } from './ClearDataTest/clear-db.controller';
import { PostsService } from './posts/application/posts.service';
import { PostsController } from './posts/api/posts.controller';
import {
  Like,
  LikeSchema,
} from './likes/entitties/mongoose/like-no-sql.schemas';
import {
  Comment,
  CommentSchema,
} from './comments/entities/mongoose/comment-no-sql.schemas';
import { CommentsService } from './comments/application/comments.service';
import { CommentsController } from './comments/api/comments.controller';
import { CommentMapper } from './comments/infrastructure/helpers/comment-mapper';
import { EmailSenderService } from './infrastructure/adapters/email/email.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import {
  Device,
  DeviceSchema,
} from './devices/entities/mongoose/device-no-sql.schemas';
import { DevicesModule } from './devices/devices.module';
import { BlogIdExistenceCheck } from './posts/dto/post.models';
import { getConfiguration } from './infrastructure/configuration/getConfiguration';
import { BloggerBlogsController } from './blogs/api/blogger-blogs.controller';
import { SendSMTPAdapter } from './infrastructure/adapters/email/send-smtp-adapter';
import { SaBlogsController } from './blogs/api/sa-blogs.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  BanInfoTypeOrmEntity,
  EmailConfirmTypeOrmEntity,
  UserTypeOrmEntity,
} from './users/entities/typeorm/user-sql.schemas';
import { DeviceTypeOrmEntity } from './devices/entities/typeorm/device-sql.schemas';
import { BlogTypeOrmEntity } from './blogs/entities/typeorm/blog-sql.schemas';
import { repoTypeToClassMap } from './infrastructure/repositoriesModule/repositories.module';
import { DevicesService } from './devices/application/devices.service';

const repositories = repoTypeToClassMap.mongo;

@Module({
  imports: [
    configModule,
    UsersModule,
    AuthModule,
    DevicesModule,
    TypeOrmModule.forRoot(
      // getConfiguration().NODE_ENV === 'Development' // todo realize class or function
      //   ?
      //getConfiguration().SQL_OPTIONS.sqlLocalOptions,
      getConfiguration().SQL_OPTIONS.sqlRemoteOptions,
    ),
    TypeOrmModule.forFeature([
      UserTypeOrmEntity,
      DeviceTypeOrmEntity,
      BanInfoTypeOrmEntity,
      EmailConfirmTypeOrmEntity,
      BlogTypeOrmEntity,
    ]),
    MongooseModule.forRoot(getConfiguration().mongoDBOptions.MONGO_URI),
    MongooseModule.forFeature([
      { name: UserMongooseEntity.name, schema: UserSchema },
      { name: BlogMongooseEntity.name, schema: BlogSchema },
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
    LikesService,
    ...repositories,
    BlogIdExistenceCheck,
    AppService,

    DevicesService,
    EmailSenderService,
    SendSMTPAdapter,
    BlogsService,
    PostMapper,
    CommentMapper,
    PostsService,
    CommentsService,
  ],
})
export class AppModule {}
