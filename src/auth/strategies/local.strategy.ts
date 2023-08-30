import { PassportStrategy } from '@nestjs/passport';
import { AuthService } from '../application/auth.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Strategy } from 'passport-local';
import { UserViewDTO } from '../../users/user.models';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private readonly authService: AuthService) {
    super({ usernameField: 'loginOrEmail' });
  }

  async validate(loginOrEmail: string, password: string) {
    const user = await this.authService.checkCredentials(
      loginOrEmail,
      password,
    );

    if (!user || user.banInfo.isBanned) {
      throw new UnauthorizedException();
    }
    return user as UserViewDTO;
  }
}
