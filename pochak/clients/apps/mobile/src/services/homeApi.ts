// Home screen data – imports from shared types & mock data.
// All existing export names are preserved for backward compatibility.

// ── Re-export types from shared ────────────────────────────────────────────────
export type {
  BannerItem,
  LiveContentItem,
  CompetitionItem,
  OfficialContentItem,
  RegularContentItem,
  ClipContentItem,
  ContentSection,
  SidebarMenu,
  PopularChannel,
} from '../shared/types';

// ── Re-export mock data from shared (kept for components that haven't migrated) ─
export {
  mockBanners,
  mockLiveContents,
  mockCompetitions,
  mockContentSections,
  sidebarMenus,
  popularChannels,
} from '../shared/mockData';

// ── Utility (kept here – identical to shared helper) ───────────────────────────
export function formatViewCount(count: number): string {
  if (count >= 10000) {
    return `${(count / 10000).toFixed(1)}만`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}천`;
  }
  return `${count}`;
}

// ── Real API ───────────────────────────────────────────────────────────────────

import apiClient from '../api/client';
import type {
  BannerItem,
  LiveContentItem,
} from '../shared/types';

export interface HomeData {
  banners: BannerItem[];
  liveNow: LiveContentItem[];
  liveCount: number;
  recommended: unknown[];
  featuredProducts: unknown[];
}

export async function fetchHomeData(): Promise<HomeData> {
  const res = await apiClient.get<{ data: HomeData }>('/app/home');
  const payload = res.data.data ?? res.data;
  return {
    banners: Array.isArray(payload.banners) ? payload.banners : [],
    liveNow: Array.isArray(payload.liveNow) ? payload.liveNow : [],
    liveCount: typeof payload.liveCount === 'number' ? payload.liveCount : 0,
    recommended: Array.isArray(payload.recommended) ? payload.recommended : [],
    featuredProducts: Array.isArray(payload.featuredProducts) ? payload.featuredProducts : [],
  };
}
