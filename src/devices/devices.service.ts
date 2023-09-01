import { Injectable } from '@nestjs/common';
import { DevicesRepository } from './devices.repository';
import { SessionCreateDTO } from './device.models';
import { Device } from './device.schemas';
import { UserInfo } from '../users/user.models';
@Injectable()
export class DevicesService {
  constructor(protected devicesRepository: DevicesRepository) {}
  async findDevicesSessionsByUserId(userId: string) {
    return this.devicesRepository.findDevicesSessionsByUserId(userId);
  }

  async createDeviceSession(
    userInfo: UserInfo,
    deviceId: string,
    issuedAt: number,
    ip: string,
    deviceName: string,
  ) {
    const newDeviceSession: SessionCreateDTO = Device.create(
      userInfo,
      deviceId,
      issuedAt,
      ip,
      deviceName,
    );

    return await this.devicesRepository.addDeviceSession(newDeviceSession);
  }

  async updateIATByDeviceSession(newIssuedAt: number, issuedAt: number) {
    return await this.devicesRepository.updateDeviceSession(
      newIssuedAt,
      issuedAt,
    );
  }

  async logoutDeviceSessionByDeviceId(deviceId: string, userId: string) {
    const findDeviceSessionById = await this.findSessionByDeviceId(deviceId);
    if (!findDeviceSessionById) {
      return null;
    }
    return await this.devicesRepository.deleteDeviceSessionSpecified(
      deviceId,
      userId,
    );
  }

  /**
   * Выход из всех сессий устройств, кроме текущего для указанного пользователя.
   * @param issuedAt Время создания токена.
   * @param userId Идентификатор пользователя (строка).
   * @returns Промис с результатом удаления сессий устройств.
   */
  async logoutDevicesSessionsForUser(issuedAt: number, userId: string) {
    const result =
      await this.devicesRepository.deleteDevicesSessionsExceptCurrent(
        issuedAt,
        userId,
      );
    return result;
  }

  async LogoutAllDevicesAdminOrder(userId: string) {
    const result = await this.devicesRepository.deleteAllDevicesAdminOrder(
      userId,
    );
    return result;
  }

  async findDeviceSessionByIAT(issuedAt: number) {
    return this.devicesRepository.findDeviceSessionByIAT(issuedAt);
  }

  async logoutByIAT(issuedAt: number) {
    return this.devicesRepository.deleteDeviceSessionByIAT(issuedAt);
  }

  async findSessionByDeviceId(devicesId: string) {
    return this.devicesRepository.findDeviceIdAmongSession(devicesId);
  }
}
