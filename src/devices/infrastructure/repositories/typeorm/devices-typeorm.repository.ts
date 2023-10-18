import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeviceViewDTO, SessionCreateDTO } from '../../../dto/device.models';
import { DeviceTypeOrmEntity } from '../../../entities/typeorm/device-sql.schemas';
import { devicesMapper } from '../../helpers/device.helpers';
import { IDeviceRepository } from '../../../../infrastructure/repositoriesModule/repositories.module';

@Injectable()
export class DevicesTypeormRepository implements IDeviceRepository {
  constructor(
    @InjectRepository(DeviceTypeOrmEntity)
    protected devicesRepo: Repository<DeviceTypeOrmEntity>,
  ) {}

  async findDeviceSessionByIAT(iat: number): Promise<boolean> {
    const deviceSession = await this.devicesRepo.findOneBy({
      issuedAt: iat,
    });
    return !!deviceSession;
  }
  async findDeviceIdAmongSessions(id: string): Promise<boolean> {
    const deviceSession = await this.devicesRepo.findOneBy({ deviceId: id });
    console.log(deviceSession);
    return !!deviceSession;
  }

  // Метод для поиска всех устройств сессии по идентификатору пользователя
  async getDevicesSessionsByUserId(
    userId: string,
  ): Promise<DeviceViewDTO[] | null> {
    try {
      const devicesSessions = await this.devicesRepo.find({
        where: { userId: userId },
      });

      if (devicesSessions.length < 1) {
        return null; // Возвращаем null, если устройства не найдены.
      }

      return devicesMapper(devicesSessions); //  возвращаем массив устройств.}
    } catch (e) {
      console.log(e);
      throw new Error();
    }
  }
  async addDeviceSession(deviceSession: SessionCreateDTO): Promise<void> {
    const session = this.devicesRepo.create({
      deviceId: deviceSession.deviceId,
      userId: deviceSession.userInfo.userId,
      title: deviceSession.title,
      issuedAt: Number(deviceSession.issuedAt),
      ip: deviceSession.ip,
      lastActiveDate: deviceSession.lastActiveDate,
      expirationDate: deviceSession.expirationDate,
    });
    await this.devicesRepo.save(session);
  }
  async updateDeviceSession(
    newIssuedAt: number,
    issuedAt: number,
  ): Promise<boolean> {
    const updateActiveDate = new Date();
    const result = await this.devicesRepo.update(
      { issuedAt: issuedAt },
      { issuedAt: newIssuedAt, lastActiveDate: updateActiveDate },
    );

    return result?.affected === 1;
  }
  async deleteDeviceSessionByIAT(issuedAt: number): Promise<boolean> {
    const result = await this.devicesRepo.delete({ issuedAt: issuedAt });
    return result?.affected === 1;
  }
  async deleteDeviceSessionSpecified(
    deviceId: string,
    userId: string,
  ): Promise<boolean> {
    const result = await this.devicesRepo.delete({
      deviceId: deviceId,
      userId: userId,
    });
    return result?.affected === 1;
  }

  // Метод для удаления всех сессий устройств пользователя, кроме определенной по времени создания (issuedAt)
  async deleteDevicesSessionsExceptCurrent(
    issuedAt: number,
    userId: string,
  ): Promise<boolean> {
    try {
      const result = await this.devicesRepo
        .createQueryBuilder()
        .delete()
        .where(` userId= :userId`, { userId: userId })
        .andWhere('issuedAt <> :issuedAt', { issuedAt: issuedAt })
        .execute();

      return !!result?.affected;
    } catch (e) {
      console.log(e);
      throw new Error();
    }
  }
  async deleteAllDevicesAdminOrder(userId: string): Promise<number> {
    const result = await this.devicesRepo.delete({ userId: userId });
    return result.affected ? result.affected : 0;
  }
}
