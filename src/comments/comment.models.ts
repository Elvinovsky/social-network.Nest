export class CommentInputModel {
  content: string;
  /**
   *maxLength: 300
   *minLength: 20
   */
}

export type CommentCreateDTO = {
  postId: string;
  content: string;
  commentatorInfo: CommentatorInfo;
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
  constructor(public userId: string, public userLogin: string) {}
}
