import { UserDocument } from './users.schema';
import { SAUserViewDTO, UserViewDTO } from './user.models';

export const usersMappingSA = (array: Array<UserDocument>): SAUserViewDTO[] => {
  return array.map((el) => {
    return {
      id: el._id.toString(),
      login: el.login,
      email: el.email,
      createdAt: el.addedAt.toISOString(),
      banInfo: el.banInfo,
    };
  });
};

export const userMapping = (user: UserDocument): UserViewDTO => {
  return {
    id: user.id,
    login: user.login,
    email: user.email,
    createdAt: user.addedAt.toISOString(),
  };
};

export const usersMapping = (array: Array<UserDocument>): UserViewDTO[] => {
  return array.map((el) => {
    return {
      id: el._id.toString(),
      login: el.login,
      email: el.email,
      createdAt: el.addedAt.toISOString(),
    };
  });
};

export const userMappingSA = (user: UserDocument): SAUserViewDTO => {
  return {
    id: user._id.toString(),
    login: user.login,
    email: user.email,
    createdAt: user.addedAt.toISOString(),
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
