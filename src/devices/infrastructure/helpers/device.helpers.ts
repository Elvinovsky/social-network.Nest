import { DeviceDocument } from '../../entities/device.schemas';
import { DeviceViewDTO } from '../../dto/device.models';

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
