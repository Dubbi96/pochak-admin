// ── Streaming Ingest & VOD Upload API (mock) ───────────────────────────────────
// TODO: [Mock→Real API] Wire to real backend endpoints once streaming infrastructure is deployed. Keep mock for now.

// ── Types ────────────────────────────────────────────────────────────────────

export interface IngestEndpoint {
  id: number;
  rtmpUrl: string;
  streamKey: string;
  status: "CREATED" | "RECEIVING" | "ERROR" | "STOPPED";
  matchId: number | null;
  cameraId: number | null;
  cameraLabel: string;
  venueName: string;
  createdAt: string;
  lastFrameAt: string | null;
}

export interface IngestStatus {
  endpointId: number;
  receiving: boolean;
  currentBitrate: number;
  currentFps: number;
  currentResolution: string | null;
  framesReceived: number;
  droppedFrames: number;
  lastFrameAt: string | null;
  health: "GOOD" | "DEGRADED" | "POOR" | "OFFLINE";
}

export interface TranscodeSession {
  id: number;
  ingestEndpointId: number;
  status: "STARTING" | "LIVE" | "STOPPING" | "COMPLETED" | "ERROR";
  hlsUrl: string;
  dashUrl: string | null;
  startedAt: string;
  endedAt: string | null;
  durationSeconds: number | null;
}

export interface CreateIngestRequest {
  matchId?: number;
  venueId: number;
  cameraId?: number;
  cameraLabel: string;
  resolution: string;
  fps: number;
}

export interface VodProcessingJob {
  id: number;
  vodAssetId: number | null;
  status: "QUEUED" | "TRANSCODING" | "THUMBNAIL_GENERATING" | "COMPLETED" | "FAILED";
  progressPercent: number;
  sourceUrl: string;
  outputHlsUrl: string | null;
  thumbnailUrl: string | null;
  durationSeconds: number | null;
  errorMessage: string | null;
  filename: string;
  createdAt: string;
  completedAt: string | null;
}

export interface CreateUploadRequest {
  filename: string;
  contentType: string;
  fileSizeBytes: number;
  matchId?: number;
  title?: string;
  description?: string;
  tags?: string[];
}

export interface UploadTicket {
  id: number;
  uploadUrl: string;
  storageKey: string;
  status: string;
  expiresAt: string;
}

export interface LiveToVodRequest {
  transcodeSessionId: number;
  title?: string;
  description?: string;
  tags?: string[];
  matchId?: number;
  trimStart?: boolean;
  trimEnd?: boolean;
}

// ── Mock Data ────────────────────────────────────────────────────────────────

const mockEndpoints: IngestEndpoint[] = [
  {
    id: 1,
    rtmpUrl: "rtmp://ingest.pochak.co.kr/live/a1b2c3d4e5f6",
    streamKey: "a1b2c3d4e5f6",
    status: "RECEIVING",
    matchId: 101,
    cameraId: 1,
    cameraLabel: "AI",
    venueName: "서울 월드컵경기장",
    createdAt: "2026-03-20T14:00:00",
    lastFrameAt: "2026-03-20T15:32:10",
  },
  {
    id: 2,
    rtmpUrl: "rtmp://ingest.pochak.co.kr/live/f7e8d9c0b1a2",
    streamKey: "f7e8d9c0b1a2",
    status: "RECEIVING",
    matchId: 101,
    cameraId: 2,
    cameraLabel: "PANO",
    venueName: "서울 월드컵경기장",
    createdAt: "2026-03-20T14:00:00",
    lastFrameAt: "2026-03-20T15:32:09",
  },
  {
    id: 3,
    rtmpUrl: "rtmp://ingest.pochak.co.kr/live/x9y8z7w6v5u4",
    streamKey: "x9y8z7w6v5u4",
    status: "CREATED",
    matchId: null,
    cameraId: 3,
    cameraLabel: "SIDE_A",
    venueName: "강남 실내체육관",
    createdAt: "2026-03-20T18:00:00",
    lastFrameAt: null,
  },
  {
    id: 4,
    rtmpUrl: "rtmp://ingest.pochak.co.kr/live/err12345dead",
    streamKey: "err12345dead",
    status: "ERROR",
    matchId: 102,
    cameraId: 4,
    cameraLabel: "CAM",
    venueName: "인천 야구장",
    createdAt: "2026-03-20T12:00:00",
    lastFrameAt: "2026-03-20T12:15:30",
  },
];

