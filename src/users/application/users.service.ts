import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../infrastructure/users.repository';
import {
  BanUserInputModel,
  SAUserViewDTO,
  UserCreateDTO,
  UserInputModel,
  UserViewDTO,
} from '../user.models';
import { RegistrationInputModel } from '../../auth/auth.models';
import { ResultsAuthForErrors } from '../../auth/auth.constants';
import { User } from '../users.schema';
import { DevicesService } from '../../devices/devices.service';
import { LikesService } from '../../likes/likes.service';
import { CommentsService } from '../../comments/comments.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
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
    const newUser: UserCreateDTO = User.CreateSA(inputModel, hash);

    return await this.usersRepository.createUser(newUser);
  }

  async createUserRegistration(
    inputModel: UserInputModel,
    hash: string,
    code: string,
    expirationDate: Date,
  ) {
    //собираем ДТО юзера для отправки в репозиторий.
    const newUser: UserCreateDTO = User.Create(
      inputModel,
      hash,
      code,
      expirationDate,
    );

    //отправляем ДТО в репозиторий
    return this.usersRepository.createUser(newUser);
  }

  async changeEmailUser(userId: string, email: string) {
    return this.usersRepository.updateEmail(userId, email);
  }

  async changeLoginUser(userId: string, login: string) {
    return this.usersRepository.updateLogin(userId, login);
  }

  async deleteUserById(id: string): Promise<Document | null> {
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

    const userLogin = await this.usersRepository.findUserByLogin(
      inputModel.login,
    );
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
    const badBoy: SAUserViewDTO | null = await this.usersRepository.findUser(
      userId,
    );

    if (!badBoy) {
      return null;
    }
    if (badBoy.banInfo.isBanned === inputModel.isBanned) {
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
