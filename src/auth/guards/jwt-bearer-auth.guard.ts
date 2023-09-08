import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { DevicesService } from '../../devices/devices.service';
import { UsersService } from '../../users/aplication/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigType } from '../../configuration/getConfiguration';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { UserInfo } from '../../users/user.models';

@Injectable()
export class JwtBearerGuard implements CanActivate {
  constructor(
    private devicesService: DevicesService,
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService<ConfigType>,
  ) {}

  /**
   *   1.Проверка наличия токена в заголовках запроса.
   *   2.Верификация и декодирование JWT-токена.
   *   3.Проверка, не заблокирован ли пользователь.
   *   4.Проверка активности сессии на устройстве.
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const accessToken = this.extractTokenFromHeaders(request);

    if (!accessToken) {
      // Если токен отсутствует в заголовках запроса, выбрасываем исключение UnauthorizedException.
      throw new UnauthorizedException();
    } else {
      // Пытаемся верифицировать и декодировать JWT-токен.
      const decodedToken = (await this.jwtService
        .verifyAsync(accessToken, {
          secret: this.configService.get('auth.SECRET_ACCESS_KEY', {
            infer: true,
          }),
        })
        .catch(() => {
          // Если верификация не удалась (например, токен истек или неверный секретный ключ), выбрасываем исключение UnauthorizedException.
          throw new UnauthorizedException();
        })) as {
        userInfo: UserInfo;
        deviceId: string;
      };

      if (!decodedToken) {
        // Если декодированный пейлоад отсутствует, выбрасываем исключение UnauthorizedException.
        throw new UnauthorizedException();
      }

      // Проверяем, заблокирован ли пользователь.
      const isUserBanned = await this.usersService.findUser(
        decodedToken.userInfo.userId,
      );

      // Проверяем, активна ли сессия на устройстве.
      const sessionActivateCheck =
        await this.devicesService.findSessionByDeviceId(decodedToken.deviceId);

      if (isUserBanned?.banInfo.isBanned || !sessionActivateCheck) {
        // Если пользователь заблокирован или сессия на устройстве не активна, выбрасываем исключение UnauthorizedException.
        throw new UnauthorizedException();
      }

      // Если все проверки пройдены успешно, устанавливаем в объекте запроса пользовательские данные для дальнейшего использования в контроллерах.
      request.user = {
        userInfo: decodedToken.userInfo,
        deviceId: decodedToken.deviceId,
      };
    }

    return true;
  }

  // Вспомогательная функция для извлечения JWT-токена из заголовков запроса.
  private extractTokenFromHeaders(request: Request) {
    const [tokenType, token] = request.headers.authorization?.split(' ') ?? [];
    return tokenType === 'Bearer' ? token : null;
  }
}
