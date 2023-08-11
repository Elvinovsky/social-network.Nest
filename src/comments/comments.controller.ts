import {
  Controller,
  Get,
  NotFoundException,
  Param,
  UseGuards,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { OptionalBearerGuard } from '../auth/guards/optional-bearer.guard';

@Controller('/comments')
export class CommentsController {
  constructor(private commentService: CommentsService) {}
  @Get(':commentId')
  @UseGuards(OptionalBearerGuard)
  async getComment(@Param('commentId') commentId: string, user?) {
    const comment = await this.commentService.getComment(commentId, user?.id);
    if (!comment) {
      throw new NotFoundException();
    }

    return comment;
  }
}
