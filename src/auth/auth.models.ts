import {
  IsNotEmpty,
  IsString,
  IsUUID,
  Length,
  Matches,
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { AuthService } from './application/auth.service';

export class RegistrationInputModel {
  @IsNotEmpty()
  @Matches(/^[a-zA-Z0-9_-]*$/)
  @Length(3, 10)
  login: string;
  @IsNotEmpty()
  @Length(6, 20)
  @IsString()
  password: string;
  @IsNotEmpty()
  @Matches(/^[\w-]+@([\w-]+\.)+[\w-]{2,4}$/)
  email: string;
}

export class RegistrationConfirmationCodeModel {
  @IsNotEmpty()
  @IsUUID()
  code: string;
  /**
   * Code that be sent via Email inside link
   */
}

export class EmailInputModel {
  @IsNotEmpty()
  @Matches(/^[\w-]+@([\w-]+\.)+[\w-]{2,4}$/)
  email: string;
  /**
   *    pattern: ^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$
   *     Email of already registered but not confirmed user
   */
}
export class LoginInputModel {
  @IsNotEmpty()
  loginOrEmail: string;
  @IsNotEmpty()
  password: string;
}

@Injectable()
@ValidatorConstraint({ name: 'CodeExpire', async: true })
export class CodeExpireCheck implements ValidatorConstraintInterface {
  constructor(private authService: AuthService) {}
  async validate(code: string, args: ValidationArguments) {
    const currentUser = await this.authService.findUserByConfirmCode(code);
    if (
      !currentUser ||
      currentUser.emailConfirmation.expirationDate < new Date()
    ) {
      return false;
    }
    return true;
  }

  defaultMessage(args: ValidationArguments) {
    return 'your verification code has expired';
  }
}

export class NewPasswordRecoveryInputModel {
  @IsNotEmpty()
  @IsString()
  @Length(6, 20)
  newPassword: string;
  /**
   * maxLength: 20
   * minLength: 6
   */
  @IsNotEmpty()
  @Validate(CodeExpireCheck)
  recoveryCode: string;
}
