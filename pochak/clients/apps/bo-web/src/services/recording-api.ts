/**
 * Recording Session Admin API service
 * Manages recording sessions, venue summaries, and share statistics.
 */

import type { PageResponse } from "@/types/common";
import type {
  RecordingSession,
  RecordingFilter,
  VenueRecordingSummary,
  ShareStatItem,
  RecordingStatus,
} from "@/types/recording";
import { gatewayApi } from "@/lib/api-client";

// ── Labels ───────────────────────────────────────────────────────────

export const RECORDING_STATUS_LABELS: Record<RecordingStatus, string> = {
  SCHEDULED: "예약",
  RECORDING: "촬영 중",
  COMPLETED: "완료",
  FAILED: "실패",
  CANCELLED: "취소",
};

// ── API calls ────────────────────────────────────────────────────────

export async function getRecordingSessions(
  filter: RecordingFilter
): Promise<PageResponse<RecordingSession>> {
  const params: Record<string, string> = {};
  if (filter.venueId) params.venueId = String(filter.venueId);
  if (filter.status) params.status = filter.status;
  if (filter.sportCode) params.sportCode = filter.sportCode;
  if (filter.district) params.district = filter.district;
  if (filter.keyword) params.keyword = filter.keyword;
  if (filter.dateFrom) params.dateFrom = filter.dateFrom;
  if (filter.dateTo) params.dateTo = filter.dateTo;
  if (filter.page !== undefined) params.page = String(filter.page);
  if (filter.size !== undefined) params.size = String(filter.size);
  if (filter.sort) params.sort = filter.sort;

  return gatewayApi.get<PageResponse<RecordingSession>>(
    "/api/bo/recordings",
    params
  );
}

export async function getRecordingById(
  id: number
): Promise<RecordingSession> {
  return gatewayApi.get<RecordingSession>(`/api/bo/recordings/${id}`);
}

export async function forceTerminateRecording(
  id: number
): Promise<void> {
  await gatewayApi.post(`/api/bo/recordings/${id}/terminate`);
}

export async function getVenueRecordingSummaries(): Promise<
  VenueRecordingSummary[]
> {
  return gatewayApi.get<VenueRecordingSummary[]>(
    "/api/bo/recordings/venue-summary"
  );
}

export async function getShareStatistics(params?: {
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  size?: number;
}): Promise<PageResponse<ShareStatItem>> {
  const q: Record<string, string> = {};
  if (params?.dateFrom) q.dateFrom = params.dateFrom;
  if (params?.dateTo) q.dateTo = params.dateTo;
  if (params?.page !== undefined) q.page = String(params.page);
  if (params?.size !== undefined) q.size = String(params.size);

  return gatewayApi.get<PageResponse<ShareStatItem>>(
    "/api/bo/recordings/share-stats",
    q
  );
}

export async function getCalendarSessions(
  year: number,
  month: number,
  venueId?: number
): Promise<RecordingSession[]> {
  const params: Record<string, string> = {
    year: String(year),
    month: String(month),
  };
  if (venueId) params.venueId = String(venueId);

  return gatewayApi.get<RecordingSession[]>(
    "/api/bo/recordings/calendar",
    params
  );
}
