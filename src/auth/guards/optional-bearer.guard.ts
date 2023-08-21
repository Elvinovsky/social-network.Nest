import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class OptionalBearerGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const accessToken = this.extractTokenFromHeaders(request);

    if (!accessToken) {
      return true;
    } else {
      const payload = await this.jwtService
        .verifyAsync(accessToken, {
          secret: this.configService.get('SECRET_REFRESH_KEY'),
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
