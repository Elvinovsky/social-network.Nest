import * as process from 'process';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const getConfiguration = () => ({
  NODE_ENV: String(process.env.NODE_ENV),
  auth: {
    USER_NAME_BASIC_GUARD: process.env.BASIC_USER_NAME ?? 'admin',
    PASSWORD_BASIC_GUARD: process.env.BASIC_PASS ?? 'qwerty',
    SECRET_ACCESS_KEY: process.env.ACCESS_JWT_SECRET_KEY ?? 'r=key',
    SECRET_REFRESH_KEY: process.env.REFRESH_JWT_SECRET_KEY ?? 'l=key',
    ACCESS_TOKEN_EXPIRATION_TIME:
      process.env.ACCESS_TOKEN_EXPIRATION_TIME ?? '10s',
    REFRESH_TOKEN_EXPIRATION_TIME:
      process.env.REFRESH_TOKEN_EXPIRATION_TIME ?? '20s',
  },
  mail_auth: {
    user: process.env.AUTH_EMAIL,
    password: process.env.AUTH_PASS,
  },
  repo_type: process.env.REPO_TYPE,
  mongoDBOptions: {
    DB_NAME: process.env.DB_NAME,
    MONGO_URI:
      process.env.MONGO_URL ?? `mongodb://0.0.0.0:27017/${process.env.DB_NAME}`,
  },
  SQL_OPTIONS: {
    sqlLocalOptions: {
      type: String(process.env.DATABASE_TYPE) || 'postgres',
      host: String(process.env.DATABASE_HOST) || 'localhost',
      port: Number(process.env.DATABASE_PORT) || 5433,
      username: String(process.env.DATABASE_USERNAME) || 'postgres',
      password: String(process.env.DATABASE_PASSWORD) || 'sa',
      database: String(process.env.DATABASE_DB) || 'postgres',
      autoLoadEntities: true,
      synchronize: true,
    } as TypeOrmModuleOptions,
    sqlRemoteOptions: {
      type: String(process.env.DATABASE_TYPE),
      url: 'postgres://Elvinovsky:nXHKtfSpU1g3@ep-hidden-wood-23954592.us-east-2.aws.neon.tech/neondb',
      autoLoadEntities: true,
      synchronize: true,
      ssl: { rejectUnauthorized: false },
    } as TypeOrmModuleOptions,
  },
});

export type ConfigType = ReturnType<typeof getConfiguration>;
