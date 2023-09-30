import { IsNotEmpty, IsUrl, Length } from 'class-validator';
import { UserInfo } from '../../users/dto/view/user-view.models';

export class BlogInputModel {
  /**
   * name input Blog {maxLength: 15}
   */
  @IsNotEmpty()
  @Length(3, 15)
  name: string;
  /**
   * description input model {maxLength: 500}
   */
  @IsNotEmpty()
  @Length(5, 500)
  description: string;
  /**
   * websiteUrl input model {maxLength: 100}
   */
  @IsNotEmpty()
  @IsUrl()
  @Length(4, 100)
  websiteUrl: string;
}

export type BlogCreateDTO = {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  addedAt: Date;
  /**
   * True if user has not expired membership subscription to blog
   */
  isMembership: boolean;
  blogOwnerInfo: UserInfo | null;
};

export type BlogViewDTO = {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: string;
  /**
   * True if user has not expired membership subscription to blog
   */
  isMembership: boolean;
};

export type SABlogViewDTO = {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: string;
  isMembership: boolean;
  /**
   * True if user has not expired membership subscription to blog
   */
  blogOwnerInfo: UserInfo | null;
};
