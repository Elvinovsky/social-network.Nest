import { BasicStrategy as Strategy } from 'passport-http';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { basicConstants } from '../auth.constants';
@Injectable()
export class BasicStrategy extends PassportStrategy(Strategy, 'basic') {
  constructor() {
    super();
  }
  public validate = async (userName, password) => {
    if (
      basicConstants.userName === userName &&
      basicConstants.password === password
    ) {
      return true;
    }
    throw new UnauthorizedException();
  };
}
