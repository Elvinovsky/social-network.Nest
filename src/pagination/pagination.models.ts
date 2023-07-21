import { IsNotEmpty } from 'class-validator';

export type PaginatorType<T> = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: T;
};

export class QueryInputModel {
  // todo трансфорп намбер
  @IsNotEmpty()
  pageNumber: string;
  @IsNotEmpty()
  pageSize: string;
  @IsNotEmpty()
  sortBy: string;
  @IsNotEmpty()
  sortDirection: string;
}
export type SearchNameTerm = { searchNameTerm?: string };
export type SearchTitleTerm = { searchTitleTerm?: string };
export type SearchEmailTerm = { searchEmailTerm?: string };
export type SearchLoginTerm = { searchLoginTerm?: string };
