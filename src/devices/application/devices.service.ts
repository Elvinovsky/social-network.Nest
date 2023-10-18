import { Injectable } from '@nestjs/common';
import { SessionCreateDTO } from '../dto/device.models';
import { UserInfo } from '../../users/dto/view/user-view.models';
import { deviceCreator } from '../infrastructure/helpers/device.helpers';
import { IDeviceRepository } from '../../infrastructure/repositoriesModule/repositories.module';
@Injectable()
export class DevicesService {
  constructor(protected devicesRepository: IDeviceRepository) {}

  async getDevicesSessionsByUserId(userId: string) {
    return this.devicesRepository.getDevicesSessionsByUserId(userId);
  }

  async createDeviceSession(
    userInfo: UserInfo,
    deviceId: string,
    issuedAt: number,
    ip: string | null,
    deviceName: string,
  ) {
    const newDeviceSession: SessionCreateDTO = deviceCreator.create(
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
    console.log('logoutSessions', result);
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
    return this.devicesRepository.findDeviceIdAmongSessions(devicesId);
  }
}
