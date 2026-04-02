export type SortDirection = "ASC" | "DESC";

export interface PageRequest {
  page: number;
  size: number;
  sort?: string;
  direction?: SortDirection;
}

export interface DateRange {
  startDate: string;
  endDate: string;
}
