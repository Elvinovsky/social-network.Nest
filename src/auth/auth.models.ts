import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';

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
