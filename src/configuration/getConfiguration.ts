import * as process from 'process';

export const getConfiguration = () => ({
  auth: {
    USER_NAME_BASIC_GUARD: process.env.BASIC_USER_NAME ?? 'admin',
    PASSWORD_BASIC_GUARD: process.env.BASIC_PASS ?? 'qwerty',
    SECRET_ACCESS_KEY: process.env.ACCESS_JWT_SECRET_KEY ?? 'r=key',
    SECRET_REFRESH_KEY: process.env.REFRESH_JWT_SECRET_KEY ?? 'l=key',
    ACCESS_TOKEN_EXPIRATION_TIME:
      process.env.ACCESS_TOKEN_EXPIRATION_TIME ?? '10m',
    REFRESH_TOKEN_EXPIRATION_TIME:
      process.env.REFRESH_TOKEN_EXPIRATION_TIME ?? '20m',
  },
  repo_type: process.env.REPO_TYPE,
  mongoDBOptions: {
    DB_NAME: process.env.DB_NAME,
    MONGO_URI:
      process.env.MONGO_URL ?? `mongodb://0.0.0.0:27017/${process.env.DB_NAME}`,
  },
  sqlOptions: {
    type: 'postgres',
    host: 'localhost',
    port: 5433,
    username: 'postgres',
    password: 'sa',
    database: 'social-network',
    autoLoadEntities: false,
    synchronize: false,
    ssl: { rejectUnauthorized: false },
  },
});

export type ConfigType = ReturnType<typeof getConfiguration>;
