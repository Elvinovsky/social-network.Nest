import { BlogPostInputModel, PostCreateDTO } from '../../dto/post.models';
import { v4 as uuidv4 } from 'uuid';

class PostCreator {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  addedAt: Date;

  create(
    inputModel: BlogPostInputModel,
    blogName: string,
    blogId: string,
  ): PostCreateDTO {
    const post: PostCreateDTO = new PostCreator();
    post.id = uuidv4();
    post.blogId = blogId;
    post.title = inputModel.title;
    post.shortDescription = inputModel.shortDescription;
    post.content = inputModel.content;
    post.blogName = blogName;
    post.addedAt = new Date();

    return post;
  }
}

export const postCreator = new PostCreator();
