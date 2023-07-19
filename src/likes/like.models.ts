export type ExtendedLikesViewDTO = {
  likesCount: number;
  dislikesCount: number;
  myStatus: string;
  newestLikes: LikeViewDTO[] | null;
};

export type LikeViewDTO = {
  addedAt: string;
  userId: string;
  login: string;
};

export type LikeCreateDTO = {
  status: string;
  userId: string;
  userLogin: string;
  postOrCommentId: string;
  createdAt: Date;
};
