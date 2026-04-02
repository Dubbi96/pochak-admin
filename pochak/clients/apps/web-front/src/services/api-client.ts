/**
 * Pochak Web API Client
 * Configures the shared @pochak/api-client with the web-front token provider
 * and exposes a convenient pochakApi wrapper.
 */

import { createApiClient, setTokenProvider } from '@pochak/api-client'

export const GATEWAY_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GATEWAY_URL) || 'http://localhost:8080'

const AUTH_STORAGE_KEY = 'pochak-auth'

// ── Token provider for @pochak/api-client ────────────────

setTokenProvider({
  getAccessToken() {
    try {
      const stored = JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY) || '{}')
      return stored?.state?.token || null
    } catch {
      return null
    }
  },
  getRefreshToken() {
    try {
      const stored = JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY) || '{}')
      return stored?.state?.refreshToken || null
    } catch {
      return null
    }
  },
  onTokenRefreshed(accessToken: string, refreshToken: string) {
    try {
      const raw = localStorage.getItem(AUTH_STORAGE_KEY) || '{}'
      const stored = JSON.parse(raw)
      if (stored.state) {
        stored.state.token = accessToken
        stored.state.refreshToken = refreshToken
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(stored))
      }
    } catch { /* ignore */ }
  },
  onAuthError() {
    localStorage.removeItem(AUTH_STORAGE_KEY)
  },
})

// ── Shared Axios instance with baseURL ───────────────────

export const axiosClient = createApiClient({ baseURL: GATEWAY_URL })

// ── Convenience wrapper (returns T | null) ───────────────

export const pochakApi = {
  async get<T>(path: string, params?: Record<string, string>): Promise<T | null> {
    try {
      const res = await axiosClient.get<T>(path, { params })
      // The shared api-client response interceptor passes through AxiosResponse.
      // The BFF wraps responses in { data: T } envelope — Axios also wraps in .data,
      // so res.data is ApiResponse<T> and res.data.data is T.
      const body = res.data as Record<string, unknown>
      return (body && typeof body === 'object' && 'data' in body ? body.data : res.data) as T
    } catch {
      return null
    }
  },

  async post<T>(path: string, body?: unknown): Promise<T | null> {
    try {
      const res = await axiosClient.post<T>(path, body)
      const payload = res.data as Record<string, unknown>
      return (payload && typeof payload === 'object' && 'data' in payload ? payload.data : res.data) as T
    } catch {
      return null
    }
  },

  async put<T>(path: string, body?: unknown): Promise<T | null> {
    try {
      const res = await axiosClient.put<T>(path, body)
      const payload = res.data as Record<string, unknown>
      return (payload && typeof payload === 'object' && 'data' in payload ? payload.data : res.data) as T
    } catch {
      return null
    }
  },

  async delete<T>(path: string): Promise<T | null> {
    try {
      const res = await axiosClient.delete<T>(path)
      const payload = res.data as Record<string, unknown>
      return (payload && typeof payload === 'object' && 'data' in payload ? payload.data : res.data) as T
    } catch {
      return null
    }
  },
}
