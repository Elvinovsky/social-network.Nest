import {
  DEFAULT_PAGE_NUMBER,
  DEFAULT_PAGE_SIZE,
  DEFAULT_PAGE_SortBy,
  SortDirection,
} from '../common/constants';

export const getPageNumber = (pageNumber?: number): number => {
  return pageNumber ? +pageNumber : DEFAULT_PAGE_NUMBER;
};
export const getPageSize = (pageSize?: number): number => {
  return pageSize ? +pageSize : DEFAULT_PAGE_SIZE;
};
export const getSortBy = (sortBy?: string): string => {
  return sortBy ? sortBy : DEFAULT_PAGE_SortBy;
};
export const getDirection = (sortDirection?: string) => {
  return sortDirection?.toLowerCase() === 'asc'
    ? SortDirection.Asc
    : SortDirection.Desc;
};
export const getSkip = (pageNumber = 1, pageSize = 10): number => {
  return (+pageNumber - 1) * +pageSize;
};
export const pagesCounter = (
  calculateOfFiles: number,
  pageSize?: number,
): number => {
  return Math.ceil(calculateOfFiles / getPageSize(pageSize));
};
