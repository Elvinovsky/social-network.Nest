import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PaginatorType } from '../../../../infrastructure/pagination/pagination.models';
import { MeViewModel, UserViewDTO } from '../../../dto/view/user-view.models';
import { usersMapping, usersMappingSA } from '../../helpers/user.helpers';
import {
  getPageNumber,
  getPageSize,
  getSkip,
  getSortBy,
  pagesCounter,
} from '../../../../infrastructure/pagination/pagination.helpers';
import { InjectRepository } from '@nestjs/typeorm';
import {
  BanInfoTypeOrmEntity,
  EmailConfirmTypeOrmEntity,
  UserTypeOrmEntity,
} from '../../../entities/typeorm/user-sql.schemas';
import { Repository } from 'typeorm';
import { UserCreateDTO } from '../../../dto/create/users-create.models';
import { IUserQueryRepository } from '../../../../infrastructure/repositoriesModule/repositories.module';

@Injectable()
export class UsersTypeormQueryRepo implements IUserQueryRepository {
  constructor(
    @InjectRepository(UserTypeOrmEntity)
    protected usersRepo: Repository<UserTypeOrmEntity>,

    @InjectRepository(BanInfoTypeOrmEntity)
    protected banRepo: Repository<BanInfoTypeOrmEntity>,

    @InjectRepository(EmailConfirmTypeOrmEntity)
    protected emailRepo: Repository<EmailConfirmTypeOrmEntity>,
  ) {}

  async getSortedUsers(
    pageNumber: number,
    pageSize: number,
    sortBy: string,
    sortDirection: string,
    searchEmailTerm?: string,
    searchLoginTerm?: string,
  ): Promise<PaginatorType<UserViewDTO[]>> {
    try {
      const getEmailTerm = (searchEmailTerm?: string): string =>
        searchEmailTerm ? `%${searchEmailTerm}%` : `%%`;

      const getLoginTerm = (searchLoginTerm?: string): string =>
        searchLoginTerm ? `%${searchLoginTerm}%` : `%%`;

      const sortDirectionSQL = (sortDirection?: string) =>
        sortDirection?.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

      const queryBuilder = this.usersRepo
        .createQueryBuilder('u')
        .where('(u.login ILIKE :login OR u.email ILIKE :email)', {
          login: getLoginTerm(searchLoginTerm),
          email: getEmailTerm(searchEmailTerm),
        })
        .orderBy('u.' + getSortBy(sortBy), sortDirectionSQL(sortDirection))
        .offset(getSkip(pageNumber, pageSize))
        .limit(pageSize);

      const [foundUsers, calculateOfFiles] = await Promise.all([
        queryBuilder.getMany(),
        queryBuilder.getCount(),
      ]);

      return {
        pagesCount: pagesCounter(calculateOfFiles, pageSize),
        page: getPageNumber(pageNumber),
        pageSize: getPageSize(pageSize),
        totalCount: calculateOfFiles,
        items: usersMapping(foundUsers as UserCreateDTO[]),
      };
    } catch (e) {
      console.log(e);
      throw new Error();
    }
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
      const banFilter = (banStatus: string) => {
        return banStatus === 'banned' ? true : false;
      };

      const getEmailTerm = (searchEmailTerm?: string): string =>
        searchEmailTerm ? `%${searchEmailTerm}%` : `%%`;

      const getLoginTerm = (searchLoginTerm?: string): string =>
        searchLoginTerm ? `%${searchLoginTerm}%` : `%%`;

      const sortDirectionSQL = (sortDirection?: string) =>
        sortDirection?.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

      const queryBuilder = this.usersRepo
        .createQueryBuilder('u')
        //.leftJoin('u.banInfo', 'b')
        // .leftJoin('u.emailConfirmation', 'e')
        .where('(u.login ILIKE :login OR u.email ILIKE :email)', {
          login: getLoginTerm(searchLoginTerm),
          email: getEmailTerm(searchEmailTerm),
        })
        //.andWhere('b.isBanned = :isBanned', { isBanned: banFilter(banStatus) })
        .orderBy('u.' + getSortBy(sortBy), sortDirectionSQL(sortDirection))
        .offset(getSkip(pageNumber, pageSize))
        .limit(pageSize);

      console.log(queryBuilder.getSql());

      const [foundUsers, calculateOfFiles] = await Promise.all([
        queryBuilder.getMany(),
        queryBuilder.getCount(),
      ]);

      console.log(foundUsers);

      return {
        pagesCount: pagesCounter(calculateOfFiles, pageSize),
        page: getPageNumber(pageNumber),
        pageSize: getPageSize(pageSize),
        totalCount: calculateOfFiles,
        items: usersMappingSA(foundUsers as UserCreateDTO[]),
      };
    } catch (e) {
      console.log(e);
      throw new Error();
    }
  }

  async getUserInfo(id: string): Promise<MeViewModel | null> {
    const user = await this.usersRepo.findOneBy({ id: id });
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
