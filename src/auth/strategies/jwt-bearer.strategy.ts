import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { getConfiguration } from '../../configuration/getConfiguration';
import { UserInfo } from '../../users/user.models';

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
      userInfo: payload.userInfo as UserInfo,
      deviceId: payload.deviceId,
    };
  }
}
