import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { ConfigType } from '../../configuration/getConfiguration';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class OptionalBearerGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService<ConfigType>,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = await this.reflector.getAllAndOverride(IS_PUBLIC_KEY, [
      context.getHandler,
      context.getClass,
    ]);
    if (isPublic) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const accessToken = this.extractTokenFromHeaders(request);

    if (!accessToken) {
      return true;
    }

    const payload = await this.jwtService
      .verifyAsync(accessToken, {
        secret: this.configService.get('auth.SECRET_ACCESS_KEY', {
          infer: true,
        }),
      })
      .catch(() => {
        console.log('token invalid, but true');
      });

    if (!payload) {
      return true;
    }

    request.userId = payload.userInfo.userId;
    return true;
  }

  private extractTokenFromHeaders(request: Request): string | null {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : null;
  }
}
