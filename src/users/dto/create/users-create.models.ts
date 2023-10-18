export class EmailConfirmationModel {
  userId: string;
  confirmationCode: string | null;
  expirationDate: Date | null;
  isConfirmed: boolean;
}

export class BanInfoModel {
  userId: string;
  isBanned: boolean;
  banDate: Date | null;
  banReason: string | null;
}

export class UserCreateDTO {
  id: string;
  login: string;
  passwordHash: string;
  email: string;
  addedAt: Date;
  emailConfirmation: EmailConfirmationModel;
  banInfo: BanInfoModel;
}
