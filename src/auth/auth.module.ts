import { PassportModule } from '@nestjs/passport';
import { BasicStrategy } from './strategies/basic.strategy';
import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { jwtConstants } from './auth.constants';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { LocalStrategy } from './strategies/local.strategy';
import { AuthRepository } from './auth.repository';

import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../users/users.schema';
import { EmailService } from '../email/email.service';
import { UsersRepository } from '../users/users.repository';
import { BasicAuthGuard } from './guards/basic-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { UsersModule } from '../users/users.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { JwtBearerGuard } from './guards/jwt-auth.guard';
import { JwtBearerStrategy } from './strategies/jwt-bearer.strategy';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 5,
    }),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    UsersModule,
    PassportModule,
    JwtModule.register({
      global: true,
      secret: jwtConstants.secretAccess,
      signOptions: { expiresIn: '60s' },
    }),
  ],
  providers: [
    AuthRepository,
    AuthService,
    UsersService,
    BasicStrategy,
    BasicAuthGuard,
    LocalAuthGuard,
    LocalStrategy,
    JwtRefreshStrategy,
    JwtRefreshGuard,
    JwtBearerGuard,
    JwtBearerStrategy,
    UsersRepository,

    JwtService,
    EmailService,
  ],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
