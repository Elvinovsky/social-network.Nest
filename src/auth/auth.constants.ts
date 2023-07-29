export const basicConstants = {
  userName: process.env.BASIC_USER_NAME || 'admin',
  password: process.env.BASIC_PASS || '123',
};

export const jwtConstants = {
  secretAccess: process.env.ACCESS_JWT_SECRET_KEY,
  secretRefresh: process.env.REFRESH_JWT_SECRET_KEY,
};
