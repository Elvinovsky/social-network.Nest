import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { BlogPostInputModel, PostCreateDTO } from '../../dto/post.models';
import { v4 as uuidv4 } from 'uuid';

export type PostDocument = HydratedDocument<PostMongooseEntity>;
export type PostModel = Model<PostDocument>;
@Schema()
export class PostMongooseEntity {
  @Prop({ required: true })
  id: string;

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
  addedAt: Date;
  static create(
    inputModel: BlogPostInputModel,
    blogName: string,
    blogId: string,
  ): PostCreateDTO {
    const post: PostMongooseEntity = new PostMongooseEntity();
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

export const PostSchema = SchemaFactory.createForClass(PostMongooseEntity);
