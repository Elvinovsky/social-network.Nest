import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { jwtConstants } from '../auth.constants';
import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import { cookieExtractor } from '../helpers/cookie-extractor';
@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'refresh') {
  constructor() {
    super({
      JwtFromRequest: cookieExtractor,
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secretRefresh,
    });
  }
  extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers['authorization']?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
  async validate(payload: any) {
    return {
      id: payload.sub,
    };
  }
}
