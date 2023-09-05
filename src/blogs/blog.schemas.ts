import { HydratedDocument, Model } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { BlogCreateDTO, BlogInputModel } from './blog.models';
import { UserInfo } from '../users/user.models';

export type BlogDocument = HydratedDocument<Blog>;

export type BlogModel = Model<BlogDocument>;

@Schema()
export class Blog {
  @Prop({ required: true })
  name: string;
  @Prop({ required: true })
  description: string;
  @Prop({ required: true })
  websiteUrl: string;
  @Prop({ required: true })
  addedAt: string;
  @Prop({ required: true, default: false })
  isMembership: boolean;
  @Prop({ type: UserInfo, required: true })
  blogOwnerInfo: UserInfo;

  static createBlog(
    inputModel: BlogInputModel,
    blogOwnerInfo: UserInfo,
  ): BlogCreateDTO {
    const blog: Blog = new Blog();
    blog.name = inputModel.name;
    blog.description = inputModel.description;
    blog.websiteUrl = inputModel.websiteUrl;
    blog.addedAt = new Date().toISOString();
    blog.isMembership = false;
    blog.blogOwnerInfo = blogOwnerInfo;
    return blog;
  }
  static createBlogSA(inputModel: BlogInputModel): BlogCreateDTO {
    const blog: Blog = new Blog();
    blog.name = inputModel.name;
    blog.description = inputModel.description;
    blog.websiteUrl = inputModel.websiteUrl;
    blog.addedAt = new Date().toISOString();
    blog.isMembership = false;
    blog.blogOwnerInfo = { userId: 'userId', userLogin: 'SA' };
    return blog;
  }
  //todo
  unbindOwner(blog: BlogDocument) {
    if (blog.blogOwnerInfo.userId) {
      throw new Error('someone ');
    }
    blog.blogOwnerInfo.userId = '';
    blog.blogOwnerInfo.userLogin = '';
  }
  bindOwner(userInfo: UserInfo, blog: BlogDocument) {
    if (blog.blogOwnerInfo.userId) {
      throw new Error('action is not possible');
    }
    blog.blogOwnerInfo.userId = userInfo.userId;
    blog.blogOwnerInfo.userLogin = userInfo.userLogin;
  }
}

export const BlogSchema = SchemaFactory.createForClass(Blog);

BlogSchema.methods = {
  unbindOwner: Blog.prototype.unbindOwner,
  bindOwner: Blog.prototype.bindOwner,
};
