import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { appSettings } from './settings/app-settings';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  await appSettings(app);
  await app.listen(4040, () => {
    console.log('app started');
  });
}

bootstrap();
