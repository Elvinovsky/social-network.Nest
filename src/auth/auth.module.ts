import { PassportModule } from '@nestjs/passport';
import { BasicStrategy } from './infrastructure/strategies/basic.strategy';
import { forwardRef, Module } from '@nestjs/common';
import { AuthController } from './api/auth.controller';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { AuthService } from './application/auth.service';
import { LocalStrategy } from './infrastructure/strategies/local.strategy';
import { EmailSenderService } from '../infrastructure/adapters/email/email.service';
import { BasicAuthGuard } from './infrastructure/guards/basic-auth.guard';
import { LocalAuthGuard } from './infrastructure/guards/local-auth.guard';
import { UsersModule } from '../users/users.module';
import { JwtRefreshGuard } from './infrastructure/guards/jwt-refresh.guard';
import { JwtBearerGuard } from './infrastructure/guards/jwt-bearer-auth.guard';
import { DevicesModule } from '../devices/devices.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { OptionalBearerGuard } from './infrastructure/guards/optional-bearer.guard';
import { CodeExpireCheck } from './dto/auth-input.models';
import { UserRegistrationUseCase } from './application/use-cases/user-registration-use-case.';
import { CqrsModule } from '@nestjs/cqrs';
import { SendSMTPAdapter } from '../infrastructure/adapters/email/send-smtp-adapter';

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
    AuthService,
    BasicStrategy,
    BasicAuthGuard,
    LocalAuthGuard,
    LocalStrategy,
    JwtRefreshGuard,
    JwtBearerGuard,
    JwtService,

    EmailSenderService,
    SendSMTPAdapter,
  ],
  controllers: [AuthController],
  exports: [AuthService, JwtBearerGuard],
})
export class AuthModule {}
