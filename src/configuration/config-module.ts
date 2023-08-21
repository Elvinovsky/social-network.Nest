import { ConfigModule } from '@nestjs/config';
import { getConfiguration } from './getConfiguration';
export const configModule = ConfigModule.forRoot({
  envFilePath: ['.env.local', '.env'],
  load: [getConfiguration],
  isGlobal: true,
});
