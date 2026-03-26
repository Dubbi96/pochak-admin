export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

export interface PageRequest {
  page: number;
  size: number;
  sort?: string;
  direction?: "ASC" | "DESC";
}
