import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { DevicesService } from '../../devices/devices.service';
import { UsersService } from '../../users/aplication/users.service';
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
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const refreshToken = await this.extractTokenFromCookie(request);
    if (!refreshToken) {
      throw new UnauthorizedException();
    }

    const payload = (await this.jwtService
      .verifyAsync(refreshToken, {
        secret: this.configService.get('auth.SECRET_REFRESH_KEY', {
          infer: true,
        }),
      })
      .catch(() => {
        throw new UnauthorizedException();
      })) as {
      userInfo: UserInfo;
      deviceId: string;
      iat: number;
    };
    if (!payload) {
      throw new UnauthorizedException();
    }

    const checkDeviceSession = await this.devicesService.findDeviceSessionByIAT(
      payload.iat,
    );
    if (!checkDeviceSession) {
      throw new UnauthorizedException();
    }

    const userDB = await this.usersService.findUser(payload.userInfo.userId);
    if (!userDB || userDB.banInfo.isBanned) {
      throw new UnauthorizedException();
    }

    request.user = {
      userInfo: payload.userInfo,
      deviceId: payload.deviceId,
      issuedAt: payload.iat,
    };
    return true;
  }

  async extractTokenFromCookie(request: Request) {
    const refreshToken: string = request.cookies['refreshToken'];
    return refreshToken ? refreshToken : null;
  }
}