const mockStatuses: Record<number, IngestStatus> = {
  1: {
    endpointId: 1,
    receiving: true,
    currentBitrate: 4500,
    currentFps: 30,
    currentResolution: "1920x1080",
    framesReceived: 172800,
    droppedFrames: 24,
    lastFrameAt: "2026-03-20T15:32:10",
    health: "GOOD",
  },
  2: {
    endpointId: 2,
    receiving: true,
    currentBitrate: 6200,
    currentFps: 30,
    currentResolution: "3840x2160",
    framesReceived: 170500,
    droppedFrames: 156,
    lastFrameAt: "2026-03-20T15:32:09",
    health: "DEGRADED",
  },
  3: {
    endpointId: 3,
    receiving: false,
    currentBitrate: 0,
    currentFps: 0,
    currentResolution: null,
    framesReceived: 0,
    droppedFrames: 0,
    lastFrameAt: null,
    health: "OFFLINE",
  },
  4: {
    endpointId: 4,
    receiving: false,
    currentBitrate: 0,
    currentFps: 0,
    currentResolution: null,
    framesReceived: 5400,
    droppedFrames: 1200,
    lastFrameAt: "2026-03-20T12:15:30",
    health: "POOR",
  },
};

const mockProcessingJobs: VodProcessingJob[] = [
  {
    id: 1,
    vodAssetId: 1001,
    status: "COMPLETED",
    progressPercent: 100,
    sourceUrl: "https://storage.pochak.co.kr/upload/match_101_ai.mp4",
    outputHlsUrl: "https://cdn.pochak.co.kr/vod/1001/master.m3u8",
    thumbnailUrl: "https://placehold.co/320x180?text=VOD1001",
    durationSeconds: 5400,
    errorMessage: null,
    filename: "match_101_ai.mp4",
    createdAt: "2026-03-19T18:00:00",
    completedAt: "2026-03-19T19:30:00",
  },
  {
    id: 2,
    vodAssetId: null,
    status: "TRANSCODING",
    progressPercent: 62,
    sourceUrl: "https://storage.pochak.co.kr/upload/match_102_pano.mp4",
    outputHlsUrl: null,
    thumbnailUrl: null,
    durationSeconds: 7200,
    errorMessage: null,
    filename: "match_102_pano.mp4",
    createdAt: "2026-03-20T10:00:00",
    completedAt: null,
  },
  {
    id: 3,
    vodAssetId: null,
    status: "QUEUED",
    progressPercent: 0,
    sourceUrl: "https://storage.pochak.co.kr/upload/training_session.mov",
    outputHlsUrl: null,
    thumbnailUrl: null,
    durationSeconds: null,
    errorMessage: null,
    filename: "training_session.mov",
    createdAt: "2026-03-20T14:30:00",
    completedAt: null,
  },
  {
    id: 4,
    vodAssetId: null,
    status: "FAILED",
    progressPercent: 45,
    sourceUrl: "https://storage.pochak.co.kr/upload/corrupted_file.mp4",
    outputHlsUrl: null,
    thumbnailUrl: null,
    durationSeconds: null,
    errorMessage: "Transcoding failed: unsupported codec (VP9)",
    filename: "corrupted_file.mp4",
    createdAt: "2026-03-20T08:00:00",
    completedAt: null,
  },
  {
    id: 5,
    vodAssetId: null,
    status: "THUMBNAIL_GENERATING",
    progressPercent: 88,
    sourceUrl: "https://storage.pochak.co.kr/upload/match_103_side.mp4",
    outputHlsUrl: "https://cdn.pochak.co.kr/vod/1005/master.m3u8",
    thumbnailUrl: null,
    durationSeconds: 3600,
    errorMessage: null,
    filename: "match_103_side.mp4",
    createdAt: "2026-03-20T11:00:00",
    completedAt: null,
  },
];

let endpointData = [...mockEndpoints];
let jobData = [...mockProcessingJobs];
let nextEndpointId = 5;
let nextJobId = 6;

// ── Helper ───────────────────────────────────────────────────────────────────

function delay(ms = 300): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ── Ingest Endpoint APIs ────────────────────────────────────────────────────

export async function getActiveEndpoints(): Promise<IngestEndpoint[]> {
  await delay();
  return endpointData.filter((e) => e.status !== "STOPPED");
}

export async function getEndpointStatus(id: number): Promise<IngestStatus> {
  await delay();
  return (
    mockStatuses[id] ?? {
      endpointId: id,
      receiving: false,
      currentBitrate: 0,
      currentFps: 0,
      currentResolution: null,
      framesReceived: 0,
      droppedFrames: 0,
      lastFrameAt: null,
      health: "OFFLINE" as const,
    }
  );
}

