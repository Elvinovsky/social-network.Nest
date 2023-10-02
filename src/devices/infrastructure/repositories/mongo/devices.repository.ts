import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Device,
  DeviceModel,
} from '../../../entities/mongoose/device-no-sql.schemas';
import { DeviceViewDTO, SessionCreateDTO } from '../../../dto/device.models';
import { devicesMapper } from '../../helpers/device.helpers';
@Injectable()
export class DevicesRepository {
  constructor(@InjectModel(Device.name) private deviceModel: DeviceModel) {}
  async findDeviceSessionByIAT(issuedAt: number): Promise<boolean> {
    const deviceSession = await this.deviceModel.findOne({
      issuedAt: issuedAt,
    });
    return !!deviceSession;
  }
  async findDeviceIdAmongSessions(deviceId: string): Promise<boolean> {
    const session = await this.deviceModel
      .findOne({ deviceId: deviceId })
      .exec();
    return !!session;
  }

  // Метод для поиска всех устройств сессии по идентификатору пользователя
  async getDevicesSessionsByUserId(
    userId: string,
  ): Promise<DeviceViewDTO[] | null> {
    const devicesSessions = await this.deviceModel.find({
      'userInfo.userId': userId,
    });
    if (!devicesSessions) {
      return null; // Возвращаем null, если устройства не найдены.
    }
    return devicesMapper(devicesSessions); // Применяем функцию маппинга и возвращаем массив устройств.
  }
  async addDeviceSession(deviceSession: SessionCreateDTO): Promise<void> {
    await this.deviceModel.create(deviceSession);
  }
  async updateDeviceSession(
    newIssuedAt: number,
    issuedAt: number,
  ): Promise<boolean> {
    const updateActiveDate = new Date();
    const result = await this.deviceModel.updateOne(
      { issuedAt: issuedAt },
      { $set: { issuedAt: newIssuedAt, lastActiveDate: updateActiveDate } },
    );
    return result.matchedCount === 1;
  }
  async deleteDeviceSessionByIAT(issuedAt: number): Promise<boolean> {
    const result = await this.deviceModel.deleteOne({ issuedAt: issuedAt });
    return result.deletedCount === 1;
  }
  async deleteDeviceSessionSpecified(
    deviceId: string,
    userId: string,
  ): Promise<boolean> {
    const result = await this.deviceModel
      .deleteOne({
        'userInfo.userId': userId,
        deviceId: deviceId,
      })
      .exec();
    return result.deletedCount === 1;
  }

  // Метод для удаления всех сессий устройств пользователя, кроме определенной по времени создания (issuedAt)
  async deleteDevicesSessionsExceptCurrent(
    issuedAt: number,
    userId: string,
  ): Promise<boolean> {
    const result = await this.deviceModel.deleteMany({
      'userInfo.userId': userId,
      issuedAt: { $ne: issuedAt }, // исключаем документы с определенным значением issuedAt
      status: { $nin: ['closed', 'expired'] }, // исключаем документы со статусами 'closed' и 'expired'
    });
    return result.deletedCount > 1;
  }
  async deleteAllDevicesAdminOrder(userId: string): Promise<number> {
    const result = await this.deviceModel
      .deleteMany({ 'userInfo.userId': userId })
      .exec();
    return result.deletedCount;
  }
}
