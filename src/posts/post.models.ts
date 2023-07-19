import { IsNotEmpty, Length } from 'class-validator';
import { ExtendedLikesInfoView } from '../likes/like.models';

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
