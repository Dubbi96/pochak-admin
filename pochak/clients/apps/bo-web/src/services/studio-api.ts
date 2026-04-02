// TODO: [Mock→Real API] Wire to real backend endpoints once studio service is deployed. Keep mock for now.
/**
 * Studio Admin API service (Session management)
 * Currently returns mock data. Will be replaced with real API calls.
 */

// ── Types ──────────────────────────────────────────────────────────

export type SessionStatus = "STANDBY" | "RECORDING" | "COMPLETED" | "ERROR";

export type CameraType = "AI" | "PANO" | "SIDE_A" | "CAM";
export type CameraStatus = "ONLINE" | "OFFLINE" | "RECORDING" | "ERROR";

export interface StudioCamera {
  id: number;
  name: string;
  type: CameraType;
  status: CameraStatus;
  resolution: string;
  fps: number;
  bitrate: string;
}

export interface StudioSession {
  id: number;
  venueId: number;
  venueName: string;
  competitionName: string;
  matchName: string;
  startTime: string;
  endTime: string;
  status: SessionStatus;
  cameras: StudioCamera[];
  assignee: string;
  storageUsedGB: number;
  storageTotalGB: number;
  createdBy: string;
  createdAt: string;
}

export interface SessionFilter {
  status?: SessionStatus | null;
  venueId?: number | null;
  dateFrom?: string | null;
  dateTo?: string | null;
}

export interface SessionCreateRequest {
  venueId: number;
  competitionName: string;
  matchName: string;
  scheduledStartTime: string;
  scheduledEndTime: string;
  cameraConfig: CameraType[];
}

// ── Label Maps ─────────────────────────────────────────────────────

export const SESSION_STATUS_LABELS: Record<SessionStatus, string> = {
  STANDBY: "대기",
  RECORDING: "촬영중",
  COMPLETED: "완료",
  ERROR: "오류",
};

export const CAMERA_TYPE_LABELS: Record<CameraType, string> = {
  AI: "AI 카메라",
  PANO: "파노라마",
  SIDE_A: "사이드 A",
  CAM: "일반 카메라",
};

// ── Mock Data ──────────────────────────────────────────────────────

