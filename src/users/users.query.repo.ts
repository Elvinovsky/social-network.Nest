import { Injectable } from '@nestjs/common';
import { PaginatorType } from '../pagination/pagination.models';
import { MeViewModel, UserViewDTO } from './user.models';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './users.schema';
import { Model } from 'mongoose';
import { filterLoginOrEmail, usersMapping } from './user.helpers';
import {
  getDirection,
  getPageNumber,
  getPageSize,
  getSkip,
  getSortBy,
  pagesCountOfBlogs,
} from '../pagination/pagination.helpers';
import { DEFAULT_PAGE_SortBy } from '../common/constants';

@Injectable()
export class UsersQueryRepository {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}
  async getSortedUsers(
    searchEmailTerm?: string,
    searchLoginTerm?: string,
    pageNumber?: number,
    pageSize?: number,
    sortBy?: string,
    sortDirection?: string,
  ): Promise<PaginatorType<UserViewDTO[]>> {
    const calculateOfFiles = await this.userModel.countDocuments(
      filterLoginOrEmail(searchEmailTerm, searchLoginTerm),
    );
    const foundUsers: UserDocument[] = await this.userModel
      .find(filterLoginOrEmail(searchEmailTerm, searchLoginTerm))
      .sort({
        [getSortBy(sortBy)]: getDirection(sortDirection),
        [DEFAULT_PAGE_SortBy]: getDirection(sortDirection),
      })
      .skip(getSkip(getPageNumber(pageNumber), getPageSize(pageSize)))
      .limit(getPageSize(pageSize));
    return {
      pagesCount: pagesCountOfBlogs(calculateOfFiles, pageSize),
      page: getPageNumber(pageNumber),
      pageSize: getPageSize(pageSize),
      totalCount: calculateOfFiles,
      items: usersMapping(foundUsers),
    };
  }
  // async getUserInfo(id: string): Promise<MeViewModel | null> {
  //   const user = await UserModelClass.findOne({ _id: new ObjectId(id) });
  //   if (!user) {
  //     return null;
  //   }
  //   return {
  //     email: user.email,
  //     login: user.login,
  //     userId: user._id.toString(),
  //   };
  // },
}
