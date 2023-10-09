import { Transform } from 'class-transformer';
import { IsOptional } from 'class-validator';
import {
  BanStatus,
  DEFAULT_PAGE_NUMBER,
  DEFAULT_PAGE_SIZE,
  DEFAULT_PAGE_SortBy,
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
  pageNumber = 1;

  @IsOptional()
  @Transform(({ value }) =>
    Number(value) > 0 ? Number(value) : DEFAULT_PAGE_SIZE,
  )
  pageSize = 10;

  @IsOptional()
  @Transform(({ value }) => (value ? value : DEFAULT_PAGE_SortBy))
  sortBy: string = DEFAULT_PAGE_SortBy;

  @IsOptional()
  @Transform(({ value }) => (value === 'asc' ? 'asc' : 'desc'))
  sortDirection = 'desc';
}

export class QueryBanStatus {
  @IsOptional()
  @Transform(({ value }) =>
    value === BanStatus.Banned ? BanStatus.Banned : BanStatus.NotBanned,
  )
  banStatus: BanStatus.NotBanned;
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
  searchEmailTerm: string;
}
export class SearchLoginTerm {
  @IsOptional()
  searchLoginTerm: string;
}
