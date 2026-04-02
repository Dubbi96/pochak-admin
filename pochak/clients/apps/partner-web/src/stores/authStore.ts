import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  token: string | null
  refreshToken: string | null
  partner: { id: string; name: string; email: string } | null
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
      setAuth: (token, refreshToken, partner) => set({ token, refreshToken, partner }),
      logout: () => set({ token: null, refreshToken: null, partner: null }),
      isAuthenticated: () => !!get().token,
    }),
    { name: 'pochak-partner-auth' },
  ),
)
