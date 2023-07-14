export type UserInputModel = {
  login: string;
  /**
   * maxLength: 10, minLength: 3, pattern: ^[a-zA-Z0-9_-]*$
   */
  password: string;
  /**
   *   maxLength: 20,  minLength: 6
   */
  email: string;
  /**
   * pattern: ^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$
   */
};

export class UserCreateDTO {
  login: string;
  passwordHash: string;
  email: string;
  createdAt: string;
  emailConfirmation: EmailConfirmationModel;
}

export type UserMethodType = {
  canBeConfirmed: () => boolean;
};
export class EmailConfirmationModel {
  confirmationCode: string;
  expirationDate: Date;
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
