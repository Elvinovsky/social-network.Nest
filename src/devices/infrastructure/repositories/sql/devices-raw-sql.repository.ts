import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { DeviceViewDTO, SessionCreateDTO } from '../../../dto/device.models';

@Injectable()
export class DevicesRawSqlRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async findDeviceSessionByIAT(issuedAt: number): Promise<boolean> {
    const deviceSession = await this.dataSource.query(
      `
    SELECT d.*
    FROM "devices"."sessions" d
    WHERE d."issuedAt" = $1`,
      [issuedAt],
    );
    console.log('SessionByIAT', deviceSession);
    return deviceSession.length === 1;
  }
  async findDeviceIdAmongSessions(deviceId: string): Promise<boolean> {
    const deviceSession = await this.dataSource.query(
      `
    SELECT d."id"
    FROM "devices"."sessions" d
    WHERE d."id" = $1`,
      [deviceId],
    );
    return deviceSession.length === 1;
  }

  // Метод для поиска всех устройств сессии по идентификатору пользователя
  async getDevicesSessionsByUserId(
    userId: string,
  ): Promise<DeviceViewDTO[] | null> {
    const devicesSessions = await this.dataSource.query(
      `
    SELECT d."ip", d."title", d."lastActiveDate", d."id"
    FROM "devices"."sessions" d
    WHERE d."userId" = $1
    `,
      [userId],
    );
    if (devicesSessions.length < 1) {
      return null; // Возвращаем null, если устройства не найдены.
    }

    return devicesSessions.map((el) => {
      return {
        deviceId: el.id,
        ip: el.ip,
        title: el.title,
        lastActiveDate: el.lastActiveDate.toISOString(),
      };
    }); //  возвращаем массив устройств.
  }
  async addDeviceSession(deviceSession: SessionCreateDTO): Promise<void> {
    const insertSession = await this.dataSource.query(
      `
    INSERT INTO "devices"."sessions" (
           "id", "userId", "title", "issuedAt", "ip", "lastActiveDate", "expirationDate")
    VALUES ($1, $2, $3, $4, $5, $6, $7);
    `,
      [
        deviceSession.deviceId,
        deviceSession.userInfo.userId,
        deviceSession.title,
        deviceSession.issuedAt,
        deviceSession.ip,
        deviceSession.lastActiveDate,
        deviceSession.expirationDate,
      ],
    );
  }
  async updateDeviceSession(
    newIssuedAt: number,
    issuedAt: number,
  ): Promise<boolean> {
    const updateActiveDate = new Date();
    const result = await this.dataSource.query(
      `
      UPDATE "devices"."sessions"
      SET "issuedAt" = $1, "lastActiveDate" = $3
      WHERE "issuedAt" = $2
     `,
      [newIssuedAt, issuedAt, updateActiveDate],
    );
    console.log(result);
    return result[1] === 1;
  }
  async deleteDeviceSessionByIAT(issuedAt: number): Promise<boolean> {
    const result = await this.dataSource.query(
      `
    DELETE FROM "devices"."sessions"
    WHERE "issuedAt" = $1`,
      [issuedAt],
    );
    return result[1] === 1;
  }
  async deleteDeviceSessionSpecified(
    deviceId: string,
    userId: string,
  ): Promise<boolean> {
    const result = await this.dataSource.query(
      `
    DELETE FROM "devices"."sessions"
     WHERE "id" = $1 and "userId" = $2`,
      [deviceId, userId],
    );
    return result[1] === 1;
  }

  // Метод для удаления всех сессий устройств пользователя, кроме определенной по времени создания (issuedAt)
  async deleteDevicesSessionsExceptCurrent(
    issuedAt: number,
    userId: string,
  ): Promise<boolean> {
    const result = await this.dataSource.query(
      `
    DELETE FROM "devices"."sessions"
    WHERE "issuedAt" <> $1 and "userId" = $2
    `,
      [issuedAt, userId],
    );
    return result[1] >= 1;
  }
  async deleteAllDevicesAdminOrder(userId: string): Promise<number> {
    const result = await this.dataSource.query(
      `
    DELETE FROM  "devices"."sessions"
    WHERE "userId" = $1`,
      [userId],
    );
    return result[1];
  }
}
