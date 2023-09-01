import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from '../application/auth.service';
import { DevicesService } from '../../devices/devices.service';
import { UsersService } from '../../users/aplication/users.service';
@Injectable()
export class JwtRefreshGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private devicesService: DevicesService,
    private usersService: UsersService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const refreshToken = await this.extractTokenFromCookie(request);
    if (!refreshToken) throw new UnauthorizedException();

    const issuedAt = await this.authService.getIATByRefreshToken(refreshToken);

    const deviceId = await this.authService.getDeviceIdRefreshToken(
      refreshToken,
    );
    if (!deviceId) {
      throw new UnauthorizedException();
    }

    const checkDeviceSession = await this.devicesService.findDeviceSessionByIAT(
      issuedAt,
    );
    if (!checkDeviceSession) {
      throw new UnauthorizedException();
    }

    const userId = await this.authService.getUserIdByRefreshToken(refreshToken);

    if (!userId) {
      throw new UnauthorizedException();
    }

    const userDB = await this.usersService.findUser(userId);
    if (!userDB || userDB.banInfo.isBanned) {
      throw new UnauthorizedException();
    }

    request.userId = userId;
    request.issuedAt = issuedAt;
    request.deviceId = deviceId;
    return true;
  }

  async extractTokenFromCookie(request: Request) {
    const refreshToken: string = request.cookies['refreshToken'];
    return refreshToken ? refreshToken : null;
  }
}
