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

// ── Re-export mock data from shared ────────────────────────────────────────────
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
