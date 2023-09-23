import { HydratedDocument, Model } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { BlogCreateDTO, BlogInputModel } from './blog.models';
import { UserInfo } from '../users/user.models';
import { v4 as uuidv4 } from 'uuid';

export type BlogDocument = HydratedDocument<Blog>;

export type BlogModel = Model<BlogDocument>;

@Schema()
export class Blog {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  websiteUrl: string;

  @Prop({ required: true })
  addedAt: Date;

  @Prop({ required: true, default: false })
  isMembership: boolean;

  @Prop({ type: UserInfo || null })
  blogOwnerInfo: UserInfo | null;

  static createBlog(
    inputModel: BlogInputModel,
    blogOwnerInfo: UserInfo,
  ): BlogCreateDTO {
    const blog: Blog = new Blog();
    blog.id = uuidv4();
    blog.name = inputModel.name;
    blog.description = inputModel.description;
    blog.websiteUrl = inputModel.websiteUrl;
    blog.addedAt = new Date();
    blog.isMembership = false;
    blog.blogOwnerInfo = blogOwnerInfo;
    return blog;
  }
  static createBlogSA(inputModel: BlogInputModel): BlogCreateDTO {
    const blog: Blog = new Blog();
    blog.id = uuidv4();
    blog.name = inputModel.name;
    blog.description = inputModel.description;
    blog.websiteUrl = inputModel.websiteUrl;
    blog.addedAt = new Date();
    blog.isMembership = false;
    blog.blogOwnerInfo = null;
    return blog;
  }
  //todo
  unbindOwner(blog: BlogDocument) {
    if (!blog.blogOwnerInfo?.userId) {
      throw new Error('something went wrong');
    }
    blog.blogOwnerInfo = null;
  }
  bindOwner(userInfo: UserInfo, blog: BlogDocument) {
    if (blog.blogOwnerInfo?.userId) {
      throw new Error('action is not possible');
    }
    blog.blogOwnerInfo = userInfo;
  }
}

export const BlogSchema = SchemaFactory.createForClass(Blog);

BlogSchema.methods = {
  unbindOwner: Blog.prototype.unbindOwner,
  bindOwner: Blog.prototype.bindOwner,
};
