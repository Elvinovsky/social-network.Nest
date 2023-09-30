import {
  BadRequestException,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { useContainer } from 'class-validator';
import { AppModule } from '../../app.module';
import {
  ErrorExceptionFilter,
  HttpExceptionFilter,
} from '../../http-exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { TrimPipe } from '../common/pipes/trim.pipe';

export const appSettings = (app: INestApplication) => {
  app.use(cookieParser());
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  app.useGlobalPipes(
    new TrimPipe(),
    new ValidationPipe({
      whitelist: true,
      transform: true,
      stopAtFirstError: true,
      exceptionFactory: (errors) => {
        const errorsForResponse: any = [];

        errors.forEach((err) => {
          const keys = Object.keys(err.constraints || {});
          keys.forEach((key) => {
            if (err.constraints) {
              errorsForResponse.push({
                message: err.constraints[key],
                field: err.property,
              });
            }
          });
        });

        throw new BadRequestException(errorsForResponse);
      },
    }),
  );

  app.enableCors();
  app.useGlobalFilters(new ErrorExceptionFilter(), new HttpExceptionFilter());
  const config = new DocumentBuilder()
    .setTitle('Social-network')
    .setDescription('')
    .setVersion('1.0')
    .addTag('Social-network')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
};
