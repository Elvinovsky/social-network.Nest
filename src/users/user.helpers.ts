import { UserDocument } from './users.schema';
import { UserViewDTO } from './user.models';

export const usersMapping = (array: Array<UserDocument>): UserViewDTO[] => {
  return array.map((el) => {
    return {
      id: el._id.toString(),
      login: el.login,
      email: el.email,
      createdAt: el.createdAt,
    };
  });
};
export const userMapping = (user: UserDocument): UserViewDTO => {
  return {
    id: user._id.toString(),
    login: user.login,
    email: user.email,
    createdAt: user.createdAt,
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
