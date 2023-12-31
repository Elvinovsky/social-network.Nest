import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PaginatorType } from '../../../../infrastructure/pagination/pagination.models';
import { MeViewModel, UserViewDTO } from '../../../dto/view/user-view.models';
import { InjectModel } from '@nestjs/mongoose';
import {
  UserMongooseEntity,
  UserDocument,
} from '../../../entities/mongoose/user-no-sql.schema';
import { Model } from 'mongoose';
import { usersMapping, usersMappingSA } from '../../helpers/user.helpers';
import {
  getDirection,
  getPageNumber,
  getPageSize,
  getSkip,
  getSortBy,
  pagesCounter,
} from '../../../../infrastructure/pagination/pagination.helpers';
import { DEFAULT_PAGE_SortBy } from '../../../../infrastructure/common/constants';
import mongoose from 'mongoose';
import { IUserQueryRepository } from '../../../../infrastructure/repositoriesModule/repositories.module';

@Injectable()
export class UsersMongooseQueryRepository implements IUserQueryRepository {
  constructor(
    @InjectModel(UserMongooseEntity.name)
    private userModel: Model<UserDocument>,
  ) {}
  async getSortedUsers(
    pageNumber: number,
    pageSize: number,
    sortBy: string,
    sortDirection: string,
    searchEmailTerm?: string,
    searchLoginTerm?: string,
  ): Promise<PaginatorType<UserViewDTO[]>> {
    const filter: mongoose.FilterQuery<UserDocument> = {};
    if (searchEmailTerm) {
      filter.email = {
        $regex: searchEmailTerm,
        $options: 'i',
      };
    }
    if (searchLoginTerm) {
      filter.login = {
        $regex: searchLoginTerm,
        $options: 'i',
      };
    }
    const calculateOfFiles = await this.userModel.countDocuments(filter);

    const foundUsers: UserDocument[] = await this.userModel
      .find(filter)
      .sort({
        [getSortBy(sortBy)]: getDirection(sortDirection),
        [DEFAULT_PAGE_SortBy]: getDirection(sortDirection),
      })
      .skip(getSkip(getPageNumber(pageNumber), getPageSize(pageSize)))
      .limit(getPageSize(pageSize));
    return {
      pagesCount: pagesCounter(calculateOfFiles, pageSize),
      page: getPageNumber(pageNumber),
      pageSize: getPageSize(pageSize),
      totalCount: calculateOfFiles,
      items: usersMapping(foundUsers),
    };
  }

  async getSortedUsersForSA(
    pageNumber: number,
    pageSize: number,
    sortBy: string,
    sortDirection: string,
    banStatus: string,
    searchEmailTerm?: string,
    searchLoginTerm?: string,
  ): Promise<PaginatorType<UserViewDTO[]>> {
    try {
      let filter: mongoose.FilterQuery<UserDocument> = {};

      if (banStatus === 'banned') {
        filter = { 'banInfo.isBanned': true };
      }

      if (banStatus === 'notBanned') {
        filter = { 'banInfo.isBanned': false };
      }

      if (searchEmailTerm || searchLoginTerm) {
        filter.$or = [
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
        ];
      }

      const calculateOfFiles = await this.userModel.countDocuments(filter);

      const foundUsers: UserDocument[] = await this.userModel
        .find(filter)
        .sort({
          [getSortBy(sortBy)]: getDirection(sortDirection),
          [DEFAULT_PAGE_SortBy]: getDirection(sortDirection),
        })
        .skip(getSkip(getPageNumber(pageNumber), getPageSize(pageSize)))
        .limit(getPageSize(pageSize));

      return {
        pagesCount: pagesCounter(calculateOfFiles, pageSize),
        page: getPageNumber(pageNumber),
        pageSize: getPageSize(pageSize),
        totalCount: calculateOfFiles,
        items: usersMappingSA(foundUsers),
      };
    } catch (e) {
      console.log(e);
      throw new InternalServerErrorException();
    }
  }

  async getUserInfo(id: string): Promise<MeViewModel | null> {
    const user = await this.userModel.findOne({ id: id }).exec();
    if (!user) {
      return null;
    }
    return {
      email: user.email,
      login: user.login,
      userId: user.id,
    };
  }
}
