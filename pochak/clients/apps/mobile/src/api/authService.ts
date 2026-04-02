import axios from 'axios';
import apiClient, { GATEWAY_URL } from './client';
import { useAuthStore, User } from '../stores/authStore';

// ─── Request/Response types ───────────────────────────────────────

export interface SignInRequest {
  loginId: string;
  password: string;
}

export interface SignInResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

/** @deprecated Use SignupData for new signup flows */
export interface SignUpData {
  email: string;
  password: string;
  nickname: string;
  phoneNumber?: string;
  termsAgreed?: boolean;
  marketingAgreed?: boolean;
}

export type SignupRoute = 'DOMESTIC_ADULT' | 'DOMESTIC_MINOR' | 'SNS' | 'FOREIGN';

export interface ConsentItem {
  termId: number;
  agreed: boolean;
}

export interface MarketingChannels {
  sms: boolean;
  email: boolean;
  push: boolean;
  nightPush: boolean;
}

export interface SignupPreferences {
  areas?: Array<{ code: string; name: string }>;
  sports?: Array<{ id: number; name: string }>;
  usagePurpose?: string;
}

export interface SignupData {
  route: SignupRoute;
  phoneVerifiedToken?: string;
  guardianVerifiedToken?: string;
  emailVerifiedToken?: string;
  loginId?: string;
  password?: string;
  email?: string;
  name?: string;
  birthday?: string;
  nationality?: string;
  consents: ConsentItem[];
  marketingChannels?: MarketingChannels;
  preferences?: SignupPreferences;
  // SNS specific
  provider?: string;
  providerKey?: string;
}

export interface SignUpResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface ProfileResponse {
  user: User;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

// ─── Extensible interface ─────────────────────────────────────────
// Future migration: swap AuthService to call pochak-identity service.
// All auth flows (social login, OAuth, etc.) can be added by extending
// this interface without breaking existing code.

export interface IAuthService {
  /** Sign in with loginId (email) and password */
  signIn(loginId: string, password: string): Promise<SignInResponse>;
  /** Register a new account (legacy simple flow) */
  signUp(data: SignUpData | SignupData): Promise<SignUpResponse>;
  /** Check if loginId or email is already taken */
  checkDuplicate(field: 'loginId' | 'email', value: string): Promise<boolean>;
  /** Refresh access token */
  refreshToken(refreshToken: string): Promise<RefreshTokenResponse>;
  /** Get current user profile */
  getProfile(): Promise<ProfileResponse>;
  /** Sign out (invalidate tokens server-side) */
  signOut(): Promise<void>;
  /** Link a social account to an existing account found via phone verification */
  linkSocialAccount(
    phoneVerifiedToken: string,
    provider: string,
    providerKey: string,
  ): Promise<TokenResponse>;
}

// ─── Mock data ────────────────────────────────────────────────────

const mockUser: User = {
  id: 'mock-user-1',
  email: 'pochak@example.com',
  nickname: '포착유저',
  profileImageUrl: 'https://via.placeholder.com/100x100/1E1E1E/00C853?text=P',
};

// ─── Route-specific endpoint mapping ──────────────────────────────

const SIGNUP_ENDPOINTS: Record<SignupRoute, string> = {
  DOMESTIC_ADULT: '/auth/signup',
  DOMESTIC_MINOR: '/auth/signup/minor',
  SNS: '/auth/signup/social',
  FOREIGN: '/auth/signup/foreign',
};

/**
 * Build the request body for each signup route, sending only the
 * fields relevant to that route.
 */
function buildSignupPayload(data: SignupData): Record<string, unknown> {
  const common = {
    consents: data.consents,
    marketingChannels: data.marketingChannels,
    preferences: data.preferences,
    name: data.name,
    birthday: data.birthday,
    email: data.email,
  };

  switch (data.route) {
    case 'DOMESTIC_ADULT':
      return {
        ...common,
        phoneVerifiedToken: data.phoneVerifiedToken,
        loginId: data.loginId,
        password: data.password,
      };

    case 'DOMESTIC_MINOR':
      return {
        ...common,
        phoneVerifiedToken: data.phoneVerifiedToken,
        guardianVerifiedToken: data.guardianVerifiedToken,
        loginId: data.loginId,
        password: data.password,
      };

    case 'SNS':
      return {
        ...common,
        phoneVerifiedToken: data.phoneVerifiedToken,
        provider: data.provider,
        providerKey: data.providerKey,
      };

    case 'FOREIGN':
      return {
        ...common,
        emailVerifiedToken: data.emailVerifiedToken,
        loginId: data.loginId,
        password: data.password,
        nationality: data.nationality,
      };

    default:
      return common;
  }
}

/**
 * Type guard: check whether the incoming data uses the new SignupData
 * shape (has `route` field) vs the legacy SignUpData shape.
 */
function isNewSignupData(data: SignUpData | SignupData): data is SignupData {
  return 'route' in data && typeof (data as SignupData).route === 'string';
}

// ─── Concrete implementation ──────────────────────────────────────

class AuthService implements IAuthService {
  async signIn(loginId: string, password: string): Promise<SignInResponse> {
    try {
      const res = await apiClient.post('/auth/login', { email: loginId, password });
      const data = res.data.data ?? res.data;
      return {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        user: data.user ?? { id: 'api-user', email: loginId, nickname: loginId },
      };
    } catch (e: any) {
      if (e.response?.status === 401) {
        throw new Error('아이디 또는 비밀번호가 올바르지 않습니다');
      }
      // Fallback to mock for dev
      console.warn('[Auth] API unavailable, using mock');
      return {
        accessToken: 'mock-token',
        refreshToken: 'mock-refresh',
        user: { id: '1', nickname: loginId, email: `${loginId}@pochak.co.kr` },
      };
    }
  }

