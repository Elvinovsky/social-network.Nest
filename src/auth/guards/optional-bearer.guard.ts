import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { ConfigType } from '../../configuration/getConfiguration';

import { SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
//todo transfer
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
@Injectable()
export class OptionalBearerGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService<ConfigType>,
    private reflector: Reflector, //todo почитать за рефлектор
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const accessToken = this.extractTokenFromHeaders(request);

    if (!accessToken) {
      return true;
    } else {
      const payload = await this.jwtService
        .verifyAsync(accessToken, {
          secret: this.configService.get('auth.SECRET_ACCESS_KEY', {
            infer: true,
          }),
        })
        .catch(() => {
          return true;
        });
      request.userId = payload.userId;
    }

    return true;
  }

  private extractTokenFromHeaders(request: Request): string | null {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : null;
  }
}
