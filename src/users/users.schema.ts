import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop()
  name: string;

  @Prop()
  childrenCount: number;

  setChildren(newChildrenCount: number) {
    if (newChildrenCount < 0) {
      throw new Error('bad value');
    }
    this.childrenCount = newChildrenCount;
  }
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.methods = {
  setChildren: User.prototype.setChildren,
};
