/**
 * Extensible streaming interface for future RTMP/HLS/Camera integration.
 *
 * Currently returns mock/sample URLs. Will be replaced when the
 * VPU (Video Processing Unit), CHU (Camera Handling Unit), and
 * RTMP ingest backend are fully integrated.
 *
 * Migration path:
 * - Phase 4A: Mock URLs (current)
 * - Phase 5:  HLS from CDN via pochak-content service
 * - Phase 6+: Live RTMP ingest, multi-camera VPU, DRM integration
 */

// ─── Shared types ─────────────────────────────────────────────────

export interface StreamInfo {
  url: string;
  protocol: 'hls' | 'dash' | 'rtmp' | 'mp4'; // extensible for future protocols
  drm?: DrmConfig;
}

export interface CameraView {
  id: string;
  label: string; // 'AI' | 'PANO' | 'SIDE A' | 'CAM' | custom labels
  streamUrl: string;
  isDefault: boolean;
}

export interface QualityLevel {
  label: string; // '1080p', '720p', '480p', '360p'
  bitrate: number; // kbps
  width: number;
  height: number;
}

export interface DrmConfig {
  type: 'widevine' | 'fairplay' | 'none';
  licenseUrl?: string;
  certificateUrl?: string;
}

// ─── Extensible interface ─────────────────────────────────────────
// Future migration: real implementation will connect to VPU/CHU APIs.

export interface IStreamingService {
  /** Get the stream URL for a specific content item */
  getStreamUrl(contentId: string, contentType: 'live' | 'vod' | 'clip'): Promise<StreamInfo>;
  /** Get all available camera views for a live match */
  getCameraViews(matchId: string): Promise<CameraView[]>;
  /** Get available quality levels for a stream */
  getStreamQualityLevels(streamUrl: string): Promise<QualityLevel[]>;
}

// ─── Real test HLS streams ────────────────────────────────────────

const REAL_TEST_STREAMS = [
  'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',                                    // Big Buck Bunny
  'https://devstreaming-cdn.apple.com/videos/streaming/examples/bipbop_16x9/bipbop_16x9_variant.m3u8', // Apple bipbop
  'https://cph-p2p-msl.akamaized.net/hls/live/2000341/test/master.m3u8',                   // Akamai live test
];

// Rotate based on content ID hash
function getTestStreamUrl(contentId: string): string {
  const hash = contentId.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return REAL_TEST_STREAMS[hash % REAL_TEST_STREAMS.length];
}

const mockStreamUrls = (contentId: string): Record<string, StreamInfo> => ({
  live: {
    url: getTestStreamUrl(contentId + '-live'),
    protocol: 'hls',
  },
  vod: {
    url: getTestStreamUrl(contentId + '-vod'),
    protocol: 'hls',
  },
  clip: {
    url: getTestStreamUrl(contentId + '-clip'),
    protocol: 'hls',
  },
});

const mockCameraViews: CameraView[] = [
  { id: 'cam-ai', label: 'AI', streamUrl: REAL_TEST_STREAMS[0], isDefault: true },
  { id: 'cam-pano', label: 'PANO', streamUrl: REAL_TEST_STREAMS[1], isDefault: false },
  { id: 'cam-side-a', label: 'SIDE A', streamUrl: REAL_TEST_STREAMS[2], isDefault: false },
  { id: 'cam-main', label: 'CAM', streamUrl: REAL_TEST_STREAMS[0], isDefault: false },
];

const mockQualityLevels: QualityLevel[] = [
  { label: '1080p', bitrate: 5000, width: 1920, height: 1080 },
  { label: '720p', bitrate: 2500, width: 1280, height: 720 },
  { label: '480p', bitrate: 1200, width: 854, height: 480 },
  { label: '360p', bitrate: 600, width: 640, height: 360 },
];

// ─── Concrete implementation ──────────────────────────────────────

class StreamingService implements IStreamingService {
  async getStreamUrl(
    contentId: string,
    contentType: 'live' | 'vod' | 'clip',
  ): Promise<StreamInfo> {
    // TODO: Phase 5+ — return apiClient.get(`/streaming/${contentId}`, { params: { type: contentType } }).then(r => r.data);
    // TODO: Phase 6+ — integrate with VPU for real-time stream URL resolution
    const urls = mockStreamUrls(contentId);
    return urls[contentType] ?? urls.vod;
  }

  async getCameraViews(matchId: string): Promise<CameraView[]> {
    // TODO: Phase 5+ — return apiClient.get(`/streaming/${matchId}/cameras`).then(r => r.data);
    // TODO: Phase 6+ — integrate with CHU (Camera Handling Unit) for real camera feeds
    return mockCameraViews;
  }

  async getStreamQualityLevels(streamUrl: string): Promise<QualityLevel[]> {
    // TODO: Phase 5+ — parse quality levels from HLS/DASH manifest
    // TODO: Phase 6+ — return dynamic quality levels based on CDN config
    return mockQualityLevels;
  }
}

export const streamingService: IStreamingService = new StreamingService();
