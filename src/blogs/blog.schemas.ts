import { HydratedDocument, Model } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { BlogCreateDTO, BlogInputModel, BlogViewDTO } from './blog.models';

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
  static create(inputModel: BlogInputModel): BlogCreateDTO {
    const blog: Blog = new Blog();
    blog.name = inputModel.name;
    blog.description = inputModel.description;
    blog.websiteUrl = inputModel.websiteUrl;
    blog.addedAt = new Date().toISOString();
    blog.isMembership = false;

    return blog;
  }
}

@Schema()
export class BlogView {
  @Prop({ required: true })
  name: string;
  @Prop({ required: true })
  description: string;
  @Prop({ required: true })
  websiteUrl: string;
  @Prop({ required: true })
  id: string;
  @Prop({ required: true })
  createdAt: string;
  @Prop({ required: true })
  isMembership: boolean;
  static map(inputModel: BlogDocument): BlogViewDTO {
    const blog: BlogViewDTO = new BlogView();
    blog.id = inputModel._id.toString();
    blog.name = inputModel.name;
    blog.description = inputModel.description;
    blog.websiteUrl = inputModel.websiteUrl;
    blog.createdAt = inputModel.addedAt;
    blog.isMembership = inputModel.isMembership;
    return blog;
  }
}

export const BlogSchema = SchemaFactory.createForClass(Blog);
