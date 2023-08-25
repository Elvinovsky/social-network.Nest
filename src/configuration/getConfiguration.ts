import * as process from 'process';

export const getConfiguration = () => ({
  auth: {
    USER_NAME_BASIC_GUARD: process.env.BASIC_USER_NAME ?? 'admin',
    PASSWORD_BASIC_GUARD: process.env.BASIC_PASS ?? 'qwerty',
    SECRET_ACCESS_KEY: process.env.ACCESS_JWT_SECRET_KEY ?? 'r=key',
    SECRET_REFRESH_KEY: process.env.REFRESH_JWT_SECRET_KEY ?? 'l=key',
    ACCESS_TOKEN_EXPIRATION_TIME:
      process.env.ACCESS_TOKEN_EXPIRATION_TIME ?? '10h',
    REFRESH_TOKEN_EXPIRATION_TIME:
      process.env.REFRESH_TOKEN_EXPIRATION_TIME ?? '20h',
  },
  db: {
    DB_NAME: process.env.DB_NAME,
    MONGO_URI:
      process.env.MONGO_URL ?? `mongodb://0.0.0.0:27017/${process.env.DB_NAME}`,
  },
});

export type ConfigType = ReturnType<typeof getConfiguration>;
