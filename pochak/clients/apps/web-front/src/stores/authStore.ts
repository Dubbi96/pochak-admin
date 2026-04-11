import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { pochakApi } from '@/services/api-client'

interface User {
  id: number
  nickname: string
  email: string
  avatar?: string
}

interface AuthState {
  token: string | null
  refreshToken: string | null
  user: User | null
  isLoggedIn: () => boolean
  login: (loginId: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  updateUser: (partial: Partial<User>) => void
  setTokens: (token: string, refreshToken: string) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      refreshToken: null,
      user: null,

      isLoggedIn: () => !!get().token && !!get().user,

      login: async (loginId: string, password: string) => {
        const res = await pochakApi.post<{
          accessToken: string
          refreshToken: string
          user: User
        }>('/api/v1/auth/login', { loginId, password })

        if (!res) return false

        set({
          token: res.accessToken,
          refreshToken: res.refreshToken,
          user: res.user,
        })
        return true
      },

      logout: async () => {
        await pochakApi.post('/api/v1/auth/logout')
        set({ token: null, refreshToken: null, user: null })
      },

      updateUser: (partial: Partial<User>) => {
        const current = get().user
        if (current) {
          set({ user: { ...current, ...partial } })
        }
      },

      setTokens: (token: string, refreshToken: string) => {
        set({ token, refreshToken })
      },
    }),
    {
      name: 'pochak-auth',
      partialize: (state) => ({
        token: state.token,
        refreshToken: state.refreshToken,
        user: state.user,
      }),
    },
  ),
)
