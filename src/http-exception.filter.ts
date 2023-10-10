import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import * as process from 'process';
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    if (status === 400) {
      const errorsMessages: Array<object> = [];
      const responseBody = exception.getResponse() as {
        message: Array<object>;
      };

      if (typeof responseBody.message === 'object') {
        responseBody?.message?.forEach((m) => errorsMessages.push(m));
        return response.status(status).send({
          errorsMessages,
        });
      }

      return response.status(status).json({
        responseBody,
      });
    } else if (status === 401) {
      return response.sendStatus(status);
    } else if (status === 403) {
      return response.sendStatus(status);
    } else if (status === 404) {
      return response.sendStatus(status);
    } else {
      return response.status(status).json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    }
  }
}

@Catch(Error)
export class ErrorExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (process.env.NODE_ENV !== 'production') {
      return response
        .status(500)
        .send({ error: exception.toString(), stack: exception.stack });
    } else {
      return response.status(500).send('Something went wrong');
    }
  }
}
