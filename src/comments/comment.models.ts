import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CommentInputModel {
  @IsNotEmpty()
  @IsString()
  @Length(20, 300)
  content: string;
  /**
   *maxLength: 300
   *minLength: 20
   */
}

export type CommentCreateDTO = {
  postId: string;
  content: string;
  userId: string;
  userLogin: string;
  addedAt: string;
};

export type CommentViewDTO = {
  id: string;
  content: string;
  commentatorInfo: {
    userId: string;
    userLogin: string;
  };
  likesInfo: {
    likesCount: number;
    dislikesCount: number;
    myStatus: string;
  };
  createdAt: string;
};

export class CommentatorInfo {
  userId: string;
  userLogin: string;
}
