import apiClient from './client';
import {
  VideoItem,
  Match,
  mockVideos,
  mockMatches,
} from '../services/scheduleApi';
import {
  OfficialContentItem,
  RegularContentItem,
  ClipContentItem,
} from '../services/homeApi';

// ─── Response types ───────────────────────────────────────────────

export interface ContentDetailResponse {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  type: 'LIVE' | 'VOD' | 'CLIP';
  competitionName: string;
  date: string;
  tags: string[];
  duration?: string;
  viewCount?: number;
  likeCount?: number;
  isLiked: boolean;
}

export interface RelatedContentResponse {
  items: (OfficialContentItem | RegularContentItem | ClipContentItem)[];
}

// ─── Extensible interface ─────────────────────────────────────────
// Future migration: swap ContentService to call pochak-content service.
// Consumers depend only on the interface.

export interface IContentService {
  /** Get detailed content by ID */
  getContentDetail(contentId: string): Promise<ContentDetailResponse>;
  /** Get related content for a given content */
  getRelatedContent(contentId: string): Promise<RelatedContentResponse>;
  /** Like/unlike a content item (toggle) */
  likeContent(contentId: string, contentType?: string): Promise<{ liked: boolean; likeCount: number }>;
  /** Get all available videos (VOD + LIVE) */
  getVideos(): Promise<VideoItem[]>;
  /** Get all matches */
  getMatches(): Promise<Match[]>;
}

// ─── Mock data helpers ────────────────────────────────────────────

function buildMockContentDetail(contentId: string): ContentDetailResponse {
  const video = mockVideos.find(v => v.id === contentId);
  if (video) {
    return {
      id: video.id,
      title: video.title,
      description: `${video.competitionName} | ${video.date}`,
      thumbnailUrl: video.thumbnailUrl,
      type: video.type,
      competitionName: video.competitionName,
      date: video.date,
      tags: video.tags,
      duration: video.duration,
      viewCount: video.viewCount,
      likeCount: 0,
      isLiked: false,
    };
  }
  // Fallback
  return {
    id: contentId,
    title: '콘텐츠를 찾을 수 없습니다',
    description: '',
    thumbnailUrl: '',
    type: 'VOD',
    competitionName: '',
    date: '',
    tags: [],
    isLiked: false,
  };
}

// ─── Concrete implementation ──────────────────────────────────────

class ContentService implements IContentService {
  async getContentDetail(contentId: string): Promise<ContentDetailResponse> {
    // TODO: Phase 5+ — return apiClient.get(`/content/${contentId}`).then(r => r.data);
    return buildMockContentDetail(contentId);
  }

  async getRelatedContent(contentId: string): Promise<RelatedContentResponse> {
    // TODO: Phase 5+ — return apiClient.get(`/content/${contentId}/related`).then(r => r.data);
    return { items: [] };
  }

  async likeContent(contentId: string, contentType?: string): Promise<{ liked: boolean; likeCount: number }> {
    // TODO: Phase 5+ — return apiClient.post(`/content/${contentType ?? 'vod'}/${contentId}/like`).then(r => r.data);
    return { liked: true, likeCount: 1 };
  }

  async getVideos(): Promise<VideoItem[]> {
    // TODO: Phase 5+ — return apiClient.get('/content/videos').then(r => r.data);
    return mockVideos;
  }

  async getMatches(): Promise<Match[]> {
    // TODO: Phase 5+ — return apiClient.get('/content/matches').then(r => r.data);
    return mockMatches;
  }
}

export const contentService: IContentService = new ContentService();
