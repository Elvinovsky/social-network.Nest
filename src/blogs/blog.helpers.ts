import { BlogCreateDTO, BlogViewDTO, SABlogViewDTO } from './blog.models';
import { BlogDocument } from './blog.schemas';

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
