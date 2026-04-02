export type UserStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED" | "WITHDRAWN";

export type AuthProvider = "EMAIL" | "GOOGLE" | "APPLE" | "KAKAO" | "NAVER";

export interface User {
  id: string;
  email: string;
  nickname: string;
  profileImageUrl?: string;
  status: UserStatus;
  authProvider: AuthProvider;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  nickname: string;
  profileImageUrl?: string;
  bio?: string;
  favoriteTeams: string[];
  favoriteSports: string[];
}

export interface SignUpRequest {
  email: string;
  password: string;
  nickname: string;
  authProvider: AuthProvider;
  marketingConsent: boolean;
}

export interface SignInRequest {
  email: string;
  password: string;
}

export interface SignInResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}
