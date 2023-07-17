import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  BadRequestException,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common';
import { HttpExceptionFilter } from './http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  app.useGlobalPipes(
    new ValidationPipe({
      stopAtFirstError: true,
      exceptionFactory: (errors: ValidationError[]) => {
        throw new BadRequestException(
          errors.map((e: ValidationError) => {
            return {
              field: e.property,
              message: 'invalid',
            };
          }),
        );
      },
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  await app.listen(3000);
}
bootstrap();
