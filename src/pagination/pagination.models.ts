import { Transform } from 'class-transformer';
import { IsOptional, Matches } from 'class-validator';

export type PaginatorType<T> = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: T;
};

export class QueryInputModel {
  @IsOptional()
  @Transform((value) => Number(value))
  pageNumber: number;

  @IsOptional()
  @Transform((value) => Number(value))
  pageSize: number;

  @IsOptional()
  sortBy: string;

  @IsOptional()
  sortDirection: string;
}
export class QueryBanStatus {
  @IsOptional()
  @Matches(/^banned$|^notBanned$/)
  banStatus: string;
}

export type SearchNameTerm = { searchNameTerm?: string };
export type SearchTitleTerm = { searchTitleTerm?: string };
export type SearchEmailTerm = { searchEmailTerm?: string };
export type SearchLoginTerm = { searchLoginTerm?: string };
