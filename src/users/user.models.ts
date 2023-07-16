import { IsNotEmpty, Length, Matches } from 'class-validator';

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

export class UserCreateDTO {
  login: string;
  passwordHash: string;
  email: string;
  addedAt: string;
  emailConfirmation: EmailConfirmationModel;
}

export type UserMethodType = {
  canBeConfirmed: () => boolean;
};
export class EmailConfirmationModel {
  confirmationCode: string;
  expirationDate: Date | string;
  isConfirmed: boolean;
}

export type MeViewModel = {
  email: string;
  login: string;
  userId: string;
};
export type UserViewDTO = {
  id: string;
  login: string;
  email: string;
  createdAt: string;
};
