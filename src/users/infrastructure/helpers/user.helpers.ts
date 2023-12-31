import { SAUserViewDTO, UserViewDTO } from '../../dto/view/user-view.models';
import { UserInputModel } from '../../dto/input/user-input.models';
import { UserCreateDTO } from '../../dto/create/users-create.models';
import { v4 as uuidv4 } from 'uuid';
import { add } from 'date-fns';

export const usersMappingSA = (
  array: Array<UserCreateDTO>,
): SAUserViewDTO[] => {
  return array.map((el) => {
    return {
      id: el.id,
      login: el.login,
      email: el.email,
      createdAt: el.addedAt.toISOString(),
      banInfo: el.banInfo,
    };
  });
};

export const userMapping = (
  user:
    | UserCreateDTO
    | {
        id: string;
        login: string;
        passwordHash: string;
        email: string;
        addedAt: Date;
      },
): UserViewDTO => {
  return {
    id: user.id,
    login: user.login,
    email: user.email,
    createdAt: user.addedAt.toISOString(),
  };
};

export const usersMapping = (array: Array<UserCreateDTO>): UserViewDTO[] => {
  return array.map((el) => {
    return {
      id: el.id.toString(),
      login: el.login,
      email: el.email,
      createdAt: el.addedAt.toISOString(),
    };
  });
};

export const userMappingSA = (user: UserCreateDTO): SAUserViewDTO => {
  return {
    id: user.id,
    login: user.login,
    email: user.email,
    createdAt: user.addedAt.toISOString(),
    banInfo: {
      isBanned: user.banInfo.isBanned,
      banDate: user.banInfo.banDate,
      banReason: user.banInfo.banReason,
    },
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

class UserCreator extends UserCreateDTO {
  create(
    inputModel: UserInputModel,
    hash: string,
    code: string,
  ): UserCreateDTO {
    const expirationDate: Date = add(new Date(), {
      hours: 1,
      minutes: 10,
    });
    const user: UserCreateDTO = new UserCreator();

    user.id = uuidv4();
    user.login = inputModel.login;
    user.passwordHash = hash;
    user.email = inputModel.email;
    user.addedAt = new Date();

    user.emailConfirmation = {
      userId: user.id,
      confirmationCode: code,
      expirationDate: expirationDate,
      isConfirmed: false,
    };
    user.banInfo = {
      userId: user.id,
      isBanned: false,
      banDate: null,
      banReason: null,
    };
    return user;
  }
  createSA(inputModel: UserInputModel, hash: string): UserCreateDTO {
    const user: UserCreateDTO = new UserCreator();

    user.id = uuidv4();
    user.login = inputModel.login;
    user.passwordHash = hash;
    user.email = inputModel.email;
    user.addedAt = new Date();
    user.emailConfirmation = {
      userId: user.id,
      confirmationCode: null,
      expirationDate: null,
      isConfirmed: true,
    };
    user.banInfo = {
      userId: user.id,
      isBanned: false,
      banDate: null,
      banReason: null,
    };
    return user;
  }
}
export const userCreator = new UserCreator();
