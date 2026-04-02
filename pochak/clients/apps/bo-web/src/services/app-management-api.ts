/**
 * App Management API service - 앱 버전 & 광고 관리
 * Calls real admin API via gateway.
 */

import { gatewayApi } from "@/lib/api-client";

// ── Types ──────────────────────────────────────────────────────────

export type Platform = "IOS" | "ANDROID";
export type VersionStatus = "ACTIVE" | "DEPRECATED" | "FORCE_UPDATE";
export type AdStatus = "ACTIVE" | "INACTIVE" | "SCHEDULED";
export type AdPlacement =
  | "HOME_TOP"
  | "HOME_MIDDLE"
  | "CONTENT_LIST"
  | "PLAYER_PAUSE";

export interface AppVersion {
  id: number;
  platform: Platform;
  version: string;
  buildNumber: number;
  status: VersionStatus;
  releaseNotes: string;
  minSupportedVersion: string;
  downloadUrl: string;
  releasedAt: string;
  createdAt: string;
}

export interface AppVersionCreateRequest {
  platform: Platform;
  version: string;
  buildNumber: number;
  status: VersionStatus;
  releaseNotes: string;
  minSupportedVersion: string;
  downloadUrl: string;
  releasedAt: string;
}

export interface Advertisement {
  id: number;
  title: string;
  imageUrl: string;
  linkUrl: string;
  placement: AdPlacement;
  status: AdStatus;
  startDate: string;
  endDate: string;
  impressions: number;
  clicks: number;
  createdAt: string;
}

export interface AdCreateRequest {
  title: string;
  imageUrl: string;
  linkUrl: string;
  placement: AdPlacement;
  status: AdStatus;
  startDate: string;
  endDate: string;
}

// ── Label Maps ─────────────────────────────────────────────────────

export const PLATFORM_LABELS: Record<Platform, string> = {
  IOS: "iOS",
  ANDROID: "Android",
};

export const VERSION_STATUS_LABELS: Record<VersionStatus, string> = {
  ACTIVE: "정상",
  DEPRECATED: "구버전",
  FORCE_UPDATE: "강제업데이트",
};

export const AD_STATUS_LABELS: Record<AdStatus, string> = {
  ACTIVE: "게시중",
  INACTIVE: "중지",
  SCHEDULED: "예약",
};

export const AD_PLACEMENT_LABELS: Record<AdPlacement, string> = {
  HOME_TOP: "홈 상단",
  HOME_MIDDLE: "홈 중간",
  CONTENT_LIST: "콘텐츠 목록",
  PLAYER_PAUSE: "플레이어 정지",
};

// ── App Version APIs ────────────────────────────────────────────────

export async function getAppVersions(): Promise<AppVersion[]> {
  return gatewayApi.get<AppVersion[]>("/api/v1/admin/app/versions");
}

export async function createAppVersion(
  data: AppVersionCreateRequest
): Promise<AppVersion> {
  return gatewayApi.post<AppVersion>("/api/v1/admin/app/versions", data);
}

export async function updateVersionStatus(
  id: number,
  status: VersionStatus
): Promise<AppVersion> {
  return gatewayApi.put<AppVersion>(`/api/v1/admin/app/versions/${id}/status`, { status });
}

// ── Advertisement APIs ──────────────────────────────────────────────

export async function getAdvertisements(): Promise<Advertisement[]> {
  return gatewayApi.get<Advertisement[]>("/api/v1/admin/app/advertisements");
}

export async function createAdvertisement(
  data: AdCreateRequest
): Promise<Advertisement> {
  return gatewayApi.post<Advertisement>("/api/v1/admin/app/advertisements", data);
}

export async function updateAdvertisement(
  id: number,
  data: Partial<AdCreateRequest>
): Promise<Advertisement> {
  return gatewayApi.put<Advertisement>(`/api/v1/admin/app/advertisements/${id}`, data);
}

export async function deleteAdvertisement(id: number): Promise<void> {
  return gatewayApi.delete(`/api/v1/admin/app/advertisements/${id}`);
}
