import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  BadRequestException,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common';
import {
  HttpExceptionFilter,
  ErrorExceptionFilter,
} from './http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      exceptionFactory: (errors: ValidationError[]) => {
        throw new BadRequestException(
          errors.map((e: ValidationError) => {
            return {
              field: e.property,
              message: e.property + ' invalid',
            };
          }),
        );
      },
    }),
  );
  app.useGlobalFilters(new ErrorExceptionFilter(), new HttpExceptionFilter());
  await app.listen(3000);
}

try {
  bootstrap();
  console.log('it is ok');
} catch (e) {
  console.log('no connection');
}
