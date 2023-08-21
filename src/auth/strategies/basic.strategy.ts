import { BasicStrategy as Strategy } from 'passport-http';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class BasicStrategy extends PassportStrategy(Strategy, 'basic') {
  constructor(private configService: ConfigService) {
    super();
  }
  public validate = async (userName, password) => {
    if (
      this.configService.get('USER_NAME_BASIC_GUARD') === userName &&
      this.configService.get('PASSWORD_BASIC_GUARD') === password
    ) {
      return true;
    }
    throw new UnauthorizedException();
  };
}
