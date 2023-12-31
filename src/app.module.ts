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
import { PostMapper } from './posts/infrastructure/helpers/post-mapper';
import {
  PostMongooseEntity,
  PostSchema,
} from './posts/entities/mongoose/post-no-sql.schemas';
import { BlogsService } from './blogs/application/blogs.service';
import { ClearDBController } from './ClearDataTest/clear-db.controller';
import { PostsService } from './posts/application/posts.service';
import { PostsController } from './posts/api/posts.controller';
import {
  LikeMongooseEntity,
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

import {
  Device,
  DeviceSchema,
} from './devices/entities/mongoose/device-no-sql.schemas';

import { BlogIdExistenceCheck } from './posts/dto/post.models';
import { getConfiguration } from './infrastructure/configuration/getConfiguration';
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
import { PostTypeOrmEntity } from './posts/entities/typeorm/post-sql.schemas';
import { LikeTypeormEntity } from './likes/entitties/typeorm/like-sql.schemas';
import { UsersController } from './users/api/users.controller';
import { DevicesController } from './devices/api/devices.controller';
import { CodeExpireCheck } from './auth/dto/auth-input.models';
import { OptionalBearerGuard } from './auth/infrastructure/guards/optional-bearer.guard';
import { AuthService } from './auth/application/auth.service';
import { BasicStrategy } from './auth/infrastructure/strategies/basic.strategy';
import { BasicAuthGuard } from './auth/infrastructure/guards/basic-auth.guard';
import { LocalAuthGuard } from './auth/infrastructure/guards/local-auth.guard';
import { LocalStrategy } from './auth/infrastructure/strategies/local.strategy';
import { JwtRefreshGuard } from './auth/infrastructure/guards/jwt-refresh.guard';
import { JwtBearerGuard } from './auth/infrastructure/guards/jwt-bearer-auth.guard';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { UserRegistrationUseCase } from './auth/application/use-cases/user-registration-use-case.';
import { AuthController } from './auth/api/auth.controller';
import { UserRegistrationToAdminUseCase } from './users/application/use-cases/user-registration-to-admin-use-case';
import { UsersService } from './users/application/users.service';
import { ThrottlerModule } from '@nestjs/throttler';
import { CqrsModule } from '@nestjs/cqrs';
import { PassportModule } from '@nestjs/passport';
import { CreateUpdateLikeUseCase } from './likes/application/use-cases/create-update-like-use-case';
import { LikesRawSqlRepository } from './likes/infrastructure/repositories/sql/likes-raw-sql.repository';
import { DevicesModule } from './devices/devices.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { LikesService } from './likes/application/likes.service';

const repositories = repoTypeToClassMap.typeorm;

@Module({
  imports: [
    ThrottlerModule.forRoot({
      ttl: 10,
      limit: 5,
    }),
    CqrsModule,
    PassportModule,
    JwtModule.register({
      global: true,
    }),
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
      PostTypeOrmEntity,
      LikeTypeormEntity,
    ]),
    MongooseModule.forRoot(getConfiguration().mongoDBOptions.MONGO_URI),
    MongooseModule.forFeature([
      { name: UserMongooseEntity.name, schema: UserSchema },
      { name: BlogMongooseEntity.name, schema: BlogSchema },
      { name: PostMongooseEntity.name, schema: PostSchema },
      { name: LikeMongooseEntity.name, schema: LikeSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: Device.name, schema: DeviceSchema },
    ]),
  ],
  controllers: [
    AuthController,
    UsersController,
    DevicesController,
    SaBlogsController,
    AppController,
    ClearDBController,
    BlogsController,
    PostsController,
    CommentsController,
  ],
  providers: [
    ...repositories,
    LikesService,

    LikesRawSqlRepository,
    CreateUpdateLikeUseCase,
    BlogIdExistenceCheck,
    AppService,
    CodeExpireCheck,
    OptionalBearerGuard,
    AuthService,
    BasicStrategy,
    BasicAuthGuard,
    LocalAuthGuard,
    LocalStrategy,
    JwtRefreshGuard,
    JwtBearerGuard,
    JwtService,
    UserRegistrationUseCase,
    UserRegistrationToAdminUseCase,
    PostMapper,
    CommentMapper,
    DevicesService,
    EmailSenderService,
    SendSMTPAdapter,
    BlogsService,
    PostsService,
    CommentsService,
    UsersService,
  ],
})
export class AppModule {}
