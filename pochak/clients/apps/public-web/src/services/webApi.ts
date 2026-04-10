// Data service for Pochak TV public web (Figma-aligned)
// Types & mock data re-exported from the shared package for backward compatibility.
// Async fetch functions call the gateway API; null is returned on failure.

import { fetchApi } from './apiClient';
import type { TimelineEvent, Chapter } from '@/components/WebVideoPlayer';

// ── Re-export types from shared (backward compatible) ──────────────────────────
export type {
  ContentType,
  SportType,
  MatchStatus,
  ContentCard,
  MatchItem,
  CompetitionCard,
  PopularChannel,
  AdBanner,
  PopularClip,
  PlayerData,
  UserProfile,
  WatchHistoryItem,
  PochakContent,
  PochakCompetition,
  PochakChannel,
  PochakClipItem,
  PochakMatch,
  PochakPost,
  PochakProduct,
} from '../../../../shared/types';

// BannerItem: the shared version has required `subtitle` & `linkUrl`.
// Re-export it under the same name so consumers see the full shape.
export type { PochakBanner as BannerItem } from '../../../../shared/types';

// ── Re-export mock data from shared (backward compatible) ──────────────────────
export {
  banners,
  competitions,
  liveMatches,
  popularClips,
  popularChannels,
  adBanners,
  liveContents,
  highlightContents,
  vodContents,
  clipContents,
  scheduleData,
  trendingSearches,
  getAllContents,
  defaultPlayerData,
  defaultProfile,
  defaultWatchHistory,
  pochakChannels,
  pochakCompetitions,
  pochakLiveContents,
  pochakVodContents,
  pochakClips,
  pochakMatches,
  pochakPosts,
  pochakSubscriptionProducts,
  pochakSportProducts,
  pochakCompetitionProducts,
} from '../../../../shared/mockData';

// ── Type imports for fetch function signatures ─────────────────────────────────
import type {
  ContentCard,
  CompetitionCard,
  PopularClip,
  PlayerData,
  UserProfile,
  WatchHistoryItem,
  PochakBanner,
  PochakMatch,
  PochakChannel,
} from '../../../../shared/types';

// ── Helpers ────────────────────────────────────────────────────────────────────

export function formatViewCount(count: number): string {
  if (count >= 10000) return `${(count / 10000).toFixed(1)}만`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}천`;
  return count.toString();
}

export function getStatusBadgeClass(status: string): string {
  switch (status) {
    case 'LIVE':
      return 'bg-red-600 text-white';
    case 'VOD':
      return 'bg-blue-600 text-white';
    case 'CLIP':
      return 'bg-[#333] text-white';
    case '예정':
      return 'bg-surface-light text-muted';
    case '종료':
      return 'bg-surface-light text-muted';
    default:
      return 'bg-surface-light text-muted';
  }
}

// ── Async API fetch functions ─────────────────────────────────────────────────
// These call the real gateway API and return null on failure.

/** Fetch home banners from API */
export async function fetchHomeBanners(): Promise<PochakBanner[] | null> {
  return fetchApi('/home/banners');
}

/** Fetch live matches from API */
export async function fetchLiveMatches(): Promise<PochakMatch[] | null> {
  return fetchApi('/contents/live?status=BROADCASTING');
}

/** Fetch competitions from API */
export async function fetchCompetitions(): Promise<CompetitionCard[] | null> {
  return fetchApi('/home/competitions');
}

/** Fetch popular clips from API */
export async function fetchPopularClips(): Promise<PopularClip[] | null> {
  return fetchApi('/home/clips/popular');
}

/** Fetch schedule matches for a given date and optional sport filter */
export async function fetchScheduleMatches(date: string, sport?: string): Promise<PochakMatch[] | null> {
  return fetchApi(`/contents/schedule?date=${date}${sport ? `&sport=${sport}` : ''}`);
}

/** Fetch search results for a query string */
export async function fetchSearchResults(query: string): Promise<ContentCard[] | null> {
  return fetchApi(`/contents/search?q=${encodeURIComponent(query)}`);
}

/** Fetch content list with optional filters */
export async function fetchContentList(type?: string, sport?: string, sort?: string, page?: number): Promise<ContentCard[] | null> {
  const params = new URLSearchParams();
  if (type) params.set('type', type);
  if (sport) params.set('sport', sport);
  if (sort) params.set('sort', sort);
  if (page) params.set('page', String(page));
  return fetchApi(`/contents?${params}`);
}

/** Fetch player data for a specific content */
export async function fetchPlayerData(type: string, id: string): Promise<PlayerData | null> {
  return fetchApi(`/contents/${type}/${id}/player`);
}

/** Fetch user profile */
export async function fetchMyProfile(): Promise<UserProfile | null> {
  return fetchApi('/users/me');
}

/** Fetch user watch history */
export async function fetchMyWatchHistory(): Promise<WatchHistoryItem[] | null> {
  return fetchApi('/users/me/watch-history');
}

/** Fetch channels the current user has joined */
export async function fetchJoinedChannels(): Promise<PochakChannel[] | null> {
  return fetchApi('/users/me/channels');
}

/** Fetch popular channels */
export async function fetchPopularChannels(): Promise<PochakChannel[] | null> {
  return fetchApi('/channels/popular');
}

/** Fetch live contents (all sports) */
export async function fetchLiveContents(): Promise<PochakContent[] | null> {
  return fetchApi('/contents/live');
}

/** Fetch VOD contents (all sports) */
export async function fetchVodContents(): Promise<PochakContent[] | null> {
  return fetchApi('/contents/vod');
}

/** Fetch popular clubs */
export async function fetchPopularClubs(): Promise<PochakChannel[] | null> {
  return fetchApi('/clubs/popular');
}

/** Fetch trending search keywords */
export async function fetchTrendingSearches(): Promise<string[] | null> {
  return fetchApi('/home/trending-searches');
}

// ── Mock Timeline / Chapter Data ─────────────────────────────────────────────

export const mockTimelineEvents: TimelineEvent[] = [
  { id: 'te-1', time: 0, label: '경기 시작', type: 'PERIOD' },
  { id: 'te-2', time: 420, label: '골! 경기용인YSFC', type: 'GOAL', teamName: '경기용인YSFC' },
  { id: 'te-3', time: 780, label: '옐로카드', type: 'FOUL', teamName: '대구강북주니어' },
  { id: 'te-4', time: 900, label: '하프타임', type: 'PERIOD' },
  { id: 'te-5', time: 960, label: '후반 시작', type: 'PERIOD' },
  { id: 'te-6', time: 1200, label: '골! 대구강북주니어', type: 'GOAL', teamName: '대구강북주니어' },
  { id: 'te-7', time: 1500, label: '선수교체', type: 'SUBSTITUTION', teamName: '경기용인YSFC' },
  { id: 'te-8', time: 1800, label: '경기 종료', type: 'PERIOD' },
];

export const mockChapters: Chapter[] = [
  { id: 'ch-1', title: '전반전', startTime: 0, endTime: 900, type: 'HALF' },
  { id: 'ch-2', title: '하프타임', startTime: 900, endTime: 960, type: 'BREAK' },
  { id: 'ch-3', title: '후반전', startTime: 960, endTime: 1800, type: 'HALF' },
];
