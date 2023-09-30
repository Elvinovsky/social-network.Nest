import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

export const CurrentSessionInfoFromAccessJWT = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();

    const sessionInfo = request.user;
    if (!sessionInfo.userInfo) {
      throw new UnauthorizedException();
    }
    if (!sessionInfo.deviceId) {
      throw new UnauthorizedException();
    }

    return sessionInfo;
  },
);
