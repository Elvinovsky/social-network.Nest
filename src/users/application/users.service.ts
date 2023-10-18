import { Injectable } from '@nestjs/common';
import { SAUserViewDTO, UserViewDTO } from '../dto/view/user-view.models';
import { RegistrationInputModel } from '../../auth/dto/auth-input.models';
import { ResultsAuthForErrors } from '../../auth/infrastructure/config/auth-exceptions.constants';
import { DevicesService } from '../../devices/application/devices.service';
import { LikesService } from '../../likes/application/likes.service';
import { CommentsService } from '../../comments/application/comments.service';
import {
  BanUserInputModel,
  UserInputModel,
} from '../dto/input/user-input.models';
import { UserCreateDTO } from '../dto/create/users-create.models';
import { userCreator } from '../infrastructure/helpers/user.helpers';
import { IUserRepository } from '../../infrastructure/repositoriesModule/repositories.module';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: IUserRepository,
    private devicesService: DevicesService,
    private likesService: LikesService,
    private commentsService: CommentsService,
  ) {}
  async findUser(userId: string): Promise<SAUserViewDTO | null> {
    return this.usersRepository.findUser(userId);
  }
  async getUserSA(userId: string): Promise<UserViewDTO | null> {
    return this.usersRepository.getUser(userId);
  }
  async createUserForSA(
    inputModel: UserInputModel,
    hash: string,
  ): Promise<UserViewDTO> {
    const newUser: UserCreateDTO = userCreator.createSA(inputModel, hash);

    return await this.usersRepository.createUser(newUser);
  }

  async createUserRegistration(
    inputModel: UserInputModel,
    hash: string,
    code: string,
  ) {
    //собираем ДТО юзера для отправки в репозиторий.
    const newUser: UserCreateDTO = userCreator.create(inputModel, hash, code);

    //отправляем ДТО в репозиторий
    return this.usersRepository.createUser(newUser);
  }

  async changeEmailUser(userId: string, email: string) {
    return this.usersRepository.updateEmail(userId, email);
  }

  async changeLoginUser(userId: string, login: string) {
    return this.usersRepository.updateLogin(userId, login);
  }

  async deleteUserById(id: string): Promise<number | null> {
    return this.usersRepository.deleteUserById(id);
  }

  async _isUserAlreadyExists(
    inputModel: RegistrationInputModel,
  ): Promise<true | ResultsAuthForErrors> {
    const userEmail = await this.usersRepository.findUserByEmail(
      inputModel.email,
    );
    if (userEmail) {
      return ResultsAuthForErrors.email;
    }

    const userLogin: UserCreateDTO | null =
      await this.usersRepository.findUserByLogin(inputModel.login);
    if (userLogin) {
      return ResultsAuthForErrors.login;
    }

    return true;
  }
  async findUserByEmail(email: string) {
    return this.usersRepository.findUserByEmail(email);
  }
  async findUserByLogin(login: string) {
    return this.usersRepository.findUserByLogin(login);
  }
  async findUserByConfirmCode(code: string) {
    return this.usersRepository.findUserByCode(code);
  }

  async findByLoginOrEmail(loginOrEmail: string) {
    return this.usersRepository.findUserLoginOrEmail(loginOrEmail);
  }
  async confirmationEmail(code: string) {
    return this.usersRepository.confirmEmail(code);
  }
  async updateConfirmationCodeByEmail(email: string, newCode: string) {
    return this.usersRepository.updateConfirmationCodeByEmail(email, newCode);
  }
  async updatePasswordHash(hash: string, code: string) {
    return this.usersRepository.updatePasswordForUser(hash, code);
  }

  async updateBanStatus(userId: string, inputModel: BanUserInputModel) {
    debugger;
    const badBoy: SAUserViewDTO | null = await this.usersRepository.findUser(
      userId,
    );

    if (!badBoy) {
      return null;
    }
    if (badBoy.banInfo?.isBanned === inputModel.isBanned) {
      return false;
    }
    if (inputModel.isBanned === true) {
      await this.commentsService.banComments(userId);
      await this.likesService.banLikes(userId);
      await this.devicesService.LogoutAllDevicesAdminOrder(userId);
      return this.usersRepository.banUser(userId, inputModel);
    }
    await this.likesService.unBanLikes(userId);
    await this.commentsService.unBanComments(userId);
    return this.usersRepository.unBanUser(userId, inputModel);
  }
}
