import { Transform } from 'class-transformer';
import { IsEmail, IsOptional } from 'class-validator';

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
