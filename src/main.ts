import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import {
  BadRequestException,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common';
import {
  HttpExceptionFilter,
  ErrorExceptionFilter,
} from './http-exception.filter';
import { TrimPipe } from './common/pipes/trim.pipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  app.use(cookieParser());
  app.useGlobalPipes(
    new TrimPipe(),
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
