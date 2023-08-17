import { PipeTransform, Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { BlogsRepository } from '../../blogs/blogs.repository';
import { PostInputModel } from '../../posts/post.models';

@Injectable()
export class TrimPipe implements PipeTransform {
  transform(value: any) {
    if (typeof value !== 'object') {
      return value;
    }
    Object.keys(value).forEach((el) => {
      return (value[el] =
        typeof value[el] === 'string' ? value[el].trim() : value[el]);
    });
    return value;
  }
}

@Injectable()
export class ObjectIdPipe implements PipeTransform {
  transform(value: string): string | false {
    if (typeof value === 'string' && Types.ObjectId.isValid(value)) {
      return value;
    }
    return false;
  }
}

@Injectable()
export class BlogIdPipe implements PipeTransform {
  constructor(private blogsRepository: BlogsRepository) {}
  async transform(inputModel: PostInputModel) {
    const validationBlogId = await this.blogsRepository.findBlogById(
      inputModel.blogId,
    );
    if (!validationBlogId) {
      return false;
    }
    return inputModel;
  }
}
