import axios, { type InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/stores/authStore'

const GATEWAY_URL = import.meta.env.VITE_GATEWAY_URL || 'http://localhost:8080'

export const api = axios.create({
  baseURL: GATEWAY_URL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

type QueueEntry = { resolve: (token: string) => void; reject: (err: unknown) => void }
let isRefreshing = false
let failedQueue: QueueEntry[] = []

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (token) resolve(token)
    else reject(error)
  })
  failedQueue = []
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    const isAuthEndpoint = originalRequest.url?.includes('/api/v1/auth/')
    if (error.response?.status !== 401 || originalRequest._retry || isAuthEndpoint) {
      return Promise.reject(error)
    }

    const { refreshToken, setAuth, logout } = useAuthStore.getState()

    if (!refreshToken) {
      logout()
      window.location.href = '/login'
      return Promise.reject(error)
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`
        return api(originalRequest)
      })
    }

    originalRequest._retry = true
    isRefreshing = true

    try {
      const res = await axios.post<{ data: { accessToken: string; refreshToken: string } }>(
        `${GATEWAY_URL}/api/v1/auth/refresh`,
        { refreshToken },
        { headers: { 'Content-Type': 'application/json' } },
      )
      const { accessToken: newAccess, refreshToken: newRefresh } = res.data.data
      const { partner } = useAuthStore.getState()
      setAuth(newAccess, newRefresh, partner!)
      processQueue(null, newAccess)
      originalRequest.headers.Authorization = `Bearer ${newAccess}`
      return api(originalRequest)
    } catch (err) {
      processQueue(err, null)
      logout()
      window.location.href = '/login'
      return Promise.reject(err)
    } finally {
      isRefreshing = false
    }
  },
)

export async function get<T>(path: string, params?: Record<string, string>): Promise<T | null> {
  try {
    const res = await api.get<{ data: T }>(path, { params })
    const body = res.data
    return body && typeof body === 'object' && 'data' in body ? body.data : (res.data as unknown as T)
  } catch {
    return null
  }
}

export async function post<T>(path: string, body?: unknown): Promise<T | null> {
  try {
    const res = await api.post<{ data: T }>(path, body)
    const payload = res.data
    return payload && typeof payload === 'object' && 'data' in payload ? payload.data : (res.data as unknown as T)
  } catch {
    return null
  }
}

export async function put<T>(path: string, body?: unknown): Promise<T | null> {
  try {
    const res = await api.put<{ data: T }>(path, body)
    const payload = res.data
    return payload && typeof payload === 'object' && 'data' in payload ? payload.data : (res.data as unknown as T)
  } catch {
    return null
  }
}
