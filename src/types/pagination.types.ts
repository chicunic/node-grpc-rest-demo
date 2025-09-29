export interface PaginationQuery {
  page: number;
  pageSize: number;
}

export interface PaginationResponse {
  page: number;
  pageSize: number;
  totalCount: number;
}
