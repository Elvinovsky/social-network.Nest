import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class AuthGuard {
  async canActivate(context) {
    const request: Request = context.switchToHttp().getRequest();

    // Verify login and password are set and correct
    if (request.headers?.authorization === 'Basic YWRtaW46cXdlcnR5') {
      return true;
    }
    throw new UnauthorizedException();
  }
}
