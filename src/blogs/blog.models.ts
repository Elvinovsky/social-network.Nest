import { IsMongoId, IsNotEmpty, IsUrl, Length } from 'class-validator';

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
  name: string;
  description: string;
  websiteUrl: string;
  addedAt: string;
  /**
   * True if user has not expired membership subscription to blog
   */
  isMembership: boolean;
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
export class ParamObjectId {
  @IsMongoId()
  id: string;
}