export async function createIngestEndpoint(
  req: CreateIngestRequest
): Promise<IngestEndpoint> {
  await delay();
  const id = nextEndpointId++;
  const streamKey = Math.random().toString(36).substring(2, 14);
  const endpoint: IngestEndpoint = {
    id,
    rtmpUrl: `rtmp://ingest.pochak.co.kr/live/${streamKey}`,
    streamKey,
    status: "CREATED",
    matchId: req.matchId ?? null,
    cameraId: req.cameraId ?? null,
    cameraLabel: req.cameraLabel,
    venueName: "구장명",
    createdAt: new Date().toISOString(),
    lastFrameAt: null,
  };
  endpointData.push(endpoint);
  return endpoint;
}

export async function startTranscoding(
  endpointId: number
): Promise<TranscodeSession> {
  await delay();
  return {
    id: Math.floor(Math.random() * 10000),
    ingestEndpointId: endpointId,
    status: "LIVE",
    hlsUrl: `https://cdn.pochak.co.kr/live/${endpointId}/master.m3u8`,
    dashUrl: null,
    startedAt: new Date().toISOString(),
    endedAt: null,
    durationSeconds: null,
  };
}

// ── VOD Processing APIs ─────────────────────────────────────────────────────

export async function getProcessingJobs(): Promise<VodProcessingJob[]> {
  await delay();
  return [...jobData];
}

export async function getProcessingJobStatus(
  id: number
): Promise<VodProcessingJob> {
  await delay();
  const job = jobData.find((j) => j.id === id);
  if (!job) throw new Error("Job not found: " + id);
  return { ...job };
}

export async function createUploadTicket(
  req: CreateUploadRequest
): Promise<UploadTicket> {
  await delay();
  const ticketId = nextJobId++;
  return {
    id: ticketId,
    uploadUrl: `https://storage.pochak.co.kr/upload/${ticketId}?sig=mock`,
    storageKey: `uploads/${ticketId}/${req.filename}`,
    status: "CREATED",
    expiresAt: new Date(Date.now() + 3600000).toISOString(),
  };
}

export async function confirmUpload(ticketId: number): Promise<VodProcessingJob> {
  await delay();
  const job: VodProcessingJob = {
    id: nextJobId++,
    vodAssetId: null,
    status: "QUEUED",
    progressPercent: 0,
    sourceUrl: `https://storage.pochak.co.kr/upload/${ticketId}/file.mp4`,
    outputHlsUrl: null,
    thumbnailUrl: null,
    durationSeconds: null,
    errorMessage: null,
    filename: "uploaded_file.mp4",
    createdAt: new Date().toISOString(),
    completedAt: null,
  };
  jobData.push(job);
  return job;
}

export async function convertLiveToVod(
  req: LiveToVodRequest
): Promise<VodProcessingJob> {
  await delay();
  const job: VodProcessingJob = {
    id: nextJobId++,
    vodAssetId: null,
    status: "QUEUED",
    progressPercent: 0,
    sourceUrl: `https://cdn.pochak.co.kr/live/${req.transcodeSessionId}/recording.ts`,
    outputHlsUrl: null,
    thumbnailUrl: null,
    durationSeconds: null,
    errorMessage: null,
    filename: `live_session_${req.transcodeSessionId}.ts`,
    createdAt: new Date().toISOString(),
    completedAt: null,
  };
  jobData.push(job);
  return job;
}

// ── Completed live sessions (for live-to-vod dialog) ────────────────────────

export interface CompletedLiveSession {
  id: number;
  matchName: string;
  venueName: string;
  cameraLabel: string;
  endedAt: string;
  durationSeconds: number;
}

export async function getCompletedLiveSessions(): Promise<
  CompletedLiveSession[]
> {
  await delay(100);
  return [
    {
      id: 1001,
      matchName: "서울 FC vs 인천 유나이티드",
      venueName: "서울 월드컵경기장",
      cameraLabel: "AI",
      endedAt: "2026-03-19T16:05:00",
      durationSeconds: 7500,
    },
    {
      id: 1002,
      matchName: "서울 FC vs 인천 유나이티드",
      venueName: "서울 월드컵경기장",
      cameraLabel: "PANO",
      endedAt: "2026-03-19T16:05:00",
      durationSeconds: 7500,
    },
    {
      id: 1003,
      matchName: "강남 블레이저스 vs 송파 히어로즈",
      venueName: "강남 실내체육관",
      cameraLabel: "CAM",
      endedAt: "2026-03-18T21:10:00",
      durationSeconds: 5400,
    },
  ];
}
