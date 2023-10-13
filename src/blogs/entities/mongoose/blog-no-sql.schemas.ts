import { HydratedDocument, Model } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { UserInfo } from '../../../users/dto/view/user-view.models';

export type BlogDocument = HydratedDocument<BlogMongooseEntity>;

export type BlogModel = Model<BlogDocument>;

@Schema()
export class BlogMongooseEntity {
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

export const BlogSchema = SchemaFactory.createForClass(BlogMongooseEntity);

BlogSchema.methods = {
  unbindOwner: BlogMongooseEntity.prototype.unbindOwner,
  bindOwner: BlogMongooseEntity.prototype.bindOwner,
};
