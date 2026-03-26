import apiClient from './client';
import {
  WatchHistoryItem,
  MyClipItem,
  WatchReservationItem,
  FavoriteTeam,
  FavoriteCompetition,
  mockWatchHistoryVideos,
  mockWatchHistoryClips,
  mockMyClips,
  mockReservations,
  mockFavoriteTeams,
  mockFavoriteCompetitions,
  mockFavoriteTeamVideos,
} from '../services/myApi';

// ─── Extensible interface ─────────────────────────────────────────
// Future migration: swap UserService to call pochak-identity / pochak-content
// user-related endpoints. Interface stays stable for all consumers.

export interface UserProfile {
  loginId: string;
  nickname: string;
  email: string;
  phone: string;
  name: string;
  birthDate: string;
  profileImageUrl: string;
  interests: string;
  regions: string;
  purpose: string;
}

export interface RecordWatchEventParams {
  contentType: 'live' | 'vod' | 'clip';
  contentId: string;
  watchedSeconds: number;
  totalSeconds: number;
}

export interface IUserService {
  /** Get the current user's profile */
  getProfile(): Promise<UserProfile>;
  /** Update the current user's profile */
  updateProfile(data: Partial<UserProfile>): Promise<UserProfile>;
  /** Get user's watch history (full videos) */
  getWatchHistory(): Promise<WatchHistoryItem[]>;
  /** Get user's watched clips */
  getWatchHistoryClips(): Promise<MyClipItem[]>;
  /** Get clips created by the user */
  getMyClips(): Promise<MyClipItem[]>;
  /** Get user's favorite teams */
  getFavoriteTeams(): Promise<FavoriteTeam[]>;
  /** Get videos from favorite teams */
  getFavoriteTeamVideos(teamId?: string): Promise<WatchHistoryItem[]>;
  /** Get user's favorite competitions */
  getFavoriteCompetitions(): Promise<FavoriteCompetition[]>;
  /** Get user's watch reservations (upcoming matches) */
  getReservations(): Promise<WatchReservationItem[]>;
  /** Toggle favorite status for a team */
  toggleFavoriteTeam(teamId: string): Promise<{ isFavorite: boolean }>;
  /** Toggle favorite status for a competition */
  toggleFavoriteCompetition(competitionId: string): Promise<{ isFavorite: boolean }>;
  /** Record a watch event (for watch history) */
  recordWatchEvent(params: RecordWatchEventParams): Promise<void>;
  /** Add content to favorites/bookmarks */
  addFavorite(contentType: string, contentId: string): Promise<void>;
  /** Remove content from favorites/bookmarks */
  removeFavorite(contentType: string, contentId: string): Promise<void>;
}

// ─── Concrete implementation ──────────────────────────────────────

const MOCK_PROFILE: UserProfile = {
  loginId: 'pochak2026',
  nickname: 'pochak2026',
  email: 'kimpochak@hogak.co.kr',
  phone: '010-0000-0000',
  name: '홍길동',
  birthDate: '2000.01.01',
  profileImageUrl: '',
  interests: '축구, 마라톤, 유도',
  regions: '대한민국 서울시, 대한민국 성남시, 대한민국 용인시',
  purpose: '내 경기영상을 보고 싶어요 !',
};

class UserService implements IUserService {
  async getProfile(): Promise<UserProfile> {
    try {
      const res = await apiClient.get('/user/profile');
      return res.data.data || res.data;
    } catch {
      return { ...MOCK_PROFILE };
    }
  }

  async updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const res = await apiClient.put('/user/profile', data);
      return res.data.data || res.data;
    } catch {
      Object.assign(MOCK_PROFILE, data);
      return { ...MOCK_PROFILE };
    }
  }

  async getWatchHistory(): Promise<WatchHistoryItem[]> {
    // TODO: Phase 5+ — return apiClient.get('/user/watch-history').then(r => r.data);
    return mockWatchHistoryVideos;
  }

  async getWatchHistoryClips(): Promise<MyClipItem[]> {
    // TODO: Phase 5+ — return apiClient.get('/user/watch-history/clips').then(r => r.data);
    return mockWatchHistoryClips;
  }

  async getMyClips(): Promise<MyClipItem[]> {
    // TODO: Phase 5+ — return apiClient.get('/user/clips').then(r => r.data);
    return mockMyClips;
  }

  async getFavoriteTeams(): Promise<FavoriteTeam[]> {
    // TODO: Phase 5+ — return apiClient.get('/user/favorites/teams').then(r => r.data);
    return mockFavoriteTeams;
  }

  async getFavoriteTeamVideos(teamId?: string): Promise<WatchHistoryItem[]> {
    // TODO: Phase 5+ — return apiClient.get(`/user/favorites/teams/${teamId}/videos`).then(r => r.data);
    return mockFavoriteTeamVideos;
  }

  async getFavoriteCompetitions(): Promise<FavoriteCompetition[]> {
    // TODO: Phase 5+ — return apiClient.get('/user/favorites/competitions').then(r => r.data);
    return mockFavoriteCompetitions;
  }

  async getReservations(): Promise<WatchReservationItem[]> {
    // TODO: Phase 5+ — return apiClient.get('/user/reservations').then(r => r.data);
    return mockReservations;
  }

  async toggleFavoriteTeam(teamId: string): Promise<{ isFavorite: boolean }> {
    // TODO: Phase 5+ — return apiClient.post(`/user/favorites/teams/${teamId}/toggle`).then(r => r.data);
    return { isFavorite: true };
  }

  async toggleFavoriteCompetition(competitionId: string): Promise<{ isFavorite: boolean }> {
    // TODO: Phase 5+ — return apiClient.post(`/user/favorites/competitions/${competitionId}/toggle`).then(r => r.data);
    return { isFavorite: true };
  }

  async recordWatchEvent(params: RecordWatchEventParams): Promise<void> {
    // TODO: Phase 5+ — return apiClient.post('/user/watch-history', params).then(r => r.data);
    // Mock: no-op, logged for debugging
    console.log('[UserService] recordWatchEvent', params);
  }

  async addFavorite(contentType: string, contentId: string): Promise<void> {
    // TODO: Phase 5+ — return apiClient.post(`/user/favorites/${contentType}/${contentId}`).then(r => r.data);
    console.log('[UserService] addFavorite', contentType, contentId);
  }

  async removeFavorite(contentType: string, contentId: string): Promise<void> {
    // TODO: Phase 5+ — return apiClient.delete(`/user/favorites/${contentType}/${contentId}`).then(r => r.data);
    console.log('[UserService] removeFavorite', contentType, contentId);
  }
}

export const userService: IUserService = new UserService();
