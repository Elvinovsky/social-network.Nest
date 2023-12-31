export type MeViewModel = {
  email: string;
  login: string;
  userId: string;
};
export class UserViewDTO {
  id: string;
  login: string;
  email: string;
  createdAt: string;
}

export class UserInfo {
  userId: string;
  userLogin: string;
}

export class SAUserViewDTO {
  id: string;
  login: string;
  email: string;
  createdAt: string;
  banInfo: {
    isBanned: boolean;
    banDate: Date | null;
    banReason: string | null;
  };
}
