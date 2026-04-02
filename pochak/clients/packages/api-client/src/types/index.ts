/**
 * Standard API response envelope (ROADMAP 12.3).
 * All successful responses from the Pochak API are wrapped in this structure.
 */
export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
  timestamp: string;
}

/**
 * Paginated response envelope (ROADMAP 12.4).
 * Used for list endpoints that support cursor/offset pagination.
 */
export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

/**
 * Error detail for field-level validation errors.
 */
export interface ErrorDetail {
  field: string;
  message: string;
  rejectedValue?: unknown;
}

/**
 * Standard error response envelope.
 * Returned by the API for 4xx / 5xx responses.
 */
export interface ErrorResponse {
  code: string;
  message: string;
  status: number;
  details?: ErrorDetail[];
  timestamp?: string;
  path?: string;
  correlationId?: string;
}
