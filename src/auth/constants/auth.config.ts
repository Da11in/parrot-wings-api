import { JwtSignOptions } from '@nestjs/jwt';

export const jwtAccessConfig: JwtSignOptions = {
  secret: process.env.JWT_ACCESS_SECRET,
  expiresIn: '60s',
};

export const jwtRefreshConfig: JwtSignOptions = {
  secret: process.env.JWT_REFRESH_SECRET,
  expiresIn: '30d',
};

export const saltOrRoundsValue = 10;
