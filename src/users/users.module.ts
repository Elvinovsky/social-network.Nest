import { UsersService } from './application/users.service';
import { UsersMongooseRepository } from './infrastructure/repositories/mongo/users-mongoose.repository';
import { UsersMongooseQueryRepository } from './infrastructure/repositories/mongo/users-mongoose.query.repo';
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
import { LikesService } from '../likes/application/likes.service';
import { LikesRepository } from '../likes/infrastructure/repositories/mongo/likes.repository';
import {
  Like,
  LikeSchema,
} from '../likes/entitties/mongoose/like-no-sql.schemas';
import {
  Comment,
  CommentSchema,
} from '../comments/entities/mongoose/comment-no-sql.schemas';
import { CommentsService } from '../comments/application/comments.service';
import { CommentsRepository } from '../comments/infrastructure/repositories/mongo/comments.repository';
import { CommentMapper } from '../comments/infrastructure/helpers/comment-mapper';
import { UsersRawSQLQueryRepository } from './infrastructure/repositories/sql/users-raw-sql-query.repository';
import { UsersRawSQLRepository } from './infrastructure/repositories/sql/users-raw-sql.repository';
import { getConfiguration } from '../infrastructure/configuration/getConfiguration';
import { CommentsRawSqlRepository } from '../comments/infrastructure/repositories/sql/comments-raw-sql.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersTypeormRepository } from './infrastructure/repositories/typeorm/users-typeorm.repository';
import {
  BanInfoTypeOrmEntity,
  EmailConfirmTypeOrmEntity,
  UserTypeOrmEntity,
} from './entities/typeorm/user-sql.schemas';
import { UsersTypeormQueryRepo } from './infrastructure/repositories/typeorm/users-typeorm-query.repo';

const useCases = [UserRegistrationToAdminUseCase];
@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserTypeOrmEntity,
      EmailConfirmTypeOrmEntity,
      BanInfoTypeOrmEntity,
    ]),
    MongooseModule.forFeature([
      { name: UserMongooseEntity.name, schema: UserSchema },
      { name: Like.name, schema: LikeSchema },
      { name: Comment.name, schema: CommentSchema },
    ]),
    forwardRef(() => DevicesModule),
    CqrsModule,
  ],
  controllers: [UsersController, SaUsersController],
  providers: [
    ...useCases,
    {
      provide: UsersMongooseRepository,
      useClass:
        getConfiguration().repo_type === 'Mongo'
          ? UsersMongooseRepository
          : getConfiguration().repo_type === 'sql'
          ? UsersRawSQLRepository
          : UsersTypeormRepository,
    },
    {
      provide: UsersMongooseQueryRepository,
      useClass:
        getConfiguration().repo_type === 'Mongo'
          ? UsersMongooseQueryRepository
          : getConfiguration().repo_type === 'sql'
          ? UsersRawSQLQueryRepository
          : UsersTypeormQueryRepo,
    },
    LikesService,
    LikesRepository,

    CommentsService,
    {
      provide: CommentsRepository,
      useClass:
        getConfiguration().repo_type === 'Mongo'
          ? CommentsRepository
          : CommentsRawSqlRepository,
    },
    CommentMapper,

    UsersService,
  ],
  exports: [UsersService, UsersMongooseQueryRepository],
})
export class UsersModule {}
