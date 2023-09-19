import {
  IsMongoId,
  IsNotEmpty,
  Length,
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { ExtendedLikesViewDTO } from '../likes/like.models';
import { Injectable } from '@nestjs/common';
import { BlogsRepository } from '../blogs/infrastructure/repositories/blogs.repository';

@Injectable()
@ValidatorConstraint({ name: 'BlogExists', async: true })
export class BlogIdExistenceCheck implements ValidatorConstraintInterface {
  constructor(private blogsRepository: BlogsRepository) {}
  async validate(id: string, args: ValidationArguments) {
    const blog = await this.blogsRepository.findBlogById(id);
    return !!blog;
  }
  defaultMessage(args: ValidationArguments) {
    return 'Blog with given id does not exist';
  }
}

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
  @IsMongoId()
  @Validate(BlogIdExistenceCheck)
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
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  addedAt: Date;
};

export type PostViewDTO = {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: string;
  extendedLikesInfo: ExtendedLikesViewDTO;
};
