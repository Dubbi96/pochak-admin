// TODO: [Mock→Real API] Wire to real backend endpoints when app management backend is ready. Keep mock for now.
/**
 * App Management API service - 앱 버전 & 광고 관리
 * Currently returns mock data. Will be replaced with real API calls.
 */

import type { PageResponse } from "@/types/common";

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

// ── Mock Data ──────────────────────────────────────────────────────

let MOCK_VERSIONS: AppVersion[] = [
  {
    id: 1,
    platform: "IOS",
    version: "2.1.0",
    buildNumber: 210,
    status: "ACTIVE",
    releaseNotes: "- 홈 화면 UI 개선\n- 성능 최적화\n- 버그 수정",
    minSupportedVersion: "1.8.0",
    downloadUrl: "https://apps.apple.com/pochak",
    releasedAt: "2026-03-15",
    createdAt: "2026-03-10",
  },
  {
    id: 2,
    platform: "ANDROID",
    version: "2.1.0",
    buildNumber: 2100,
    status: "ACTIVE",
    releaseNotes: "- 홈 화면 UI 개선\n- 성능 최적화\n- 버그 수정",
    minSupportedVersion: "1.8.0",
    downloadUrl: "https://play.google.com/pochak",
    releasedAt: "2026-03-15",
    createdAt: "2026-03-10",
  },
  {
    id: 3,
    platform: "IOS",
    version: "2.0.5",
    buildNumber: 205,
    status: "DEPRECATED",
    releaseNotes: "- 버그 수정",
    minSupportedVersion: "1.8.0",
    downloadUrl: "https://apps.apple.com/pochak",
    releasedAt: "2026-02-20",
    createdAt: "2026-02-15",
  },
  {
    id: 4,
    platform: "ANDROID",
    version: "2.0.3",
    buildNumber: 2003,
    status: "FORCE_UPDATE",
    releaseNotes: "- 보안 취약점 패치",
    minSupportedVersion: "2.0.3",
    downloadUrl: "https://play.google.com/pochak",
    releasedAt: "2026-02-10",
    createdAt: "2026-02-05",
  },
];

let MOCK_ADS: Advertisement[] = [
  {
    id: 1,
    title: "봄 시즌 특별 할인",
    imageUrl: "https://cdn.pochak.co.kr/ads/spring-sale.jpg",
    linkUrl: "/commerce/season-pass",
    placement: "HOME_TOP",
    status: "ACTIVE",
    startDate: "2026-03-01",
    endDate: "2026-03-31",
    impressions: 12450,
    clicks: 892,
    createdAt: "2026-02-28",
  },
  {
    id: 2,
    title: "포착 PRO 시즌권",
    imageUrl: "https://cdn.pochak.co.kr/ads/pro-season.jpg",
    linkUrl: "/commerce/season-pass",
    placement: "HOME_MIDDLE",
    status: "ACTIVE",
    startDate: "2026-03-10",
    endDate: "2026-04-10",
    impressions: 8320,
    clicks: 534,
    createdAt: "2026-03-08",
  },
  {
    id: 3,
    title: "신규가입 뽈 1000개",
    imageUrl: "https://cdn.pochak.co.kr/ads/signup-bonus.jpg",
    linkUrl: "/signup",
    placement: "CONTENT_LIST",
    status: "SCHEDULED",
    startDate: "2026-04-01",
    endDate: "2026-04-30",
    impressions: 0,
    clicks: 0,
    createdAt: "2026-03-19",
  },
  {
    id: 4,
    title: "프리미엄 경기 패키지",
    imageUrl: "https://cdn.pochak.co.kr/ads/premium-match.jpg",
    linkUrl: "/contents",
    placement: "PLAYER_PAUSE",
    status: "INACTIVE",
    startDate: "2026-02-01",
    endDate: "2026-02-28",
    impressions: 45678,
    clicks: 2341,
    createdAt: "2026-01-30",
  },
];

let nextVersionId = 5;
let nextAdId = 5;

function delay(ms = 300): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ── App Version APIs ────────────────────────────────────────────────

export async function getAppVersions(
  platform?: Platform | null,
  page = 0,
  size = 20
): Promise<PageResponse<AppVersion>> {
  await delay();

  let filtered = [...MOCK_VERSIONS];
  if (platform) {
    filtered = filtered.filter((v) => v.platform === platform);
  }
  filtered.sort(
    (a, b) => new Date(b.releasedAt).getTime() - new Date(a.releasedAt).getTime()
  );

  const start = page * size;
  const content = filtered.slice(start, start + size);
  return {
    content,
    totalElements: filtered.length,
    totalPages: Math.ceil(filtered.length / size) || 1,
    page,
    size,
  };
}

export async function createAppVersion(
  req: AppVersionCreateRequest
): Promise<AppVersion> {
  await delay();
  const version: AppVersion = {
    id: nextVersionId++,
    ...req,
    impressions: 0,
    clicks: 0,
    createdAt: new Date().toISOString().slice(0, 10),
  } as AppVersion & { impressions: number; clicks: number };
  MOCK_VERSIONS.push(version);
  return version;
}

export async function updateVersionStatus(
  id: number,
  status: VersionStatus
): Promise<AppVersion> {
  await delay();
  const idx = MOCK_VERSIONS.findIndex((v) => v.id === id);
  if (idx < 0) throw new Error("Not found");
  MOCK_VERSIONS[idx] = { ...MOCK_VERSIONS[idx], status };
  return MOCK_VERSIONS[idx];
}

// ── Advertisement APIs ──────────────────────────────────────────────

export async function getAdvertisements(
  placement?: AdPlacement | null,
  status?: AdStatus | null,
  page = 0,
  size = 20
): Promise<PageResponse<Advertisement>> {
  await delay();

  let filtered = [...MOCK_ADS];
  if (placement) {
    filtered = filtered.filter((a) => a.placement === placement);
  }
  if (status) {
    filtered = filtered.filter((a) => a.status === status);
  }
  filtered.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const start = page * size;
  const content = filtered.slice(start, start + size);
  return {
    content,
    totalElements: filtered.length,
    totalPages: Math.ceil(filtered.length / size) || 1,
    page,
    size,
  };
}

export async function createAdvertisement(
  req: AdCreateRequest
): Promise<Advertisement> {
  await delay();
  const ad: Advertisement = {
    id: nextAdId++,
    ...req,
    impressions: 0,
    clicks: 0,
    createdAt: new Date().toISOString().slice(0, 10),
  };
  MOCK_ADS.push(ad);
  return ad;
}

export async function updateAdvertisement(
  id: number,
  req: Partial<AdCreateRequest>
): Promise<Advertisement> {
  await delay();
  const idx = MOCK_ADS.findIndex((a) => a.id === id);
  if (idx < 0) throw new Error("Not found");
  MOCK_ADS[idx] = { ...MOCK_ADS[idx], ...req };
  return MOCK_ADS[idx];
}

export async function deleteAdvertisement(id: number): Promise<void> {
  await delay();
  MOCK_ADS = MOCK_ADS.filter((a) => a.id !== id);
}
