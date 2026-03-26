import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AdminRole = 'MASTER_BO' | 'CONTENT_MANAGER' | 'MEMBER_MANAGER' | 'VIEWER';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  loginId?: string;
  permissions?: string[];
}

interface AuthState {
  token: string | null;
  user: AdminUser | null;
  isAuthenticated: boolean;
  login: (token: string, user: AdminUser) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      login: (token: string, user: AdminUser) =>
        set({ token, user, isAuthenticated: true }),
      logout: () =>
        set({ token: null, user: null, isAuthenticated: false }),
    }),
    {
      name: "pochak-admin-auth",
    }
  )
);
