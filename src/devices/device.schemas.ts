import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';

export type DeviceDocument = HydratedDocument<Device>;

export type DeviceModel = Model<DeviceDocument>;
@Schema()
export class Device {
  @Prop({ required: true })
  deviceId: string;
  @Prop({ required: true })
  issuedAt: number;
  @Prop({ required: true })
  userId: string;
  @Prop({ required: true })
  ip: string | null;
  @Prop({ required: true })
  title: string | null;
  @Prop({ required: true })
  lastActiveDate: string;
  @Prop({ required: true })
  expirationDate: Date;
}

export const DeviceSchema = SchemaFactory.createForClass(Device);
