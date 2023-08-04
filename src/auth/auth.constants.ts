import * as dotenv from 'dotenv';
dotenv.config();
export const basicConstants = {
  userName: process.env.BASIC_USER_NAME || 'admin',
  password: process.env.BASIC_PASS || '123',
};
//todo как убрать undefined;
export const jwtConstants = {
  secretAccess: process.env.ACCESS_JWT_SECRET_KEY || 'string',
  secretRefresh: process.env.REFRESH_JWT_SECRET_KEY || 'string',
  accessTokenExpirationTime: '60s',
  refreshTokenExpirationTime: '60s',
};
