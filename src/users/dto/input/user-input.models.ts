import { IsBoolean, IsNotEmpty, Length, Matches } from 'class-validator';

export class BanUserInputModel {
  @IsNotEmpty() @IsBoolean() isBanned: boolean;

  @IsNotEmpty() @Length(20) banReason: string;
}

export class UserInputModel {
  @IsNotEmpty()
  @Length(3, 10)
  @Matches(/^[a-zA-Z0-9_-]*$/)
  login: string;
  /**
   * maxLength: 10, minLength: 3, pattern: c
   */
  @IsNotEmpty()
  @Length(6, 20)
  password: string;
  /**
   *   maxLength: 20,  minLength: 6
   */
  @IsNotEmpty()
  @Matches(/^[\w-]+@([\w-]+\.)+[\w-]{2,4}$/)
  email: string;
  /**
   * pattern: ^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$
   */
}
