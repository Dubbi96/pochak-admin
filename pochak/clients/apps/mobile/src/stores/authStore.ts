import {create} from 'zustand';
import {createJSONStorage, persist} from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface User {
  id: string;
  email: string;
  nickname: string;
  profileImageUrl?: string;
}

export type MemberStatus =
  | 'UNVERIFIED'
  | 'GUEST'
  | 'ACTIVE'
  | 'DORMANT_WARNING'
  | 'DORMANT'
  | 'BLOCKED'
  | 'WITHDRAWN';

interface AuthState {
  isLoggedIn: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  memberStatus: MemberStatus | null;

  /**
   * Temporary signup form data that persists across signup steps.
   * NOT persisted to AsyncStorage — cleared on app restart or explicit clear.
   */
  signupFormData: Record<string, any>;

  /** Legacy login (kept for backward compat) — sets accessToken + user */
  login: (token: string, user: User) => void;
  /** Set both tokens at once (used by API client refresh flow) */
  setTokens: (accessToken: string, refreshToken: string) => void;
  /** Update member status from API or local check */
  setMemberStatus: (status: MemberStatus) => void;
  /** Set a single key in the signup form data */
  setSignupFormData: (key: string, value: any) => void;
  /** Clear all signup form data */
  clearSignupFormData: () => void;
  /** Clear all auth state */
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isLoggedIn: false,
      accessToken: null,
      refreshToken: null,
      user: null,
      memberStatus: null,
      signupFormData: {},

      login: (token: string, user: User) =>
        set({
          isLoggedIn: true,
          accessToken: token,
          user,
        }),

      setTokens: (accessToken: string, refreshToken: string) =>
        set({
          accessToken,
          refreshToken,
          isLoggedIn: true,
        }),

      setMemberStatus: (status: MemberStatus) =>
        set({ memberStatus: status }),

      setSignupFormData: (key: string, value: any) =>
        set((state) => ({
          signupFormData: { ...state.signupFormData, [key]: value },
        })),

      clearSignupFormData: () =>
        set({ signupFormData: {} }),

      logout: () =>
        set({
          isLoggedIn: false,
          accessToken: null,
          refreshToken: null,
          user: null,
          memberStatus: null,
          signupFormData: {},
        }),
    }),
    {
      name: 'pochak-auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        isLoggedIn: state.isLoggedIn,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
        memberStatus: state.memberStatus,
        // signupFormData is intentionally excluded — ephemeral, not persisted
      }),
    },
  ),
);
