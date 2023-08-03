import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { UserViewDTO } from '../../users/user.models';

export const CurrentUserId = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const ctx = context.switchToHttp();
    const request: Request = ctx.getRequest();

    const user = request.user as UserViewDTO;

    return user.id;
  },
);
