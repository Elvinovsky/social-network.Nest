import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUserIdHeaders = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    // if (!request.userId) {
    //   throw new Error('userId undefined');
    // }
    // return request.userId; // todo расширить тип реквеста!!!! почему не присваивается юерАйди

    const userId = request.user;
    return userId;
  },
);
