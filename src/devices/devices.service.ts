import add from 'date-fns/add';
import { Injectable } from '@nestjs/common';
import { DevicesRepository } from './devices.repository';
import { SessionCreateDTO } from './device.models';
@Injectable()
export class DevicesService {
  constructor(protected devicesRepository: DevicesRepository) {}
  async findDevicesSessionsByUserId(userId: string) {
    return this.devicesRepository.findDevicesSessionsByUserId(userId);
  }

  async createDeviceSession(
    userId: string,
    deviceId: string,
    issuedAt: number,
    ip: string | null,
    deviceName?: string,
  ) {
    const createDeviceSession: SessionCreateDTO = {
      deviceId: deviceId,
      issuedAt: issuedAt,
      userId: userId,
      ip: ip || null,
      title: deviceName || null,
      lastActiveDate: new Date().toISOString(),
      expirationDate: add(new Date(), {
        seconds: 20,
        //minutes:20
      }),
    };
    return await this.devicesRepository.addDeviceSession(createDeviceSession);
  }

  async updateIATByDeviceSession(newIssuedAt: number, issuedAt: number) {
    return await this.devicesRepository.updateDeviceSession(
      newIssuedAt,
      issuedAt,
    );
  }

  async logoutDeviceSessionByDeviceId(deviceId: string, userId: string) {
    const findDeviceSessionById =
      await this.devicesRepository.findDeviceIdAmongSessions(deviceId);
    if (!findDeviceSessionById) {
      return null;
    }
    return await this.devicesRepository.deleteDeviceSessionSpecified(
      deviceId,
      userId,
    );
  }

  async logoutDevicesSessionsByUser(issuedAt: number, userId: string) {
    const result = await this.devicesRepository.deleteDevicesSessionsByUser(
      issuedAt,
      userId,
    );
    return result;
  }

  async findDeviceSessionByIAT(issuedAt: number) {
    return this.devicesRepository.findDeviceSessionByIAT(issuedAt);
  }
}
