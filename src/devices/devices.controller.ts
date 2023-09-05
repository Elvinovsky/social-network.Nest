import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Res,
  UseGuards,
} from '@nestjs/common';
import { DevicesService } from './devices.service';
import { JwtRefreshGuard } from '../auth/guards/jwt-refresh.guard';
import { CurrentSessionInfoFromRefreshJWT } from '../auth/decorators/current-session-info-from-cookie-jwt';
import { UserInfo } from '../users/user.models';

@Controller('security')
export class DevicesController {
  constructor(private devicesService: DevicesService) {}

  // Обработка запроса на получение устройств пользователя
  @Get('devices')
  @UseGuards(JwtRefreshGuard)
  async getDevices(
    @CurrentSessionInfoFromRefreshJWT()
    sessionInfo: { userInfo: UserInfo; deviceId: string; issuedAt: number },
    @Res() res,
  ) {
    // Получаем id пользователя из JwtRefreshGuard
    const userId = sessionInfo.userInfo.userId;

    // Ищем устройства пользователя
    const devicesSessionsByUser =
      await this.devicesService.findDevicesSessionsByUserId(userId);

    // Отправляем список устройств
    res.send(devicesSessionsByUser);
  }

  @Delete('devices')
  @UseGuards(JwtRefreshGuard)
  async deleteDevices(
    @CurrentSessionInfoFromRefreshJWT()
    sessionInfo: { userInfo: UserInfo; deviceId: string; issuedAt: number },
    @Res() res,
  ) {
    const userId = sessionInfo.userInfo.userId; // Получаем id пользователя из запроса

    await this.devicesService.logoutDevicesSessionsForUser(
      sessionInfo.issuedAt,
      userId,
    ); // Выход из всех устройств пользователя кроме текущей

    res.sendStatus(204); // Успешный статус: OK, без содержимого
    return;
  }
  @Delete('devices/:deviceId')
  @UseGuards(JwtRefreshGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteDeviceById(
    @Param('deviceId') id: string,
    @CurrentSessionInfoFromRefreshJWT()
    sessionInfo: { userInfo: UserInfo; deviceId: string; issuedAt: number },
    @Res() res,
  ) {
    const userId = sessionInfo.userInfo.userId; // Получаем id пользователя из запроса

    // Выход из конкретного устройства пользователя
    const logoutDeviceSession =
      await this.devicesService.logoutDeviceSessionByDeviceId(id, userId);

    // Обработка различных сценариев удаления устройства
    if (logoutDeviceSession === null) {
      res.sendStatus(404); // Ошибка: Не найдено.
      return;
    }
    if (!logoutDeviceSession) {
      res.sendStatus(403); // Ошибка: Запрещено (отказано в доступе).
      return;
    }
    res.sendStatus(204); // Успешный статус: OK, без содержимого.
    return;
  }
}
