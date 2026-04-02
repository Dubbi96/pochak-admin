/**
 * Streaming Ingest & VOD Upload API service
 * Calls real admin API via gateway.
 */

import { gatewayApi } from "@/lib/api-client";

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

export interface CompletedLiveSession {
  id: number;
  matchName: string;
  venueName: string;
  cameraLabel: string;
  endedAt: string;
  durationSeconds: number;
}

// ── Ingest Endpoint APIs ────────────────────────────────────────────────────

export async function getActiveEndpoints(): Promise<IngestEndpoint[]> {
  return gatewayApi.get<IngestEndpoint[]>("/api/v1/admin/streaming/endpoints");
}

export async function getEndpointStatus(id: number): Promise<IngestStatus> {
  return gatewayApi.get<IngestStatus>(`/api/v1/admin/streaming/endpoints/${id}/status`);
}

export async function createIngestEndpoint(
  data: CreateIngestRequest
): Promise<IngestEndpoint> {
  return gatewayApi.post<IngestEndpoint>("/api/v1/admin/streaming/endpoints", data);
}

export async function startTranscoding(
  data: { endpointId: number }
): Promise<TranscodeSession> {
  return gatewayApi.post<TranscodeSession>("/api/v1/admin/streaming/transcode", data);
}

// ── VOD Processing APIs ─────────────────────────────────────────────────────

export async function getProcessingJobs(): Promise<VodProcessingJob[]> {
  return gatewayApi.get<VodProcessingJob[]>("/api/v1/admin/streaming/jobs");
}

export async function getProcessingJobStatus(
  id: number
): Promise<VodProcessingJob> {
  return gatewayApi.get<VodProcessingJob>(`/api/v1/admin/streaming/jobs/${id}/status`);
}

export async function createUploadTicket(
  data: CreateUploadRequest
): Promise<UploadTicket> {
  return gatewayApi.post<UploadTicket>("/api/v1/admin/streaming/upload-ticket", data);
}

export async function confirmUpload(
  data: { ticketId: number }
): Promise<VodProcessingJob> {
  return gatewayApi.post<VodProcessingJob>("/api/v1/admin/streaming/upload-confirm", data);
}

export async function convertLiveToVod(
  data: LiveToVodRequest
): Promise<VodProcessingJob> {
  return gatewayApi.post<VodProcessingJob>("/api/v1/admin/streaming/live-to-vod", data);
}

// ── Completed live sessions (for live-to-vod dialog) ────────────────────────

export async function getCompletedLiveSessions(): Promise<CompletedLiveSession[]> {
  return gatewayApi.get<CompletedLiveSession[]>("/api/v1/admin/streaming/completed-sessions");
}
