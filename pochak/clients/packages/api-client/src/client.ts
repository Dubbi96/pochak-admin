import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
  type AxiosResponse,
  type AxiosError,
} from "axios";
import type { ApiResponse, ErrorResponse } from "./types";

/**
 * Generate a unique correlation ID for request tracing.
 * Format: pochak-<timestamp>-<random>
 */
function generateCorrelationId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `pochak-${timestamp}-${random}`;
}

/**
 * Retrieve the stored JWT access token.
 * Platform-specific storage should override this via setTokenProvider().
 */
let getAccessToken: () => string | null = () => null;
let getRefreshToken: () => string | null = () => null;
let onTokenRefreshed: (accessToken: string, refreshToken: string) => void =
  () => {};
let onAuthError: () => void = () => {};

export interface TokenProvider {
  getAccessToken: () => string | null;
  getRefreshToken: () => string | null;
  onTokenRefreshed: (accessToken: string, refreshToken: string) => void;
  onAuthError: () => void;
}

export function setTokenProvider(provider: TokenProvider): void {
  getAccessToken = provider.getAccessToken;
  getRefreshToken = provider.getRefreshToken;
  onTokenRefreshed = provider.onTokenRefreshed;
  onAuthError = provider.onAuthError;
}

/**
 * Create an Axios instance with Pochak interceptors:
 * - JWT Authorization header
 * - X-Correlation-ID for distributed tracing
 * - Standardized error handling (ROADMAP 12.3 / 12.4)
 */
export function createApiClient(config?: AxiosRequestConfig): AxiosInstance {
  const instance = axios.create({
    timeout: 15_000,
    headers: {
      "Content-Type": "application/json",
    },
    ...config,
  });

  // ---- Request interceptor ----
  instance.interceptors.request.use(
    (req: InternalAxiosRequestConfig) => {
      // Attach JWT bearer token
      const token = getAccessToken();
      if (token && req.headers) {
        req.headers.Authorization = `Bearer ${token}`;
      }

      // Attach correlation ID for tracing
      if (req.headers) {
        req.headers["X-Correlation-ID"] = generateCorrelationId();
      }

      return req;
    },
    (error) => Promise.reject(error),
  );

  // ---- Response interceptor ----
  instance.interceptors.response.use(
    (response: AxiosResponse<ApiResponse<unknown>>) => response,
    async (error: AxiosError<ErrorResponse>) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & {
        _retry?: boolean;
      };

      // Handle 401 – attempt silent token refresh once
      if (
        error.response?.status === 401 &&
        originalRequest &&
        !originalRequest._retry
      ) {
        originalRequest._retry = true;

        const refreshToken = getRefreshToken();
        if (refreshToken) {
          try {
            const refreshResponse = await axios.post<
              ApiResponse<{ accessToken: string; refreshToken: string }>
            >(
              `${originalRequest.baseURL ?? ""}/api/v1/auth/refresh`,
              { refreshToken },
              { headers: { "Content-Type": "application/json" } },
            );

            const { accessToken, refreshToken: newRefreshToken } =
              refreshResponse.data.data;
            onTokenRefreshed(accessToken, newRefreshToken);

            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            }
            return instance(originalRequest);
          } catch {
            onAuthError();
            return Promise.reject(error);
          }
        } else {
          onAuthError();
        }
      }

      // Normalise error payload
      const errorResponse: ErrorResponse = error.response?.data ?? {
        code: "NETWORK_ERROR",
        message: error.message || "An unexpected network error occurred",
        status: error.response?.status ?? 0,
      };

      return Promise.reject(errorResponse);
    },
  );

  return instance;
}

/**
 * Default singleton API client.
 * Apps should call `setTokenProvider()` before making authenticated requests.
 */
export const apiClient = createApiClient();