let MOCK_SESSIONS: StudioSession[] = [
  {
    id: 1,
    venueId: 1,
    venueName: "강남 풋살파크",
    competitionName: "2026 봄 풋살 챔피언십",
    matchName: "A조 1경기",
    startTime: "2026-03-19T14:00:00",
    endTime: "2026-03-19T16:00:00",
    status: "RECORDING",
    cameras: [
      { id: 1, name: "AI-CAM-01", type: "AI", status: "RECORDING", resolution: "4K", fps: 30, bitrate: "25Mbps" },
      { id: 2, name: "PANO-01", type: "PANO", status: "RECORDING", resolution: "8K", fps: 30, bitrate: "60Mbps" },
      { id: 3, name: "SIDE-A-01", type: "SIDE_A", status: "RECORDING", resolution: "1080p", fps: 60, bitrate: "15Mbps" },
      { id: 4, name: "CAM-01", type: "CAM", status: "ONLINE", resolution: "1080p", fps: 30, bitrate: "10Mbps" },
    ],
    assignee: "김촬영",
    storageUsedGB: 45.2,
    storageTotalGB: 100,
    createdBy: "관리자",
    createdAt: "2026-03-15",
  },
  {
    id: 2,
    venueId: 2,
    venueName: "인천 야구장",
    competitionName: "인천 야구 리그",
    matchName: "개막전",
    startTime: "2026-03-19T18:00:00",
    endTime: "2026-03-19T21:00:00",
    status: "STANDBY",
    cameras: [
      { id: 5, name: "AI-CAM-02", type: "AI", status: "ONLINE", resolution: "4K", fps: 30, bitrate: "25Mbps" },
      { id: 6, name: "PANO-02", type: "PANO", status: "ONLINE", resolution: "8K", fps: 30, bitrate: "60Mbps" },
      { id: 7, name: "CAM-02", type: "CAM", status: "OFFLINE", resolution: "1080p", fps: 30, bitrate: "10Mbps" },
    ],
    assignee: "박엔지니어",
    storageUsedGB: 0,
    storageTotalGB: 100,
    createdBy: "운영자",
    createdAt: "2026-03-10",
  },
  {
    id: 3,
    venueId: 3,
    venueName: "잠실 체육관",
    competitionName: "서울 배구 리그",
    matchName: "1라운드",
    startTime: "2026-03-20T14:00:00",
    endTime: "2026-03-20T16:00:00",
    status: "STANDBY",
    cameras: [
      { id: 8, name: "AI-CAM-03", type: "AI", status: "ONLINE", resolution: "4K", fps: 30, bitrate: "25Mbps" },
      { id: 9, name: "PANO-03", type: "PANO", status: "ONLINE", resolution: "8K", fps: 30, bitrate: "60Mbps" },
      { id: 10, name: "SIDE-A-02", type: "SIDE_A", status: "ONLINE", resolution: "1080p", fps: 60, bitrate: "15Mbps" },
    ],
    assignee: "이기술",
    storageUsedGB: 0,
    storageTotalGB: 100,
    createdBy: "관리자",
    createdAt: "2026-03-12",
  },
  {
    id: 4,
    venueId: 4,
    venueName: "수원 월드컵경기장",
    competitionName: "수원 축구 챔피언십",
    matchName: "준결승",
    startTime: "2026-03-18T19:00:00",
    endTime: "2026-03-18T21:00:00",
    status: "COMPLETED",
    cameras: [
      { id: 11, name: "AI-CAM-04", type: "AI", status: "ONLINE", resolution: "4K", fps: 30, bitrate: "25Mbps" },
      { id: 12, name: "PANO-04", type: "PANO", status: "ONLINE", resolution: "8K", fps: 30, bitrate: "60Mbps" },
      { id: 13, name: "SIDE-A-03", type: "SIDE_A", status: "ONLINE", resolution: "1080p", fps: 60, bitrate: "15Mbps" },
      { id: 14, name: "CAM-03", type: "CAM", status: "ONLINE", resolution: "1080p", fps: 30, bitrate: "10Mbps" },
    ],
    assignee: "김촬영",
    storageUsedGB: 82.5,
    storageTotalGB: 100,
    createdBy: "관리자",
    createdAt: "2026-03-10",
  },
  {
    id: 5,
    venueId: 5,
    venueName: "마포 체육관",
    competitionName: "3on3 챌린지",
    matchName: "예선 1경기",
    startTime: "2026-03-19T10:00:00",
    endTime: "2026-03-19T12:00:00",
    status: "RECORDING",
    cameras: [
      { id: 15, name: "AI-CAM-05", type: "AI", status: "RECORDING", resolution: "4K", fps: 30, bitrate: "25Mbps" },
      { id: 16, name: "CAM-04", type: "CAM", status: "RECORDING", resolution: "1080p", fps: 30, bitrate: "10Mbps" },
    ],
    assignee: "최현장",
    storageUsedGB: 22.3,
    storageTotalGB: 50,
    createdBy: "운영자",
    createdAt: "2026-03-14",
  },
  {
    id: 6,
    venueId: 1,
    venueName: "강남 풋살파크",
    competitionName: "2026 봄 풋살 챔피언십",
    matchName: "B조 1경기",
    startTime: "2026-03-17T14:00:00",
    endTime: "2026-03-17T16:00:00",
    status: "COMPLETED",
    cameras: [
      { id: 17, name: "AI-CAM-06", type: "AI", status: "ONLINE", resolution: "4K", fps: 30, bitrate: "25Mbps" },
      { id: 18, name: "PANO-05", type: "PANO", status: "ONLINE", resolution: "8K", fps: 30, bitrate: "60Mbps" },
    ],
    assignee: "김촬영",
    storageUsedGB: 65.0,
    storageTotalGB: 100,
    createdBy: "관리자",
    createdAt: "2026-03-08",
  },
  {
    id: 7,
    venueId: 6,
    venueName: "대전 축구장",
    competitionName: "대전 시민 축구대회",
    matchName: "결승전",
    startTime: "2026-03-19T15:00:00",
    endTime: "2026-03-19T17:00:00",
    status: "ERROR",
    cameras: [
      { id: 19, name: "AI-CAM-07", type: "AI", status: "ERROR", resolution: "4K", fps: 30, bitrate: "0Mbps" },
      { id: 20, name: "PANO-06", type: "PANO", status: "ONLINE", resolution: "8K", fps: 30, bitrate: "60Mbps" },
      { id: 21, name: "CAM-05", type: "CAM", status: "OFFLINE", resolution: "1080p", fps: 30, bitrate: "0Mbps" },
    ],
    assignee: "박엔지니어",
    storageUsedGB: 12.8,
    storageTotalGB: 100,
    createdBy: "운영자",
    createdAt: "2026-03-11",
  },
  {
    id: 8,
    venueId: 3,
    venueName: "잠실 체육관",
    competitionName: "전국 체육대회",
    matchName: "예선 A조",
    startTime: "2026-03-21T09:00:00",
    endTime: "2026-03-21T12:00:00",
    status: "STANDBY",
    cameras: [
      { id: 22, name: "AI-CAM-08", type: "AI", status: "ONLINE", resolution: "4K", fps: 30, bitrate: "25Mbps" },
      { id: 23, name: "PANO-07", type: "PANO", status: "ONLINE", resolution: "8K", fps: 30, bitrate: "60Mbps" },
      { id: 24, name: "SIDE-A-04", type: "SIDE_A", status: "ONLINE", resolution: "1080p", fps: 60, bitrate: "15Mbps" },
      { id: 25, name: "CAM-06", type: "CAM", status: "ONLINE", resolution: "1080p", fps: 30, bitrate: "10Mbps" },
    ],
    assignee: "이기술",
    storageUsedGB: 0,
    storageTotalGB: 200,
    createdBy: "관리자",
    createdAt: "2026-03-16",
  },
];

