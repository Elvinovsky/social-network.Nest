import { BasicStrategy as Strategy } from 'passport-http';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { ConfigType } from '../../configuration/getConfiguration';
@Injectable()
export class BasicStrategy extends PassportStrategy(Strategy, 'basic') {
  constructor(private configService: ConfigService<ConfigType>) {
    super();
  }
  public validate = async (userName, password) => {
    if (
      this.configService.get('auth.USER_NAME_BASIC_GUARD', { infer: true }) ===
        userName &&
      this.configService.get('auth.PASSWORD_BASIC_GUARD', { infer: true }) ===
        password
    ) {
      return true;
    }
    throw new UnauthorizedException();
  };
}
