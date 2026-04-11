import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

/**
 * API client for Pochak gateway.
 *
 * Migration notes:
 * - GATEWAY_URL will point to production gateway when deployed
 * - JWT interceptor auto-attaches token from authStore
 * - 401 responses trigger automatic token refresh
 * - All domain services use this client for HTTP calls
 */

const GATEWAY_URL = __DEV__ ? 'http://localhost:8080' : 'https://api.pochak.co.kr';

const apiClient = axios.create({
  baseURL: `${GATEWAY_URL}/api/v1`,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// JWT interceptor — attaches access token to every request
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — handles 401 with token refresh
// Uses _retry flag to prevent infinite refresh loops
apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = useAuthStore.getState().refreshToken;
      if (refreshToken) {
        try {
          const res = await axios.post(`${GATEWAY_URL}/api/v1/auth/refresh`, { refreshToken });
          const payload = res.data?.data ?? res.data;
          useAuthStore.getState().setTokens(payload.accessToken, payload.refreshToken);
          originalRequest.headers.Authorization = `Bearer ${payload.accessToken}`;
          return apiClient(originalRequest);
        } catch {
          useAuthStore.getState().logout();
        }
      } else {
        useAuthStore.getState().logout();
      }
    }
    return Promise.reject(error);
  }
);

export { GATEWAY_URL };
export default apiClient;
