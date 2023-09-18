import {
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
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
    sessionInfo: {
      userInfo: UserInfo;
      deviceId: string;
      issuedAt: number;
    },
  ) {
    // Получаем id пользователя из JwtRefreshGuard
    const userId = sessionInfo.userInfo.userId;
    console.log(userId);
    // Ищем устройства пользователя
    const devicesSessionsByUser =
      await this.devicesService.getDevicesSessionsByUserId(userId);
    console.log(userId);

    return devicesSessionsByUser;
  }

  @Delete('devices')
  @UseGuards(JwtRefreshGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteDevices(
    @CurrentSessionInfoFromRefreshJWT()
    sessionInfo: {
      userInfo: UserInfo;
      deviceId: string;
      issuedAt: number;
    },
  ) {
    const userId = sessionInfo.userInfo.userId; // Получаем id пользователя из запроса

    await this.devicesService.logoutDevicesSessionsForUser(
      sessionInfo.issuedAt,
      userId,
    ); // Выход из всех устройств пользователя кроме текущей
  }
  @Delete('devices/:deviceId')
  @UseGuards(JwtRefreshGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteDeviceById(
    @Param('deviceId') id: string,
    @CurrentSessionInfoFromRefreshJWT()
    sessionInfo: { userInfo: UserInfo; deviceId: string; issuedAt: number },
  ) {
    const userId = sessionInfo.userInfo.userId; // Получаем id пользователя из запроса

    // Выход из конкретного устройства пользователя
    const logoutDeviceSession =
      await this.devicesService.logoutDeviceSessionByDeviceId(id, userId);

    // Обработка различных сценариев удаления устройства
    if (logoutDeviceSession === null) {
      throw new NotFoundException();
    }
    if (!logoutDeviceSession) {
      throw new ForbiddenException(); // Ошибка: Запрещено (отказано в доступе).
    }
  }
}
