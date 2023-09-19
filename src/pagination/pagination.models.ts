import { Transform } from 'class-transformer';
import { IsEmail, IsOptional } from 'class-validator';
import {
  BanStatus,
  DEFAULT_PAGE_NUMBER,
  DEFAULT_PAGE_SIZE,
  DEFAULT_PAGE_SortBy,
  SortDirection,
} from '../common/constants';

export type PaginatorType<T> = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: T;
};

export class QueryInputModel {
  @IsOptional()
  @Transform(({ value }) =>
    Number(value) > 0 ? Number(value) : DEFAULT_PAGE_NUMBER,
  )
  pageNumber: number;

  @IsOptional()
  @Transform(({ value }) =>
    Number(value) > 0 ? Number(value) : DEFAULT_PAGE_SIZE,
  )
  pageSize: number;

  @IsOptional()
  @Transform(({ value }) => (value ? value : DEFAULT_PAGE_SortBy))
  sortBy: string;

  @IsOptional()
  @Transform(({ value }) =>
    value === 'asc' ? SortDirection.Asc : SortDirection.Desc,
  )
  sortDirection: string;
}

export class QueryBanStatus {
  @IsOptional()
  @Transform(({ value }) =>
    value === BanStatus.Banned ? BanStatus.Banned : BanStatus.NotBanned,
  )
  banStatus: string;
}

export class SearchNameTerm {
  @IsOptional()
  searchNameTerm: string;
}
export class SearchTitleTerm {
  @IsOptional()
  searchTitleTerm: string;
}
export class SearchEmailTerm {
  @IsOptional()
  @IsEmail()
  searchEmailTerm: string;
}
export class SearchLoginTerm {
  @IsOptional()
  searchLoginTerm: string;
}
