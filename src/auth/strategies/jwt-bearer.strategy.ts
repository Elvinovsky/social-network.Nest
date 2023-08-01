import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { jwtConstants } from '../auth.constants';

export class JwtBearerStrategy extends PassportStrategy(Strategy, 'bearer') {
  constructor() {
    super({
      JwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secretRefresh,
    });
  }
  async validate(payload: any) {
    return { userId: payload.sub, userName: payload.userName };
  }
}
