import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import add from 'date-fns/add';
import { SessionCreateDTO } from './device.models';
import { UserInfo } from '../users/user.models';

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

  static create(
    userInfo: UserInfo,
    deviceId: string,
    issuedAt: number,
    ip: string,
    deviceName: string,
  ): SessionCreateDTO {
    const newSession: Device = new Device();
    console.log('СЕССИЯ --->', issuedAt);

    newSession.userInfo = userInfo;
    newSession.deviceId = deviceId;
    newSession.issuedAt = issuedAt;
    newSession.ip = ip ?? 'ip';
    newSession.title = deviceName ?? 'deviceName';
    newSession.lastActiveDate = new Date();
    newSession.expirationDate = add(new Date(), {
      seconds: 20,
      //minutes:20
    });
    return newSession;
  }
}

export const DeviceSchema = SchemaFactory.createForClass(Device);
