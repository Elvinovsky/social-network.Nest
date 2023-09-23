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
  id: string;
  postId: string;
  content: string;
  commentatorInfo: CommentatorInfo;
  addedAt: Date;
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
  isBanned: boolean;
}
