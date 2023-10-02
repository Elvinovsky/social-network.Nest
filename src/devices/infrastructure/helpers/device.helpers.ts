import { DeviceDocument } from '../../entities/mongoose/device-no-sql.schemas';
import { DeviceViewDTO, SessionCreateDTO } from '../../dto/device.models';
import { UserInfo } from '../../../users/dto/view/user-view.models';
import add from 'date-fns/add';

export const devicesMapper = (
  array: Array<DeviceDocument>,
): DeviceViewDTO[] => {
  return array.map((el) => {
    return {
      ip: el.ip,
      title: el.title,
      lastActiveDate: el.lastActiveDate.toISOString(),
      deviceId: el.deviceId,
    };
  });
};

class DeviceCreator {
  userInfo: UserInfo;
  deviceId: string;
  issuedAt: number;
  ip: string | null;
  title: string | null;
  lastActiveDate: Date;
  expirationDate: Date;
  create(
    userInfo: UserInfo,
    deviceId: string,
    issuedAt: number,
    ip: string,
    deviceName: string,
  ): SessionCreateDTO {
    const newSession: SessionCreateDTO = new DeviceCreator();

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

export const deviceCreator = new DeviceCreator();
