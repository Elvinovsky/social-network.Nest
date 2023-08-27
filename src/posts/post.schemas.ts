import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import {
  BlogPostInputModel,
  PostCreateDTO,
  PostInputModel,
} from './post.models';

export type PostDocument = HydratedDocument<Post>;

export type PostModel = Model<PostDocument>;
@Schema()
export class Post {
  @Prop({ required: true })
  title: string;
  @Prop({ required: true })
  shortDescription: string;
  @Prop({ required: true })
  content: string;
  @Prop({ required: true })
  blogId: string;
  @Prop({ required: true })
  blogName: string;
  @Prop({ required: true })
  addedAt: string;
  static create(
    inputModel: BlogPostInputModel,
    blogName: string,
    blogId: string,
  ): PostCreateDTO {
    const post: Post = new Post();

    post.blogId = blogId;
    post.title = inputModel.title;
    post.shortDescription = inputModel.shortDescription;
    post.content = inputModel.content;
    post.blogName = blogName;
    post.addedAt = new Date().toISOString();

    return post;
  }
}

export const PostSchema = SchemaFactory.createForClass(Post);
