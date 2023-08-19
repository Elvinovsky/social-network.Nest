import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

export const CurrentUserIdHeaders = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();

    const userId = request.user;
    if (!userId) {
      throw new UnauthorizedException();
    }
    return userId;
  },
);
