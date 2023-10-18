import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { UserInfo } from '../../../users/dto/view/user-view.models';

export type DeviceDocument = HydratedDocument<Device>;

export type DeviceModel = Model<DeviceDocument>;
@Schema()
export class Device {
  @Prop({ type: UserInfo, required: true })
  userInfo: UserInfo;
  @Prop({ required: true })
  deviceId: string;
  @Prop({ required: true })
  issuedAt: number;
  @Prop({ required: true })
  ip: string;
  @Prop({ required: true })
  title: string;
  @Prop({ required: true })
  lastActiveDate: Date;
  @Prop({ required: true })
  expirationDate: Date;
}

export const DeviceSchema = SchemaFactory.createForClass(Device);
