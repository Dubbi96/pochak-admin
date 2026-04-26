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

// ─── Competition types ────────────────────────────────────────────

export interface CompetitionData {
  id: string;
  name: string;
  sport: string;
  imageUrl: string;
  bannerUrl: string;
  startDate: string;
  endDate: string;
  description: string;
  isFree: boolean;
  organizer: string;
  venue: string;
  participantCount: number;
  tags: string[];
}

export interface CompetitionVideoItem {
  id: string;
  thumbnailUrl: string;
  title: string;
  date: string;
  viewCount: number;
  duration: string;
  type: 'VIDEO' | 'CLIP';
}

export interface CompetitionMatchItem {
  id: string;
  date: string;
  time: string;
  round: string;
  status: 'COMPLETED' | 'LIVE' | 'SCHEDULED';
  homeName: string;
  awayName: string;
  homeScore?: number;
  awayScore?: number;
}

export interface CompetitionContentsResponse {
  videos: CompetitionVideoItem[];
  clips: CompetitionVideoItem[];
}

// ─── Clip creation types ──────────────────────────────────────────

export interface CreateClipParams {
  title: string;
  description: string;
  tags: string[];
  visibility: 'public' | 'club' | 'private';
  startTime: number;
  endTime: number;
  sourceContentType: string;
  sourceContentId: string;
}

export interface CreateClipResponse {
  clipId: string;
}

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
  /** Get competition detail by ID */
  getCompetition(competitionId: string): Promise<CompetitionData>;
  /** Get competition videos and clips */
  getCompetitionVideos(competitionId: string): Promise<CompetitionContentsResponse>;
  /** Get competition matches */
  getCompetitionMatches(competitionId: string): Promise<CompetitionMatchItem[]>;
  /** Create a clip from a content */
  createClip(params: CreateClipParams): Promise<CreateClipResponse>;
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

  async getCompetition(competitionId: string): Promise<CompetitionData> {
    const res = await apiClient.get(`/competitions/${competitionId}`);
    const d = res.data.data ?? res.data;
    return {
      id: String(d.id ?? competitionId),
      name: d.name ?? '',
      sport: d.sportName ?? d.sport ?? '',
      imageUrl: d.imageUrl ?? d.logoUrl ?? '',
      bannerUrl: d.bannerUrl ?? '',
      startDate: d.startDate ?? '',
      endDate: d.endDate ?? '',
      description: d.description ?? '',
      isFree: d.isFree ?? false,
      organizer: d.organizer ?? d.organizerName ?? '',
      venue: d.venue ?? d.location ?? '',
      participantCount: d.participantCount ?? d.teamCount ?? 0,
      tags: d.tags ?? [],
    };
  }

  async getCompetitionVideos(competitionId: string): Promise<CompetitionContentsResponse> {
    const res = await apiClient.get(`/competitions/${competitionId}/contents`);
    const items: CompetitionVideoItem[] = (res.data.data ?? res.data.items ?? res.data ?? []).map(
      (item: { id: string | number; thumbnailUrl?: string; title?: string; date?: string; createdAt?: string; viewCount?: number; duration?: string; type?: string }) => ({
        id: String(item.id),
        thumbnailUrl: item.thumbnailUrl ?? '',
        title: item.title ?? '',
        date: item.date ?? item.createdAt ?? '',
        viewCount: item.viewCount ?? 0,
        duration: item.duration ?? '',
        type: (item.type === 'CLIP' ? 'CLIP' : 'VIDEO') as 'VIDEO' | 'CLIP',
      }),
    );
    return {
      videos: items.filter(i => i.type === 'VIDEO'),
      clips: items.filter(i => i.type === 'CLIP'),
    };
  }

  async getCompetitionMatches(competitionId: string): Promise<CompetitionMatchItem[]> {
    const res = await apiClient.get(`/competitions/${competitionId}/matches`);
    const raw: Array<{
      id: string | number;
      date?: string;
      matchDate?: string;
      time?: string;
      matchTime?: string;
      round?: string;
      roundName?: string;
      status?: string;
      homeName?: string;
      homeTeamName?: string;
      awayName?: string;
      awayTeamName?: string;
      homeScore?: number;
      awayScore?: number;
    }> = res.data.data ?? res.data.items ?? res.data ?? [];
    return raw.map(m => ({
      id: String(m.id),
      date: m.date ?? m.matchDate ?? '',
      time: m.time ?? m.matchTime ?? '',
      round: m.round ?? m.roundName ?? '',
      status: (['COMPLETED', 'LIVE', 'SCHEDULED'].includes(m.status ?? '')
        ? m.status
        : 'SCHEDULED') as 'COMPLETED' | 'LIVE' | 'SCHEDULED',
      homeName: m.homeName ?? m.homeTeamName ?? '',
      awayName: m.awayName ?? m.awayTeamName ?? '',
      homeScore: m.homeScore,
      awayScore: m.awayScore,
    }));
  }

  async createClip(params: CreateClipParams): Promise<CreateClipResponse> {
    const res = await apiClient.post('/clips', params);
    const d = res.data.data ?? res.data;
    return { clipId: String(d.clipId ?? d.id ?? '') };
  }
}

export const contentService: IContentService = new ContentService();
