import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { CommentsService } from './comments.service';

@Controller('/comments')
export class CommentsController {
  constructor(private commentService: CommentsService) {}
  @Get(':commentId')
  async getComment(@Param('commentId') commentId: string, user?) {
    const comment = await this.commentService.getComment(commentId, user?.id);
    if (!comment) {
      throw new NotFoundException();
    }

    return comment;
  }
}
