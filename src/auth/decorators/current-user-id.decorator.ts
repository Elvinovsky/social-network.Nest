import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

export const CurrentUserId = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest();

    const userId = request.user.id as string;
    if (!userId) {
      throw new UnauthorizedException('userId undefined');
    }
    return userId;
  },
);