  async signUp(data: SignUpData | SignupData): Promise<SignUpResponse> {
    // ── New multi-route signup ──
    if (isNewSignupData(data)) {
      return this._signUpByRoute(data);
    }

    // ── Legacy simple signup (backward compat) ──
    return this._signUpLegacy(data);
  }

  // ── New signup flow ──────────────────────────────────────────────
  private async _signUpByRoute(data: SignupData): Promise<SignUpResponse> {
    const endpoint = SIGNUP_ENDPOINTS[data.route];
    const payload = buildSignupPayload(data);

    try {
      const res = await apiClient.post(endpoint, payload);
      const resData = res.data.data ?? res.data;

      const result: SignUpResponse = {
        accessToken: resData.accessToken,
        refreshToken: resData.refreshToken,
        user: resData.user ?? {
          id: 'api-user',
          email: data.email ?? '',
          nickname: data.name ?? '',
        },
      };

      // Persist tokens + user in store
      const store = useAuthStore.getState();
      store.setTokens(result.accessToken, result.refreshToken);

      return result;
    } catch (e: any) {
      if (e.response?.data?.code === 'DUPLICATE') {
        throw new Error(e.response.data.message ?? '이미 등록된 계정입니다');
      }
      if (e.response?.data?.code === 'GUARDIAN_MAX_MINORS') {
        throw new Error('보호자 계정의 미성년 등록 한도를 초과했습니다');
      }

      // Mock fallback for dev
      console.warn(`[Auth] Signup (${data.route}) API unavailable, using mock`);
      const mockResult: SignUpResponse = {
        accessToken: 'mock-token',
        refreshToken: 'mock-refresh',
        user: {
          id: `mock-${Date.now()}`,
          email: data.email ?? '',
          nickname: data.name ?? data.loginId ?? '',
        },
      };

      const store = useAuthStore.getState();
      store.setTokens(mockResult.accessToken, mockResult.refreshToken);

      return mockResult;
    }
  }

  // ── Legacy signup flow ───────────────────────────────────────────
  private async _signUpLegacy(data: SignUpData): Promise<SignUpResponse> {
    try {
      const res = await apiClient.post('/auth/signup', {
        email: data.email,
        password: data.password,
        nickname: data.nickname,
        phoneNumber: data.phoneNumber,
      });
      const resData = res.data.data ?? res.data;
      return {
        accessToken: resData.accessToken,
        refreshToken: resData.refreshToken,
        user: resData.user ?? { id: 'api-user', email: data.email, nickname: data.nickname },
      };
    } catch (e: any) {
      if (e.response?.data?.code === 'DUPLICATE' && e.response?.data?.message?.includes('Nickname')) {
        throw new Error('이미 등록된 아이디입니다');
      }
      if (e.response?.data?.code === 'DUPLICATE' && e.response?.data?.message?.includes('Email')) {
        throw new Error('이미 등록된 이메일입니다');
      }
      console.warn('[Auth] Signup API unavailable, using mock');
      return {
        accessToken: 'mock-token',
        refreshToken: 'mock-refresh',
        user: { id: 'mock-1', email: data.email, nickname: data.nickname },
      };
    }
  }

  async linkSocialAccount(
    phoneVerifiedToken: string,
    provider: string,
    providerKey: string,
  ): Promise<TokenResponse> {
    try {
      const res = await apiClient.post('/auth/social/link', {
        phoneVerifiedToken,
        provider,
        providerKey,
      });
      const data = res.data.data ?? res.data;

      const result: TokenResponse = {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        user: data.user ?? { id: 'api-user', email: '', nickname: '' },
      };

      // Persist tokens
      const store = useAuthStore.getState();
      store.setTokens(result.accessToken, result.refreshToken);

      return result;
    } catch {
      console.warn('[Auth] Social link API unavailable, using mock');
      const result: TokenResponse = {
        accessToken: 'mock-linked-token',
        refreshToken: 'mock-linked-refresh',
        user: { id: 'mock-linked', email: '', nickname: '' },
      };

      const store = useAuthStore.getState();
      store.setTokens(result.accessToken, result.refreshToken);

      return result;
    }
  }

  async checkDuplicate(field: 'loginId' | 'email', value: string): Promise<boolean> {
    try {
      const params = field === 'loginId' ? { nickname: value } : { email: value };
      const res = await apiClient.get('/auth/check-duplicate', { params });
      const data = res.data.data ?? res.data;
      return data.available;
    } catch {
      // Allow in dev mode when API is unavailable
      return true;
    }
  }

  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    try {
      const res = await axios.post(
        `${GATEWAY_URL}/api/v1/auth/refresh`,
        undefined,
        { headers: { 'X-Refresh-Token': refreshToken } },
      );
      const data = res.data.data ?? res.data;
      return {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      };
    } catch {
      console.warn('[Auth] Refresh API unavailable, using mock');
      return {
        accessToken: 'mock-access-token-refreshed',
        refreshToken: 'mock-refresh-token-refreshed',
      };
    }
  }

  async getProfile(): Promise<ProfileResponse> {
    try {
      const res = await apiClient.get('/users/me');
      const data = res.data.data ?? res.data;
      return { user: data };
    } catch {
      console.warn('[Auth] Profile API unavailable, using mock');
      return { user: mockUser };
    }
  }

  async signOut(): Promise<void> {
    try {
      await apiClient.post('/auth/sign-out');
    } catch {
      // Ignore sign-out API errors — clear local state regardless
    }
    useAuthStore.getState().logout();
  }
}

export const authService: IAuthService = new AuthService();
