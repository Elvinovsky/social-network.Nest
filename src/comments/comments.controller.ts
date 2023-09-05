import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { OptionalBearerGuard } from '../auth/guards/optional-bearer.guard';
import { JwtBearerGuard } from '../auth/guards/jwt-bearer-auth.guard';
import { CommentInputModel } from './comment.models';
import { UsersService } from '../users/aplication/users.service';
import { LikeStatus } from '../likes/like.models';
import { LikesService } from '../likes/likes.service';
import { CurrentUserIdOptional } from '../auth/decorators/current-userId-optional.decorator';
import { ObjectIdPipe } from '../common/pipes/object-id.pipe';
import { UserInfo } from '../users/user.models';
import { CurrentSessionInfoFromAccessJWT } from '../auth/decorators/current-session-info-jwt';

@Controller('/comments')
export class CommentsController {
  constructor(
    private commentService: CommentsService,
    private usersService: UsersService,
    private likesService: LikesService,
  ) {}

  @Get(':id')
  @UseGuards(OptionalBearerGuard)
  async getComment(
    @Param('id', ObjectIdPipe) id: string,
    @CurrentUserIdOptional() userId?: string,
  ) {
    const comment = await this.commentService.getComment(id, userId);
    if (!comment) {
      throw new NotFoundException();
    }

    return comment;
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(':id')
  @UseGuards(JwtBearerGuard)
  async updateComment(
    @Param('id', ObjectIdPipe) id: string,
    @Body() inputModel: CommentInputModel,
    @CurrentSessionInfoFromAccessJWT()
    sessionInfo: { userId: string; deviceId: string },
  ) {
    // Проверяем, существует ли комментарий с указанным id
    const comment = await this.commentService.getComment(id);

    if (!comment) {
      throw new NotFoundException();
    }

    // Проверяем, является ли пользователь автором комментария
    const currentUser = await this.usersService.findUser(sessionInfo.userId);
    if (!currentUser || currentUser.id !== comment.commentatorInfo.userId) {
      throw new ForbiddenException(); // Ошибка: Запрещено (отказано в доступе).
    }

    // Обновляем комментарий
    const updateComment = await this.commentService.updateCommentById(
      id,
      inputModel.content,
    );
    return updateComment;
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  @UseGuards(JwtBearerGuard)
  async deleteComment(
    @Param('id', ObjectIdPipe) id: string,
    @CurrentSessionInfoFromAccessJWT()
    sessionInfo: { userId: string; deviceId: string },
  ) {
    // Проверяем, существует ли комментарий с указанным id
    const comment = await this.commentService.findCommentById(id);
    if (!comment) {
      throw new NotFoundException();
    }

    // Проверяем, является ли пользователь автором комментария
    const currentUser = await this.usersService.getUserSA(sessionInfo.userId);
    if (!currentUser || currentUser.id !== comment.commentatorInfo.userId) {
      throw new ForbiddenException(); // Ошибка: Запрещено (отказано в доступе).
    }

    // Удаляем комментарий
    const deleteComment = await this.commentService.deleteComment(id);
    return deleteComment;
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(':id/like-status')
  @UseGuards(JwtBearerGuard)
  async updateLikeStatusComment(
    @Param('id', ObjectIdPipe) id: string,
    @Body() inputModel: LikeStatus,
    @CurrentSessionInfoFromAccessJWT()
    sessionInfo: { userInfo: UserInfo; deviceId: string },
  ) {
    // Получаем комментарий по id
    const comment = await this.commentService.findCommentById(id);
    if (!comment) {
      throw new NotFoundException();
    }

    // Создаем или обновляем лайк для комментария
    const result = await this.likesService.createOrUpdateLike(
      id,
      sessionInfo.userInfo,
      inputModel.likeStatus,
    );
    return result;
  }
}
