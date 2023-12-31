import { UsersService } from './application/users.service';
import {
  UserMongooseEntity,
  UserSchema,
} from './entities/mongoose/user-no-sql.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { forwardRef, Module } from '@nestjs/common';
import { UsersController } from './api/users.controller';
import { UserRegistrationToAdminUseCase } from './application/use-cases/user-registration-to-admin-use-case';
import { CqrsModule } from '@nestjs/cqrs';
import { SaUsersController } from './api/sa-users.controller';
import { DevicesModule } from '../devices/devices.module';
import {
  LikeMongooseEntity,
  LikeSchema,
} from '../likes/entitties/mongoose/like-no-sql.schemas';
import {
  Comment,
  CommentSchema,
} from '../comments/entities/mongoose/comment-no-sql.schemas';
import { CommentsService } from '../comments/application/comments.service';
import { CommentMapper } from '../comments/infrastructure/helpers/comment-mapper';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  BanInfoTypeOrmEntity,
  EmailConfirmTypeOrmEntity,
  UserTypeOrmEntity,
} from './entities/typeorm/user-sql.schemas';
import { repoTypeToClassMapUser } from '../infrastructure/repositoriesModule/repositories.module';
import { LikeTypeormEntity } from '../likes/entitties/typeorm/like-sql.schemas';
import { LikesService } from '../likes/application/likes.service';
import { LikesRawSqlRepository } from '../likes/infrastructure/repositories/sql/likes-raw-sql.repository';

const useCases = [UserRegistrationToAdminUseCase];

const repositories = repoTypeToClassMapUser.typeorm;

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserTypeOrmEntity,
      EmailConfirmTypeOrmEntity,
      BanInfoTypeOrmEntity,
      LikeTypeormEntity,
    ]),
    MongooseModule.forFeature([
      { name: UserMongooseEntity.name, schema: UserSchema },
      { name: LikeMongooseEntity.name, schema: LikeSchema },
      { name: Comment.name, schema: CommentSchema },
    ]),
    forwardRef(() => DevicesModule),
    CqrsModule,
  ],
  controllers: [UsersController, SaUsersController],
  providers: [
    ...useCases,
    ...repositories,
    LikesRawSqlRepository,
    CommentsService,
    UsersService,
    CommentMapper,
    LikesService,
  ],
  exports: [UsersService, ...repositories],
})
export class UsersModule {}
