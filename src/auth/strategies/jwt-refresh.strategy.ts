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
      jwtFromRequest: cookieExtractor,
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secretRefresh,
    });
  }
  async validate(payload: any) {
    return {
      id: payload.sub,
    };
  }
}
