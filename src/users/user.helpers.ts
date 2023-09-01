import { UserDocument } from './users.schema';
import { SAUserViewDTO, UserViewDTO } from './user.models';

export const usersMappingSA = (array: Array<UserDocument>): SAUserViewDTO[] => {
  return array.map((el) => {
    return {
      id: el._id.toString(),
      login: el.login,
      email: el.email,
      createdAt: el.addedAt,
      banInfo: el.banInfo,
    };
  });
};

export const userMapping = (user: UserDocument): UserViewDTO => {
  return {
    id: user._id.toString(),
    login: user.login,
    email: user.email,
    createdAt: user.addedAt,
  };
};

export const usersMapping = (array: Array<UserDocument>): UserViewDTO[] => {
  return array.map((el) => {
    return {
      id: el._id.toString(),
      login: el.login,
      email: el.email,
      createdAt: el.addedAt,
    };
  });
};

export const userMappingSA = (user: UserDocument): SAUserViewDTO => {
  return {
    id: user._id.toString(),
    login: user.login,
    email: user.email,
    createdAt: user.addedAt,
    banInfo: user.banInfo,
  };
};

export const filterLoginOrEmail = (
  searchEmailTerm?: string,
  searchLoginTerm?: string,
) => {
  return searchLoginTerm || searchEmailTerm
    ? {
        $or: [
          {
            login: {
              $regex: searchLoginTerm,
              $options: 'i',
            },
          },
          {
            email: {
              $regex: searchEmailTerm,
              $options: 'i',
            },
          },
        ],
      }
    : {};
};
