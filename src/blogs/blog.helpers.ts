import { BlogViewDTO } from './blog.models';
import { BlogDocument } from './blog.schemas';

export const blogsMapping = (array: Array<BlogDocument>): BlogViewDTO[] => {
  return array.map((el) => {
    return {
      id: el._id.toString(),
      name: el.name,
      description: el.description,
      websiteUrl: el.websiteUrl,
      createdAt: el.addedAt,
      isMembership: el.isMembership,
    };
  });
};
export const blogMapping = (blog: BlogDocument): BlogViewDTO => {
  return {
    id: blog._id.toString(),
    name: blog.name,
    description: blog.description,
    websiteUrl: blog.websiteUrl,
    createdAt: blog.addedAt,
    isMembership: blog.isMembership,
  };
};
