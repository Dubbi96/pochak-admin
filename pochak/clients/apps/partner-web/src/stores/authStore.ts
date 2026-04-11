import axios from 'axios'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { api } from '@/lib/api'

interface LoginResponse {
  accessToken: string
  refreshToken: string
  data?: { accessToken: string; refreshToken: string }
}

export type LoginErrorCode = 'invalid_credentials' | 'network_error' | 'server_error'
export type LoginResult = { ok: true } | { ok: false; errorCode: LoginErrorCode }

interface AuthState {
  token: string | null
  refreshToken: string | null
  partner: { id: string; name: string; email: string } | null
  _hasHydrated: boolean
  setHasHydrated: (value: boolean) => void
  login: (email: string, password: string) => Promise<LoginResult>
  setAuth: (token: string, refreshToken: string, partner: { id: string; name: string; email: string }) => void
  logout: () => void
  isAuthenticated: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      refreshToken: null,
      partner: null,
      _hasHydrated: false,
      setHasHydrated: (value) => set({ _hasHydrated: value }),
      login: async (email: string, password: string): Promise<LoginResult> => {
        try {
          const res = await api.post<LoginResponse>('/api/v1/auth/login', { email, password })
          const payload = res.data
          const tokens = payload && typeof payload === 'object' && 'data' in payload ? payload.data! : payload
          if (!tokens?.accessToken) return { ok: false, errorCode: 'server_error' }
          set({
            token: tokens.accessToken,
            refreshToken: tokens.refreshToken ?? '',
            partner: { id: '', name: email, email },
          })
          return { ok: true }
        } catch (err) {
          if (axios.isAxiosError(err)) {
            const status = err.response?.status
            if (status === 401 || status === 400) return { ok: false, errorCode: 'invalid_credentials' }
            if (!err.response) return { ok: false, errorCode: 'network_error' }
          }
          return { ok: false, errorCode: 'server_error' }
        }
      },
      setAuth: (token, refreshToken, partner) => set({ token, refreshToken, partner }),
      logout: () => set({ token: null, refreshToken: null, partner: null }),
      isAuthenticated: () => !!get().token,
    }),
    {
      name: 'pochak-partner-auth',
      partialize: (state) => ({
        token: state.token,
        refreshToken: state.refreshToken,
        partner: state.partner,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    },
  ),
)
