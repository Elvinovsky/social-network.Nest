import mongoose from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Device, DeviceDocument, DeviceModel } from './device.schemas';
import { DeviceViewDTO, SessionCreateDTO } from './device.models';
import { devicesMapper } from './device.helpers';
@Injectable()
export class DevicesRepository {
  constructor(@InjectModel(Device.name) private deviceModel: DeviceModel) {}
  async findDeviceSessionByIAT(issuedAt: number): Promise<boolean> {
    const deviceSession = await this.deviceModel.findOne({
      issuedAt: issuedAt,
    });
    return !!deviceSession;
  }
  async findDeviceIdAmongSessions(
    deviceID: string,
  ): Promise<DeviceDocument | null> {
    return this.deviceModel.findOne({ deviceId: deviceID });
  }

  // Метод для поиска всех устройств сессии по идентификатору пользователя
  async findDevicesSessionsByUserId(
    userId: string,
  ): Promise<DeviceViewDTO[] | null> {
    const devicesSessions = await this.deviceModel.find({ userId: userId });
    if (!devicesSessions) {
      return null; // Возвращаем null, если устройства не найдены.
    }
    return devicesMapper(devicesSessions); // Применяем функцию маппинга и возвращаем массив устройств.
  }
  async addDeviceSession(
    deviceSession: SessionCreateDTO,
  ): Promise<mongoose.Document> {
    return await this.deviceModel.create(deviceSession);
  }
  async updateDeviceSession(
    newIssuedAt: number,
    issuedAt: number,
  ): Promise<boolean> {
    const updateActiveDAte = new Date().toISOString();
    const result = await this.deviceModel.updateOne(
      { issuedAt: issuedAt },
      { $set: { issuedAt: newIssuedAt, lastActiveDate: updateActiveDAte } },
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
    const result = await this.deviceModel.deleteOne({
      userId: userId,
      deviceId: deviceId,
    });
    return result.deletedCount === 1;
  }

  // Метод для удаления всех сессий устройств пользователя, кроме определенной по времени создания (issuedAt)
  async deleteDevicesSessionsByUser(
    issuedAt: number,
    userId: string,
  ): Promise<boolean> {
    const result = await this.deviceModel.deleteMany({
      userId: userId,
      issuedAt: { $ne: issuedAt }, // исключаем документы с определенным значением issuedAt
      status: { $nin: ['closed', 'expired'] }, // исключаем документы со статусами 'closed' и 'expired'
    });
    return result.deletedCount === 1;
  }
}
