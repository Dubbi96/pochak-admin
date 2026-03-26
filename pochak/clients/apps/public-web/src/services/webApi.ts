// Mock data service for Pochak TV public web (Figma-aligned)
// Types & mock data imported from the shared package; async fetch functions use
// apiClient with mock fallback.

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

// ── Internal imports for fetch-function fallbacks ──────────────────────────────
import type {
  ContentCard,
  CompetitionCard,
  PopularClip,
  PlayerData,
  UserProfile,
  WatchHistoryItem,
  PochakBanner,
  PochakMatch,
} from '../../../../shared/types';

import {
  banners as _banners,
  liveMatches as _liveMatches,
  competitions as _competitions,
  popularClips as _popularClips,
  scheduleData as _scheduleData,
  getAllContents as _getAllContents,
  defaultPlayerData as _defaultPlayerData,
  defaultProfile as _defaultProfile,
  defaultWatchHistory as _defaultWatchHistory,
} from '../../../../shared/mockData';

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

// ── Async API-first fetch functions ───────────────────────────────────────────
// These try the real gateway API first, falling back to mock data above.
// TODO(Phase 4B): remove mock fallback once gateway APIs are stable.

/** Fetch home banners from API, falling back to mock banners */
export async function fetchHomeBanners(): Promise<PochakBanner[]> {
  return fetchApi('/home/banners', _banners);
}

/** Fetch live matches from API, falling back to mock liveMatches */
export async function fetchLiveMatches(): Promise<PochakMatch[]> {
  return fetchApi('/contents/live?status=BROADCASTING', _liveMatches);
}

/** Fetch competitions from API, falling back to mock competitions */
export async function fetchCompetitions(): Promise<CompetitionCard[]> {
  return fetchApi('/home/competitions', _competitions);
}

/** Fetch popular clips from API, falling back to mock popularClips */
export async function fetchPopularClips(): Promise<PopularClip[]> {
  return fetchApi('/home/clips/popular', _popularClips);
}

/** Fetch schedule matches for a given date and optional sport filter */
export async function fetchScheduleMatches(date: string, sport?: string): Promise<PochakMatch[]> {
  return fetchApi(`/contents/schedule?date=${date}${sport ? `&sport=${sport}` : ''}`, _scheduleData);
}

/** Fetch search results for a query string */
export async function fetchSearchResults(query: string): Promise<ContentCard[]> {
  return fetchApi(`/contents/search?q=${encodeURIComponent(query)}`, _getAllContents());
}

/** Fetch content list with optional filters */
export async function fetchContentList(type?: string, sport?: string, sort?: string, page?: number): Promise<ContentCard[]> {
  const params = new URLSearchParams();
  if (type) params.set('type', type);
  if (sport) params.set('sport', sport);
  if (sort) params.set('sort', sort);
  if (page) params.set('page', String(page));
  return fetchApi(`/contents?${params}`, _getAllContents());
}

/** Fetch player data for a specific content */
export async function fetchPlayerData(type: string, id: string): Promise<PlayerData> {
  return fetchApi(`/contents/${type}/${id}/player`, _defaultPlayerData);
}

/** Fetch user profile */
export async function fetchMyProfile(): Promise<UserProfile> {
  return fetchApi('/users/me', _defaultProfile);
}

/** Fetch user watch history */
export async function fetchMyWatchHistory(): Promise<WatchHistoryItem[]> {
  return fetchApi('/users/me/watch-history', _defaultWatchHistory);
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
