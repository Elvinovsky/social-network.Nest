import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUserIdHeaders = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();

    const userId = request.user;
    return userId;
  },
);
