import apiClient from './client';
import {
  BannerItem,
  LiveContentItem,
  CompetitionItem,
  ContentSection,
  SidebarMenu,
  mockBanners,
  mockLiveContents,
  mockCompetitions,
  mockContentSections,
  sidebarMenus,
} from '../services/homeApi';

// ─── Response types ───────────────────────────────────────────────

export interface HomeResponse {
  banners: BannerItem[];
  liveContents: LiveContentItem[];
  competitions: CompetitionItem[];
  contentSections: ContentSection[];
  sidebarMenus: SidebarMenu[];
}

// ─── Extensible interface ─────────────────────────────────────────
// Future migration: swap HomeService implementation to call real API
// without changing any consumer code.

export interface IHomeService {
  /** Fetch the full home screen payload */
  getHome(): Promise<HomeResponse>;
  /** Fetch banner carousel items */
  getBanners(): Promise<BannerItem[]>;
  /** Fetch currently live content */
  getLiveContents(): Promise<LiveContentItem[]>;
  /** Fetch upcoming competitions */
  getCompetitions(): Promise<CompetitionItem[]>;
  /** Fetch content sections (highlights, clips, originals, etc.) */
  getContentSections(): Promise<ContentSection[]>;
}

// ─── Concrete implementation ──────────────────────────────────────

class HomeService implements IHomeService {
  async getHome(): Promise<HomeResponse> {
    // TODO: Phase 5+ — replace mock with real API call:
    // return apiClient.get('/home').then(r => r.data);
    return {
      banners: mockBanners,
      liveContents: mockLiveContents,
      competitions: mockCompetitions,
      contentSections: mockContentSections,
      sidebarMenus,
    };
  }

  async getBanners(): Promise<BannerItem[]> {
    // TODO: Phase 5+ — return apiClient.get('/home/banners').then(r => r.data);
    return mockBanners;
  }

  async getLiveContents(): Promise<LiveContentItem[]> {
    // TODO: Phase 5+ — return apiClient.get('/home/live').then(r => r.data);
    return mockLiveContents;
  }

  async getCompetitions(): Promise<CompetitionItem[]> {
    // TODO: Phase 5+ — return apiClient.get('/home/competitions').then(r => r.data);
    return mockCompetitions;
  }

  async getContentSections(): Promise<ContentSection[]> {
    // TODO: Phase 5+ — return apiClient.get('/home/sections').then(r => r.data);
    return mockContentSections;
  }
}

export const homeService: IHomeService = new HomeService();
