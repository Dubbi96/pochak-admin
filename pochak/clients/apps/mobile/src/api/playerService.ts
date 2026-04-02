import apiClient from './client';
import type { StreamInfo, CameraView } from './streamingService';
import { streamingService } from './streamingService';

// ─── Response types ───────────────────────────────────────────────

export interface PlayerData {
  contentId: string;
  title: string;
  competitionName: string;
  streamInfo: StreamInfo;
  cameraViews: CameraView[];
  timeline: TimelineEvent[];
  isLive: boolean;
}

export interface TimelineEvent {
  id: string;
  time: number; // seconds from start
  label: string;
  type: 'GOAL' | 'FOUL' | 'SUBSTITUTION' | 'HIGHLIGHT' | 'PERIOD' | 'CUSTOM';
  teamName?: string;
}

// ─── Extensible interface ─────────────────────────────────────────
// Future migration: real player data will come from pochak-content + VPU/CHU.
// Current implementation returns mock/sample data.

export interface IPlayerService {
  /** Get full player initialization data for a given content */
  getPlayerData(contentId: string): Promise<PlayerData>;
  /** Get the primary stream URL for content */
  getStreamUrl(contentId: string): Promise<StreamInfo>;
  /** Get available camera views for a live match */
  getCameraViews(matchId: string): Promise<CameraView[]>;
  /** Get timeline events (goals, fouls, etc.) */
  getTimelineEvents(contentId: string): Promise<TimelineEvent[]>;
}

// ─── Shared data ─────────────────────────────────────────────────

import { pochakVodContents, pochakClips, pochakLiveContents } from '../shared/mockData';

const REAL_STREAMS = [
  'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
  'https://devstreaming-cdn.apple.com/videos/streaming/examples/bipbop_16x9/bipbop_16x9_variant.m3u8',
  'https://cph-p2p-msl.akamaized.net/hls/live/2000341/test/master.m3u8',
];

const mockCameraViews: CameraView[] = [
  { id: 'cam-ai', label: 'AI', streamUrl: REAL_STREAMS[0], isDefault: true },
  { id: 'cam-pano', label: 'PANO', streamUrl: REAL_STREAMS[1], isDefault: false },
  { id: 'cam-side-a', label: 'SIDE A', streamUrl: REAL_STREAMS[2], isDefault: false },
  { id: 'cam-main', label: 'CAM', streamUrl: REAL_STREAMS[0], isDefault: false },
];

// Use shared data for team names in timeline events
const defaultVod = pochakVodContents[0];
const homeTeamName = defaultVod.homeTeam.name;  // 경기용인YSFC
const awayTeamName = defaultVod.awayTeam.name;  // 대구강북주니어

const mockTimeline: TimelineEvent[] = [
  { id: 'te-1', time: 0, label: '경기 시작', type: 'PERIOD' },
  { id: 'te-2', time: 420, label: `골! ${homeTeamName}`, type: 'GOAL', teamName: homeTeamName },
  { id: 'te-3', time: 900, label: '하프타임', type: 'PERIOD' },
  { id: 'te-4', time: 960, label: '후반 시작', type: 'PERIOD' },
  { id: 'te-5', time: 1200, label: `골! ${awayTeamName}`, type: 'GOAL', teamName: awayTeamName },
  { id: 'te-6', time: 1440, label: '선수 교체', type: 'SUBSTITUTION', teamName: homeTeamName },
  { id: 'te-7', time: 1620, label: `골! ${homeTeamName}`, type: 'GOAL', teamName: homeTeamName },
  { id: 'te-8', time: 1800, label: '경기 종료', type: 'PERIOD' },
];

// ─── Concrete implementation ──────────────────────────────────────

class PlayerService implements IPlayerService {
  async getPlayerData(contentId: string): Promise<PlayerData> {
    // TODO: Phase 5+ — return apiClient.get(`/player/${contentId}`).then(r => r.data);
    const streamInfo = await streamingService.getStreamUrl(contentId, 'live');
    return {
      contentId,
      title: defaultVod.title,
      competitionName: defaultVod.competition,
      streamInfo,
      cameraViews: mockCameraViews,
      timeline: mockTimeline,
      isLive: true,
    };
  }

  async getStreamUrl(contentId: string): Promise<StreamInfo> {
    // TODO: Phase 5+ — return apiClient.get(`/player/${contentId}/stream`).then(r => r.data);
    return streamingService.getStreamUrl(contentId, 'live');
  }

  async getCameraViews(matchId: string): Promise<CameraView[]> {
    // TODO: Phase 5+ — return apiClient.get(`/player/${matchId}/cameras`).then(r => r.data);
    // Will be replaced when VPU/CHU camera backend is integrated.
    return mockCameraViews;
  }

  async getTimelineEvents(contentId: string): Promise<TimelineEvent[]> {
    // TODO: Phase 5+ — return apiClient.get(`/player/${contentId}/timeline`).then(r => r.data);
    return mockTimeline;
  }
}

export const playerService: IPlayerService = new PlayerService();
