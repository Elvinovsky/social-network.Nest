import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

export const CurrentUserIdFromBearerJWT = createParamDecorator(
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
