export type PaginatorType<T> = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: T;
};
export type QueryInputModel = {
  pageNumber: string;
  pageSize: string;
  sortBy: string;
  sortDirection: string;
};
export type SearchNameTerm = { searchNameTerm?: string };
export type SearchTitleTerm = { searchTitleTerm?: string };
export type SearchEmailTerm = { searchEmailTerm?: string };
export type SearchLoginTerm = { searchLoginTerm?: string };
