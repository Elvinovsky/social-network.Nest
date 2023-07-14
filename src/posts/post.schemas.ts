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
  static createPost(
    inputModel: PostInputModel | BlogPostInputModel,
    blogName: string,
    blogId?: string,
  ): PostCreateDTO {
    const post: Post = new Post();

    if (blogId) {
      post.blogId = blogId;
    }

    if (!(inputModel instanceof BlogPostInputModel)) {
      post.blogId = inputModel.blogId;
    }

    post.title = inputModel.title;
    post.shortDescription = inputModel.shortDescription;
    post.content = inputModel.content;
    post.blogName = blogName;
    post.addedAt = new Date().toISOString();

    return post;
  }
}

export const PostSchema = SchemaFactory.createForClass(Post);

export type LikeDocument = HydratedDocument<Like>;

export type LikeModel = Model<LikeDocument>;
@Schema()
export class Like {
  @Prop({ required: true })
  status: string;
  @Prop({ required: true })
  userId: string;
  @Prop({ required: true })
  userLogin: string;
  @Prop({ required: true })
  postOrCommentId: string;
  @Prop({ required: true })
  createdAt: Date;
}

export const LikeSchema = SchemaFactory.createForClass(Like);
