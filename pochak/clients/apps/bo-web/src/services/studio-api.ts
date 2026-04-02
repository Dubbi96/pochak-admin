/**
 * Studio Admin API service (Session management)
 * Calls real admin API via gateway.
 */

import { gatewayApi } from "@/lib/api-client";

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

// ── APIs ───────────────────────────────────────────────────────────

export async function getStudioSessions(
  filters: SessionFilter,
  page = 0,
  size = 20
): Promise<StudioSession[]> {
  const params: Record<string, string> = { page: String(page), size: String(size) };
  if (filters.status) params.status = filters.status;
  if (filters.venueId) params.venueId = String(filters.venueId);
  if (filters.dateFrom) params.dateFrom = filters.dateFrom;
  if (filters.dateTo) params.dateTo = filters.dateTo;

  return gatewayApi.get<StudioSession[]>("/api/v1/admin/studio/sessions", params);
}

export async function getStudioSession(
  id: number
): Promise<StudioSession> {
  return gatewayApi.get<StudioSession>(`/api/v1/admin/studio/sessions/${id}`);
}

export async function createStudioSession(
  data: SessionCreateRequest
): Promise<StudioSession> {
  return gatewayApi.post<StudioSession>("/api/v1/admin/studio/sessions", data);
}

export async function deleteStudioSession(id: number): Promise<void> {
  return gatewayApi.delete(`/api/v1/admin/studio/sessions/${id}`);
}

export async function getStudioVenueOptions(): Promise<
  { id: number; name: string }[]
> {
  return gatewayApi.get<{ id: number; name: string }[]>("/api/v1/admin/studio/venues/options");
}

export async function getSessionKPIs(
  filters?: SessionFilter
): Promise<{ activeSessions: number; scheduledToday: number; recording: number; completed: number }> {
  const params: Record<string, string> = {};
  if (filters?.status) params.status = filters.status;
  if (filters?.venueId) params.venueId = String(filters.venueId);
  if (filters?.dateFrom) params.dateFrom = filters.dateFrom;
  if (filters?.dateTo) params.dateTo = filters.dateTo;

  return gatewayApi.get<{ activeSessions: number; scheduledToday: number; recording: number; completed: number }>(
    "/api/v1/admin/studio/kpis",
    params
  );
}
