export class EmailConfirmationModel {
  confirmationCode: string | null;
  expirationDate: Date | null;
  isConfirmed: boolean;
}

export class BanInfoModel {
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
