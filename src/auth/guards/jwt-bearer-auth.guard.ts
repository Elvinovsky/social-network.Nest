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
import { Reflector } from '@nestjs/core';

import { SetMetadata } from '@nestjs/common';
//todo transfer
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

@Injectable()
export class JwtBearerGuard implements CanActivate {
  constructor(
    private devicesService: DevicesService,
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService<ConfigType>,
    private reflector: Reflector,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      // 💡 See this condition
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const accessToken = this.extractTokenFromHeaders(request);

    if (!accessToken) {
      throw new UnauthorizedException();
    } else {
      const payload = await this.jwtService
        .verifyAsync(accessToken, {
          secret: this.configService.get('auth.SECRET_ACCESS_KEY', {
            infer: true,
          }),
        })
        .catch(() => {
          return false;
        });
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
