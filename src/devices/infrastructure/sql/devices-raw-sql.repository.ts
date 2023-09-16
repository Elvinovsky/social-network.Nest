import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { DeviceViewDTO, SessionCreateDTO } from '../../device.models';

@Injectable()
export class DevicesRawSqlRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async findDeviceSessionByIAT(issuedAt: number): Promise<boolean> {
    const deviceSession = await this.dataSource.query(
      `
    SELECT "issuedAt"
    FROM "devices"."sessions"
    WHERE "issuedAt" = $1`,
      [issuedAt],
    );
    return deviceSession.length === 1;
  }
  async findDeviceIdAmongSessions(deviceId: string): Promise<boolean> {
    const deviceSession = await this.dataSource.query(
      `
    SELECT "id"
    FROM "devices"."sessions"
    WHERE "id" = $1`,
      [deviceId],
    );
    return deviceSession.length === 1;
  }

  // Метод для поиска всех устройств сессии по идентификатору пользователя
  async findDevicesSessionsByUserId(
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
        ip: el.ip,
        title: el.title,
        lastActiveDate: el.lastActiveDate.toISOString(),
        deviceId: el.deviceId,
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
  ): Promise<void> {
    const updateActiveDate = new Date();
    const result = await this.dataSource.query(
      `
      UPDATE "devices"."sessions"
      SET "issuedAt" = $1, "lastActiveDate" = $3
      WHERE "issuedAt" = $2
     `,
      [newIssuedAt, issuedAt, updateActiveDate],
    );
  }
  async deleteDeviceSessionByIAT(issuedAt: number): Promise<void> {
    const result = await this.dataSource.query(
      `
    DELETE FROM "devices"."sessions"
    WHERE "issuedAt" = $1`,
      [issuedAt],
    );
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
    return result[0].length === 1;
  }

  // Метод для удаления всех сессий устройств пользователя, кроме определенной по времени создания (issuedAt)
  async deleteDevicesSessionsExceptCurrent(
    issuedAt: number,
    userId: string,
  ): Promise<void> {
    const result = await this.dataSource.query(
      `
    DELETE FROM "devices"."sessions"
    WHERE "issuedAt" <> $1 and "userId" = $2
    `,
      [issuedAt, userId],
    );
  }
  async deleteAllDevicesAdminOrder(userId: string): Promise<number> {
    const result = await this.dataSource.query(
      `
    DELETE FROM  "devices"."sessions"
    WHERE "userId" = $1`,
      [userId],
    );
    return result[0].length;
  }
}
