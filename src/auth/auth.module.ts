import { PassportModule } from '@nestjs/passport';
import { BasicStrategy } from './strategies/basic.strategy';
import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { LocalStrategy } from './strategies/local.strategy';
import { EmailService } from '../email/email.service';
import { BasicAuthGuard } from './guards/basic-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { UsersModule } from '../users/users.module';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { JwtBearerGuard } from './guards/jwt-auth.guard';
import { JwtBearerStrategy } from './strategies/jwt-bearer.strategy';

@Module({
  imports: [
    // ThrottlerModule.forRoot({
    //   ttl: 60,
    //   limit: 5,
    // }),
    UsersModule,
    PassportModule,
    JwtModule,
  ],
  providers: [
    AuthService,
    BasicStrategy,
    BasicAuthGuard,
    LocalAuthGuard,
    LocalStrategy,
    JwtRefreshStrategy,
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
