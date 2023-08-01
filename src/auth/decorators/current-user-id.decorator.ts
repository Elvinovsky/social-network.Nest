import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUserId = createParamDecorator(
  (context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    return request.user.id;
  },
);
