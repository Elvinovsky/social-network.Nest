import { UsersService } from './application/users.service';
import { UsersRepository } from './infrastructure/users.repository';
import { UsersQueryRepository } from './infrastructure/users.query.repo';
import { User, UserSchema } from './users.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { forwardRef, Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UserRegistrationToAdminUseCase } from './application/use-cases/user-registration-to-admin-use-case';
import { CqrsModule } from '@nestjs/cqrs';
import { SaUsersController } from '../api/sa/sa-users.controller';
import { DevicesModule } from '../devices/devices.module';
import { LikesService } from '../likes/likes.service';
import { LikesRepository } from '../likes/likes.repository';
import { Like, LikeSchema } from '../likes/like.schemas';
import { Comment, CommentSchema } from '../comments/comment.schemas';
import { CommentsService } from '../comments/comments.service';
import { CommentsRepository } from '../comments/infrastructure/repositories/mongo/comments.repository';
import { CommentMapper } from '../comments/helpers/comment.mapping';
import { UsersRawSQLQueryRepository } from './infrastructure/sql/users-raw-sql-query.repository';
import { UsersRawSQLRepository } from './infrastructure/sql/users-raw-sql.repository';
import { getConfiguration } from '../configuration/getConfiguration';
import { CommentsRawSqlRepository } from '../comments/infrastructure/repositories/sql/comments-raw-sql.repository';

const useCases = [UserRegistrationToAdminUseCase];
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
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
      provide: UsersRepository,
      useClass:
        getConfiguration().repo_type === 'Mongo'
          ? UsersRepository
          : UsersRawSQLRepository,
    },
    {
      provide: UsersQueryRepository,
      useClass:
        getConfiguration().repo_type === 'Mongo'
          ? UsersQueryRepository
          : UsersRawSQLQueryRepository,
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
  exports: [UsersService, UsersQueryRepository],
})
export class UsersModule {}
