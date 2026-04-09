import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { post } from '@/lib/api'

interface LoginResponse {
  accessToken: string
  refreshToken: string
}

interface AuthState {
  token: string | null
  refreshToken: string | null
  partner: { id: string; name: string; email: string } | null
  _hasHydrated: boolean
  setHasHydrated: (value: boolean) => void
  login: (email: string, password: string) => Promise<boolean>
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
      login: async (email: string, password: string) => {
        const result = await post<LoginResponse>('/api/v1/auth/login', { email, password })
        if (!result?.accessToken) return false
        set({
          token: result.accessToken,
          refreshToken: result.refreshToken ?? '',
          partner: { id: '', name: email, email },
        })
        return true
      },
      setAuth: (token, refreshToken, partner) => set({ token, refreshToken, partner }),
      logout: () => set({ token: null, refreshToken: null, partner: null }),
      isAuthenticated: () => !!get().token,
    }),
    {
      name: 'pochak-partner-auth',
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    },
  ),
)
