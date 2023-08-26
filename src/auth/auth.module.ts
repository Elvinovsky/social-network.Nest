import { PassportModule } from '@nestjs/passport';
import { BasicStrategy } from './strategies/basic.strategy';
import { forwardRef, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { AuthService } from './application/auth.service';
import { LocalStrategy } from './strategies/local.strategy';
import { EmailSenderService } from '../email/email.service';
import { BasicAuthGuard } from './guards/basic-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { UsersModule } from '../users/users.module';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { JwtBearerGuard } from './guards/jwt-bearer-auth.guard';
import { JwtBearerStrategy } from './strategies/jwt-bearer.strategy';
import { DevicesModule } from '../devices/devices.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { WsThrottlerGuard } from './guards/throttler-behind-proxy';
import { OptionalBearerGuard } from './guards/optional-bearer.guard';
import { CodeExpireCheck } from './auth.models';
import { UserRegistrationUseCase } from './application/use-cases/user-registration-use-case.';
import { CqrsModule } from '@nestjs/cqrs';
import { SendSMTPAdapter } from '../email/send-smtp-adapter';

const useCases = [UserRegistrationUseCase];
@Module({
  imports: [
    ThrottlerModule.forRoot({
      ttl: 10,
      limit: 5,
    }),
    UsersModule,
    CqrsModule,
    forwardRef(() => DevicesModule),
    PassportModule,
    JwtModule.register({
      global: true,
    }),
  ],
  providers: [
    ...useCases,
    CodeExpireCheck,
    OptionalBearerGuard,
    WsThrottlerGuard,
    AuthService,
    BasicStrategy,
    BasicAuthGuard,
    LocalAuthGuard,
    LocalStrategy,
    JwtRefreshGuard,
    JwtBearerGuard,
    JwtBearerStrategy,
    JwtService,

    EmailSenderService,
    SendSMTPAdapter,
  ],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
