import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { jwtConstants } from '../auth.constants';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { cookieExtractor } from '../helpers/cookie-extractor';
import { AuthService } from '../auth.service';
import { DevicesService } from '../../devices/devices.service';
import { UsersService } from '../../users/users.service';
@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'refresh') {
  constructor(
    private authService: AuthService,
    private devicesService: DevicesService,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: cookieExtractor,
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secretRefresh,
    });
  }
  async extractTokenFromHeader(request: Request) {
    const refreshToken: string = request.cookies['refreshToken'];
    if (!refreshToken) {
      throw new UnauthorizedException();
    }
    const issuedAt = await this.authService.getIATByRefreshToken(refreshToken);
    const deviceId = await this.authService.getDeviceIdRefreshToken(
      refreshToken,
    );
    if (!deviceId) {
      throw new UnauthorizedException();
    }

    const checkDeviceSession = await this.devicesService.findDeviceSessionByIAT(
      issuedAt,
    );
    if (!checkDeviceSession) {
      throw new UnauthorizedException();
    }

    const userId = await this.authService.getUserIdByRefreshToken(refreshToken);
    if (!userId) {
      throw new UnauthorizedException();
    }

    const currentUser = await this.usersService.getUser(userId);
    if (!currentUser) {
      throw new UnauthorizedException();
    }
  }
  async validate(payload: any) {
    return {
      userId: payload.userId,
      issuedAt: payload.iat,
      deviceId: payload.deviceId,
    };
  }
}
