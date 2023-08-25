import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { getConfiguration } from '../../configuration/getConfiguration';

export class JwtBearerStrategy extends PassportStrategy(Strategy, 'bearer') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: getConfiguration().auth.SECRET_ACCESS_KEY,
    });
  }
  async validate(payload: any) {
    return {
      userId: payload.userId,
      deviceId: payload.deviceId,
    };
  }
}
