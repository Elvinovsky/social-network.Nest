import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import add from 'date-fns/add';
import { SessionCreateDTO } from './device.models';

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
  ip: string;
  @Prop({ required: true })
  title: string;
  @Prop({ required: true })
  lastActiveDate: string;
  @Prop({ required: true })
  expirationDate: Date;

  static create(
    userId: string,
    deviceId: string,
    issuedAt: number,
    ip: string,
    deviceName: string,
  ): SessionCreateDTO {
    const newSession: Device = new Device();

    newSession.deviceId = deviceId;
    newSession.issuedAt = issuedAt;
    newSession.userId = userId;
    newSession.ip = ip ?? 'ip';
    newSession.title = deviceName ?? 'deviceName';
    newSession.lastActiveDate = new Date().toISOString();
    newSession.expirationDate = add(new Date(), {
      seconds: 20,
      //minutes:20
    });
    return newSession;
  }
}

export const DeviceSchema = SchemaFactory.createForClass(Device);
