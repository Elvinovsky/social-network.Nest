import { DeviceDocument } from './device.schemas';
import { DeviceViewDTO } from './device.models';

export const devicesMapper = (
  array: Array<DeviceDocument>,
): DeviceViewDTO[] => {
  return array.map((el) => {
    return {
      ip: el.ip ? el.ip : 'ip',
      title: el.title ? el.title : 'Device Name',
      lastActiveDate: el.lastActiveDate,
      deviceId: el.deviceId,
    };
  });
};
