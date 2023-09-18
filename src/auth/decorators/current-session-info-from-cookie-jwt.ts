import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

export const CurrentSessionInfoFromRefreshJWT = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    console.log(request.user);
    const sessionInfo = request.user;
    if (!sessionInfo.userInfo) {
      throw new UnauthorizedException();
    }
    if (!sessionInfo.deviceId) {
      throw new UnauthorizedException();
    }
    if (!sessionInfo.issuedAt) {
      throw new UnauthorizedException();
    }
    return sessionInfo;
  },
);
