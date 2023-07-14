import { IsNotEmpty, Length } from 'class-validator';

export class PostInputModel {
  /**
   * title input  model {maxLength: 30 }
   */
  @IsNotEmpty()
  @Length(3, 30)
  title: string;
  /**
   * shortDescription input model {maxLength: 100}
   */
  @IsNotEmpty()
  @Length(3, 100)
  shortDescription: string;
  /**
   * content input model {maxLength: 1000}
   */
  @IsNotEmpty()
  @Length(3, 1000)
  content: string;
  /**
   * ID existing Blog {linked to a post}
   */
  @IsNotEmpty()
  blogId: string;
}

export class BlogPostInputModel {
  // todo не использовать
  /**
   * title input  model {maxLength: 30 }
   */
  @IsNotEmpty()
  @Length(3, 30)
  title: string;
  /**
   * shortDescription input model {maxLength: 100}
   */
  @IsNotEmpty()
  @Length(3, 100)
  shortDescription: string;
  /**
   * content input model {maxLength: 1000}
   */
  @IsNotEmpty()
  @Length(3, 1000)
  content: string;
}
export class PostUpdateInputModel {
  /**
   * title input  model {maxLength: 30 }
   */
  @IsNotEmpty()
  @Length(3, 30)
  title: string;
  /**
   * shortDescription input model {maxLength: 100}
   */
  @IsNotEmpty()
  @Length(3, 100)
  shortDescription: string;
  /**
   * content input model {maxLength: 1000}
   */
  @IsNotEmpty()
  @Length(3, 1000)
  content: string;
}

export type PostCreateDTO = {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  addedAt: string;
};

export type PostViewDTO = {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: string;
  extendedLikesInfo: ExtendedLikesInfoView;
};

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
