import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { DevicesService } from '../../devices/devices.service';
import { UsersService } from '../../users/application/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ConfigType } from '../../configuration/getConfiguration';
import { UserInfo } from '../../users/user.models';

@Injectable()
export class JwtRefreshGuard implements CanActivate {
  constructor(
    private devicesService: DevicesService,
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService<ConfigType>,
  ) {}

  /**
   * Проверяет, можно ли разрешить доступ к защищенному ресурсу на основе токена обновления.
   *
   * @param context ExecutionContext для доступа к запросу
   * @returns Возвращает true, если доступ разрешен, в противном случае бросает исключение UnauthorizedException
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const refreshToken = await this.extractTokenFromCookie(request);

    if (!refreshToken) {
      throw new UnauthorizedException();
    }

    const payload = this.verifyRefreshToken(refreshToken);

    await this.verifyDeviceSession(payload.iat);
    await this.verifyUser(payload.userInfo.userId);

    // Если все проверки пройдены, то добавляем информацию о пользователе в запрос
    request.user = {
      userInfo: payload.userInfo,
      deviceId: payload.deviceId,
      issuedAt: payload.iat,
    };

    return true;
  }

  /**
   * Извлекает токен обновления из куки запроса.
   *
   * @param request Объект запроса Express
   * @returns Токен обновления или null, если токен не найден
   */
  private async extractTokenFromCookie(
    request: Request,
  ): Promise<string | null> {
    const refreshToken: string = request.cookies['refreshToken'];
    return refreshToken || null;
  }

  /**
   * Проверяет и верифицирует токен обновления.
   *
   * @param refreshToken Токен обновления для верификации
   * @returns Расшифрованный пейлоад токена обновления
   * @throws UnauthorizedException, если токен не может быть верифицирован
   */
  private verifyRefreshToken(refreshToken: string): {
    userInfo: UserInfo;
    deviceId: string;
    iat: number;
  } {
    try {
      return this.jwtService.verify(refreshToken, {
        secret: this.configService.get('auth.SECRET_REFRESH_KEY', {
          infer: true,
        }),
      }) as { userInfo: UserInfo; deviceId: string; iat: number };
    } catch {
      throw new UnauthorizedException();
    }
  }

  /**
   * Проверяет сессию устройства на основе времени выдачи (iat) из токена.
   *
   * @param iat Время выдачи токена
   * @throws UnauthorizedException, если сессия устройства не найдена
   */
  private async verifyDeviceSession(iat: number): Promise<void> {
    const checkDeviceSession = await this.devicesService.findDeviceSessionByIAT(
      iat,
    );
    if (!checkDeviceSession) {
      throw new UnauthorizedException();
    }
  }

  /**
   * Проверяет пользователя и его статус блокировки.
   *
   * @param userId Идентификатор пользователя
   * @throws UnauthorizedException, если пользователь не найден или заблокирован
   */
  private async verifyUser(userId: string): Promise<void> {
    const userDB = await this.usersService.findUser(userId);
    if (!userDB || userDB.banInfo.isBanned) {
      throw new UnauthorizedException('User not found or blocked.');
    }
  }
}
