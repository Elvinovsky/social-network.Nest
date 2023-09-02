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
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const accessToken = this.extractTokenFromHeaders(request);

    if (!accessToken) {
      throw new UnauthorizedException();
    } else {
      const payload = (await this.jwtService
        .verifyAsync(accessToken, {
          secret: this.configService.get('auth.SECRET_ACCESS_KEY', {
            infer: true,
          }),
        })
        .catch(() => {
          throw new UnauthorizedException();
        })) as {
        userInfo: UserInfo;
        deviceId: string;
      };
      if (!payload) {
        throw new UnauthorizedException();
      }

      const isBanned = await this.usersService.findUser(
        payload.userInfo.userId,
      );

      const sessionActivateCheck =
        await this.devicesService.findSessionByDeviceId(payload.deviceId);

      if (isBanned?.banInfo.isBanned || !sessionActivateCheck) {
        throw new UnauthorizedException();
      }

      request.user = {
        userInfo: payload.userInfo,
        deviceId: payload.deviceId,
      };
    }

    return true;
  }
  private extractTokenFromHeaders(request: Request) {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : null;
  }
}
