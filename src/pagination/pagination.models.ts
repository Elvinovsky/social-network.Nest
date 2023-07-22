export type PaginatorType<T> = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: T;
};

export class QueryInputModel {
  // todo cltkfnm hfpj,hfnmcz
  pageNumber: number;

  pageSize: number;

  sortBy: string;

  sortDirection: string;
}
export type SearchNameTerm = { searchNameTerm?: string };
export type SearchTitleTerm = { searchTitleTerm?: string };
export type SearchEmailTerm = { searchEmailTerm?: string };
export type SearchLoginTerm = { searchLoginTerm?: string };
