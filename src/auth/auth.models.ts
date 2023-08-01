import { IsNotEmpty, IsString, IsUUID, Length, Matches } from 'class-validator';

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

export class RegistrationEmailResending {
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
export type PasswordRecoveryInputModel = {
  email: string;
};
export type NewPasswordRecoveryInputModel = {
  newPassword: string;
  /**
   * maxLength: 20
   * minLength: 6
   */
  recoveryCode: string;
};
