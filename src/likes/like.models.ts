export type ExtendedLikesInfoView = {
  likesCount: number;
  dislikesCount: number;
  myStatus: string;
  newestLikes: LikeInfoView[] | null;
};

export type LikeInfoView = {
  addedAt: string;
  userId: string;
  login: string;
};

export type LikeDBInfo = {
  status: string;
  userId: string;
  userLogin: string;
  postOrCommentId: string;
  createdAt: Date;
};
