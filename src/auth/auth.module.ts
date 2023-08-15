import { PassportModule } from '@nestjs/passport';
import { BasicStrategy } from './strategies/basic.strategy';
import { forwardRef, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { LocalStrategy } from './strategies/local.strategy';
import { EmailService } from '../email/email.service';
import { BasicAuthGuard } from './guards/basic-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { UsersModule } from '../users/users.module';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { JwtBearerGuard } from './guards/jwt-bearer-auth.guard';
import { JwtBearerStrategy } from './strategies/jwt-bearer.strategy';
import { DevicesModule } from '../devices/devices.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { ThrottlerBehindProxyGuard } from './guards/throttler-behind-proxy';
import { OptionalBearerGuard } from './guards/optional-bearer.guard';

@Module({
  imports: [
    // ThrottlerModule.forRoot({
    //   ttl: 60,
    //   limit: 5,
    // }),
    forwardRef(() => UsersModule),
    DevicesModule,
    PassportModule,
    JwtModule.register({
      global: true,
    }),

    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 10,
    }),
  ],
  providers: [
    OptionalBearerGuard,
    ThrottlerBehindProxyGuard,
    AuthService,
    BasicStrategy,
    BasicAuthGuard,
    LocalAuthGuard,
    LocalStrategy,
    JwtRefreshGuard,
    JwtRefreshGuard,
    JwtBearerGuard,
    JwtBearerStrategy,

    JwtService,
    EmailService,
  ],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
