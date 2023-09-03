import { UsersService } from './aplication/users.service';
import { UsersRepository } from './infrastructure/users.repository';
import { UsersQueryRepository } from './infrastructure/users.query.repo';
import { User, UserSchema } from './users.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { forwardRef, Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UserRegistrationToAdminUseCase } from './aplication/use-cases/user-registration-to-admin-use-case';
import { CqrsModule } from '@nestjs/cqrs';
import { SaUsersController } from '../api/sa/sa-users.controller';
import { DevicesModule } from '../devices/devices.module';
import { LikesService } from '../likes/likes.service';
import { LikesRepository } from '../likes/likes.repository';
import { Like, LikeSchema } from '../likes/like.schemas';
import { Comment, CommentSchema } from '../comments/comment.schemas';
import { CommentsService } from '../comments/comments.service';
import { CommentsRepository } from '../comments/comments.repository';
import { CommentMapper } from '../comments/helpers/comment.mapping';

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
    LikesService,
    LikesRepository,

    CommentsService,
    CommentsRepository,
    CommentMapper,

    UsersService,
    UsersRepository,
    UsersQueryRepository,
  ],
  exports: [UsersService, UsersQueryRepository],
})
export class UsersModule {}
