import { UserInfo } from '../../../users/dto/view/user-view.models';
import { CommentCreateDTO } from '../../dto/comment.models';
import { v4 as uuidv4 } from 'uuid';

class CommentCreator extends CommentCreateDTO {
  create(
    postId: string,
    userInfo: UserInfo,
    content: string,
  ): CommentCreateDTO {
    const newComment: CommentCreateDTO = new CommentCreator();

    newComment.id = uuidv4();
    newComment.postId = postId;
    newComment.commentatorInfo = {
      userId: userInfo.userId,
      userLogin: userInfo.userLogin,
      isBanned: false,
    };
    newComment.content = content;
    newComment.addedAt = new Date();

    return newComment;
  }
}

export const commentCreator = new CommentCreator();