const VENUE_OPTIONS = [
  { id: 1, name: "강남 풋살파크" },
  { id: 2, name: "인천 야구장" },
  { id: 3, name: "잠실 체육관" },
  { id: 4, name: "수원 월드컵경기장" },
  { id: 5, name: "마포 체육관" },
  { id: 6, name: "대전 축구장" },
];

let nextSessionId = 9;

// ── Helpers ────────────────────────────────────────────────────────

function delay(ms = 300): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ── APIs ───────────────────────────────────────────────────────────

export async function getStudioSessions(
  filters: SessionFilter
): Promise<StudioSession[]> {
  await delay();

  let filtered = [...MOCK_SESSIONS];

  if (filters.status) {
    filtered = filtered.filter((s) => s.status === filters.status);
  }
  if (filters.venueId) {
    filtered = filtered.filter((s) => s.venueId === filters.venueId);
  }
  if (filters.dateFrom) {
    filtered = filtered.filter((s) => s.startTime >= filters.dateFrom!);
  }
  if (filters.dateTo) {
    filtered = filtered.filter((s) => s.startTime <= filters.dateTo!);
  }

  return filtered.sort(
    (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
  );
}

export async function getStudioSession(
  id: number
): Promise<StudioSession | null> {
  await delay(150);
  return MOCK_SESSIONS.find((s) => s.id === id) ?? null;
}

export async function createStudioSession(
  data: SessionCreateRequest
): Promise<StudioSession> {
  await delay();

  const venue = VENUE_OPTIONS.find((v) => v.id === data.venueId);
  const cameras: StudioCamera[] = data.cameraConfig.map((type, idx) => ({
    id: nextSessionId * 100 + idx,
    name: `${type}-${String(nextSessionId).padStart(2, "0")}`,
    type,
    status: "ONLINE" as CameraStatus,
    resolution: type === "PANO" ? "8K" : "4K",
    fps: type === "SIDE_A" ? 60 : 30,
    bitrate: type === "PANO" ? "60Mbps" : "25Mbps",
  }));

  const session: StudioSession = {
    id: nextSessionId++,
    venueId: data.venueId,
    venueName: venue?.name || "",
    competitionName: data.competitionName,
    matchName: data.matchName,
    startTime: data.scheduledStartTime,
    endTime: data.scheduledEndTime,
    status: "STANDBY",
    cameras,
    assignee: "관리자",
    storageUsedGB: 0,
    storageTotalGB: 100,
    createdBy: "관리자",
    createdAt: new Date().toISOString().slice(0, 10),
  };

  MOCK_SESSIONS.push(session);
  return session;
}

export async function deleteStudioSession(id: number): Promise<void> {
  await delay();
  MOCK_SESSIONS = MOCK_SESSIONS.filter((s) => s.id !== id);
}

export async function getStudioVenueOptions(): Promise<
  { id: number; name: string }[]
> {
  await delay(100);
  return VENUE_OPTIONS;
}

export function getSessionKPIs(sessions: StudioSession[]) {
  const today = new Date().toISOString().slice(0, 10);
  return {
    activeSessions: sessions.filter(
      (s) => s.status === "RECORDING" || s.status === "STANDBY"
    ).length,
    scheduledToday: sessions.filter(
      (s) => s.startTime.startsWith(today) && s.status === "STANDBY"
    ).length,
    recording: sessions.filter((s) => s.status === "RECORDING").length,
    completed: sessions.filter((s) => s.status === "COMPLETED").length,
  };
}
