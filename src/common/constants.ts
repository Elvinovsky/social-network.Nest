export enum SortDirection {
  Asc = 1,
  Desc = -1,
}

export enum Status {
  None = 'None',
  Like = 'Like',
  Dislike = 'Dislike',
}

export enum BanStatus {
  Banned = 'banned',
  NotBanned = 'notBanned',
}
export const DEFAULT_PAGE_SortBy = 'addedAt';
export const DEFAULT_PAGE_NUMBER = 1;
export const DEFAULT_PAGE_SIZE = 10;
