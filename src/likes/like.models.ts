import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class LikeStatus {
  @IsNotEmpty()
  @IsString()
  @Matches(/^Like$|^Dislike$|^None$/)
  likeStatus: string;
}

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
