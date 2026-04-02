export type RecordingStatus = "SCHEDULED" | "RECORDING" | "COMPLETED" | "FAILED" | "CANCELLED";

export interface RecordingSession {
  id: number;
  venueId: number;
  venueName: string;
  district: string;
  sportCode: string;
  sportName: string;
  matchId: number | null;
  matchTitle: string | null;
  cameraId: number;
  cameraName: string;
  vpuId: number | null;
  vpuName: string | null;
  scheduledStart: string;
  scheduledEnd: string;
  actualStart: string | null;
  actualEnd: string | null;
  status: RecordingStatus;
  duration: number | null;
  fileSize: number | null;
  contentId: number | null;
  shareCount: number;
  viewCount: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface RecordingFilter {
  venueId?: number | null;
  status?: RecordingStatus | null;
  sportCode?: string | null;
  district?: string | null;
  keyword?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export interface VenueRecordingSummary {
  venueId: number;
  venueName: string;
  district: string;
  totalSessions: number;
  activeSessions: number;
  completedToday: number;
  scheduledToday: number;
  failedToday: number;
}

export interface ShareStatItem {
  contentId: number;
  contentTitle: string;
  contentType: string;
  shareCount: number;
  viewCount: number;
  venueName: string;
  recordedAt: string;
}
