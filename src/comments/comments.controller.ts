import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { OptionalBearerGuard } from '../auth/guards/optional-bearer.guard';
import { JwtBearerGuard } from '../auth/guards/jwt-bearer-auth.guard';
import { CommentInputModel } from './comment.models';
import { CurrentUserIdHeaders } from '../auth/decorators/current-userId-headers';
import { UsersService } from '../users/users.service';
import { ObjectIdPipe } from '../common/pipes/trim.pipe';
import { LikeStatus } from '../likes/like.models';
import { LikesService } from '../likes/likes.service';

@Controller('/comments')
export class CommentsController {
  constructor(
    private commentService: CommentsService,
    private usersService: UsersService,
    private likesService: LikesService,
  ) {}

  @Get(':id')
  @UseGuards(OptionalBearerGuard)
  async getComment(@Param('id', ObjectIdPipe) id: string, user?) {
    const comment = await this.commentService.getComment(id, user?.id);
    if (!comment) {
      throw new NotFoundException();
    }

    return comment;
  }

  @Put(':id')
  @UseGuards(JwtBearerGuard)
  async updateComment(
    @Param('id', ObjectIdPipe) id: string,
    @Body() inputModel: CommentInputModel,
    @CurrentUserIdHeaders() userId: string,
  ) {
    // Проверяем, существует ли комментарий с указанным id
    const comment = await this.commentService.getComment(id);

    if (!comment) {
      throw new NotFoundException();
    }

    // Проверяем, является ли пользователь автором комментария
    const currentUser = await this.usersService.getUser(userId);
    if (!currentUser || currentUser.id !== comment.commentatorInfo.userId) {
      throw new ForbiddenException(); // Ошибка: Запрещено (отказано в доступе).
    }

    // Обновляем комментарий
    const foundCommentForUpdate = await this.commentService.updateCommentById(
      id,
      inputModel.content,
    );
    return foundCommentForUpdate;
  }

  @Delete(':id')
  @UseGuards(JwtBearerGuard)
  async deleteComment(
    @Param('id', ObjectIdPipe) id: string,
    @CurrentUserIdHeaders() userId: string,
  ) {
    // Проверяем, существует ли комментарий с указанным id
    const comment = await this.commentService.findCommentById(id);
    if (!comment) {
      throw new NotFoundException();
    }

    // Проверяем, является ли пользователь автором комментария
    const currentUser = await this.usersService.getUser(userId);
    if (!currentUser || currentUser.id !== comment.commentatorInfo.userId) {
      throw new ForbiddenException(); // Ошибка: Запрещено (отказано в доступе).
    }

    // Удаляем комментарий
    const deleteComment = await this.commentService.deleteComment(id);
    return deleteComment;
  }

  @Put(':id/like-status')
  @UseGuards(JwtBearerGuard)
  async updateLikeStatusComment(
    @Param('id', ObjectIdPipe) id: string,
    @Body() inputModel: LikeStatus,
    @CurrentUserIdHeaders() userId: string,
  ) {
    // Получаем комментарий по id
    const comment = await this.commentService.findCommentById(id);
    if (!comment) {
      throw new NotFoundException();
    }

    // Создаем или обновляем лайк для комментария
    const result = await this.likesService.createOrUpdateLike(
      id,
      userId,
      inputModel.likeStatus,
    );
    return result;
  }
}
