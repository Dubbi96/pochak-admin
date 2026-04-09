import axios from 'axios'
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

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout()
      window.location.href = '/login'
    }
    return Promise.reject(error)
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
