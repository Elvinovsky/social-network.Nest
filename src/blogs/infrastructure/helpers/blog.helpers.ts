import {
  BlogCreateDTO,
  BlogInputModel,
  BlogViewDTO,
  SABlogViewDTO,
} from '../../dto/blog.models';
import { BlogDocument } from '../../entities/mongoose/blog-no-sql.schemas';
import { UserInfo } from '../../../users/dto/view/user-view.models';
import { v4 as uuidv4 } from 'uuid';

export const blogsMapping = (array: Array<BlogDocument>): BlogViewDTO[] => {
  return array.map((el) => {
    return {
      id: el.id,
      name: el.name,
      description: el.description,
      websiteUrl: el.websiteUrl,
      createdAt: el.addedAt.toISOString(),
      isMembership: el.isMembership,
    };
  });
};
export const blogMapping = (blog: BlogCreateDTO): BlogViewDTO => {
  return {
    id: blog.id,
    name: blog.name,
    description: blog.description,
    websiteUrl: blog.websiteUrl,
    createdAt: blog.addedAt.toISOString(),
    isMembership: blog.isMembership,
  };
};

export const blogsMapperSA = (
  blogArr: Array<BlogDocument>,
): SABlogViewDTO[] => {
  return blogArr.map((el) => {
    return {
      id: el.id,
      name: el.name,
      description: el.description,
      websiteUrl: el.websiteUrl,
      createdAt: el.addedAt.toISOString(),
      isMembership: el.isMembership,
      blogOwnerInfo: el.blogOwnerInfo,
    };
  });
};

class BlogCreator extends BlogCreateDTO {
  create(inputModel: BlogInputModel, blogOwnerInfo: UserInfo): BlogCreateDTO {
    const blog: BlogCreateDTO = new BlogCreator();
    blog.id = uuidv4();
    blog.name = inputModel.name;
    blog.description = inputModel.description;
    blog.websiteUrl = inputModel.websiteUrl;
    blog.addedAt = new Date();
    blog.isMembership = false;
    blog.blogOwnerInfo = blogOwnerInfo;
    return blog;
  }
  createSA(inputModel: BlogInputModel): BlogCreateDTO {
    const blog: BlogCreateDTO = new BlogCreator();
    blog.id = uuidv4();
    blog.name = inputModel.name;
    blog.description = inputModel.description;
    blog.websiteUrl = inputModel.websiteUrl;
    blog.addedAt = new Date();
    blog.isMembership = false;
    blog.blogOwnerInfo = null;
    return blog;
  }
}

export const blogCreator = new BlogCreator();
