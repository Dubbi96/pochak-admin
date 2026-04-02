/**
 * Content Asset Management API service (Live, VOD, Clip, Tag)
 * Calls real admin API via gateway, with mock fallback.
 */

import type { PageResponse } from "@/types/common";
import type {
  LiveAsset,
  VodAsset,
  ClipAsset,
  AssetTag,
  TagItem,
  ContentFilter,
  ClipFilter,
  TagFilter,
  AssetVisibility,
  LiveCreateRequest,
  VodCreateRequest,
} from "@/types/content-asset";
import { gatewayApi } from "@/lib/api-client";

// ── Helper ─────────────────────────────────────────────────────────────────────

function delay(ms = 300): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ── Live Asset APIs ────────────────────────────────────────────────────────────

export async function getLiveAssets(
  filters: ContentFilter,
  page = 0,
  size = 20
): Promise<PageResponse<LiveAsset>> {
  // Try real API first
  const params: Record<string, string> = {
    page: String(page),
    size: String(size),
  };
  if (filters.ownerType) params.ownerType = filters.ownerType;
  if (filters.venueId) params.venueId = String(filters.venueId);
  if (filters.visibility) params.visibility = filters.visibility;
  if (filters.dateFrom) params.dateFrom = filters.dateFrom;
  if (filters.dateTo) params.dateTo = filters.dateTo;

  const apiResult = await gatewayApi.get<PageResponse<LiveAsset>>(
    "/api/v1/admin/live-assets",
    params
  );
  if (apiResult) return apiResult;

  // Mock fallback
  console.warn("[content-asset-api] Backend unavailable, using mock data");
  await delay();

  let filtered = [...liveData];

  if (filters.ownerType) {
    filtered = filtered.filter((a) => a.ownerType === filters.ownerType);
  }
  if (filters.venueId) {
    filtered = filtered.filter((a) => a.venueId === filters.venueId);
  }
  if (filters.visibility) {
    filtered = filtered.filter((a) => a.visibility === filters.visibility);
  }
  if (filters.dateFrom) {
    filtered = filtered.filter((a) => a.startTime >= filters.dateFrom!);
  }
  if (filters.dateTo) {
    filtered = filtered.filter((a) => a.startTime <= filters.dateTo!);
  }

  const start = page * size;
  const content = filtered.slice(start, start + size);

  return {
    content,
    totalElements: filtered.length,
    totalPages: Math.ceil(filtered.length / size),
    page,
    size,
  };
}

export async function createLiveAsset(
  data: LiveCreateRequest
): Promise<LiveAsset> {
  // Try real API first
  const apiResult = await gatewayApi.post<LiveAsset>("/api/v1/admin/live-assets", data);
  if (apiResult) return apiResult;

  // Mock fallback
  console.warn("[content-asset-api] Backend unavailable, using mock data");
  await delay();

  const asset: LiveAsset = {
    id: nextLiveId++,
    organizationName: data.organizationId ? "단체명" : null,
    branchName: data.branchId ? "지점명" : null,
    venueName: "구장명",
    matchName: data.matchName,
    startTime: data.startTime,
    endTime: data.endTime,
    contentType: "LIVE",
    visibility: data.visibility,
    ownerType: data.ownerType,
    venueId: data.venueId,
    sportId: data.sportId || null,
    sportName: data.sportId ? "종목명" : null,
    streamUrl: data.streamUrl || null,
    panoramaUrl: data.panoramaUrl || null,
    thumbnailUrl: data.thumbnailUrl || null,
    description: data.description || null,
    price: data.price,
    createdAt: new Date().toISOString(),
  };

  liveData.push(asset);
  return asset;
}

export async function updateLiveVisibility(
  ids: number[],
  visibility: AssetVisibility
): Promise<void> {
  // Try real API first
  const apiResult = await gatewayApi.put("/api/v1/admin/live-assets/visibility", { ids, visibility });
  if (apiResult !== null) return;

  // Mock fallback
  console.warn("[content-asset-api] Backend unavailable, using mock data");
  await delay();
  liveData = liveData.map((a) =>
    ids.includes(a.id) ? { ...a, visibility } : a
  );
}

// ── VOD Asset APIs ─────────────────────────────────────────────────────────────

export async function getVodAssets(
  filters: ContentFilter,
  page = 0,
  size = 20
): Promise<PageResponse<VodAsset>> {
  // Try real API first
  const params: Record<string, string> = {
    page: String(page),
    size: String(size),
  };
  if (filters.ownerType) params.ownerType = filters.ownerType;
  if (filters.venueId) params.venueId = String(filters.venueId);
  if (filters.visibility) params.visibility = filters.visibility;
  if (filters.dateFrom) params.dateFrom = filters.dateFrom;
  if (filters.dateTo) params.dateTo = filters.dateTo;

  const apiResult = await gatewayApi.get<PageResponse<VodAsset>>(
    "/api/v1/admin/videos",
    params
  );
  if (apiResult) return apiResult;

  // Mock fallback
  console.warn("[content-asset-api] Backend unavailable, using mock data");
  await delay();

  let filtered = [...vodData];

  if (filters.ownerType) {
    filtered = filtered.filter((a) => a.ownerType === filters.ownerType);
  }
  if (filters.venueId) {
    filtered = filtered.filter((a) => a.venueId === filters.venueId);
  }
  if (filters.visibility) {
    filtered = filtered.filter((a) => a.visibility === filters.visibility);
  }
  if (filters.dateFrom) {
    filtered = filtered.filter((a) => a.startTime >= filters.dateFrom!);
  }
  if (filters.dateTo) {
    filtered = filtered.filter((a) => a.startTime <= filters.dateTo!);
  }

  const start = page * size;
  const content = filtered.slice(start, start + size);

  return {
    content,
    totalElements: filtered.length,
    totalPages: Math.ceil(filtered.length / size),
    page,
    size,
  };
}

export async function createVodAsset(
  data: VodCreateRequest
): Promise<VodAsset> {
  // Try real API first
  const apiResult = await gatewayApi.post<VodAsset>("/api/v1/admin/videos", data);
  if (apiResult) return apiResult;

  // Mock fallback
  console.warn("[content-asset-api] Backend unavailable, using mock data");
  await delay();

  const asset: VodAsset = {
    id: nextVodId++,
    organizationName: data.organizationId ? "단체명" : null,
    branchName: data.branchId ? "지점명" : null,
    venueName: "구장명",
    matchName: data.matchName,
    startTime: data.startTime,
    endTime: data.endTime,
    contentType: "VOD",
    visibility: data.visibility,
    encodingStatus: "PENDING",
    ownerType: data.ownerType,
    venueId: data.venueId,
    sportId: data.sportId || null,
    sportName: data.sportId ? "종목명" : null,
    vodUrl: data.vodUrl || null,
    panoramaUrl: data.panoramaUrl || null,
    thumbnailUrl: data.thumbnailUrl || null,
    description: data.description || null,
    price: data.price,
    linkedLiveId: data.linkedLiveId || null,
    createdAt: new Date().toISOString(),
  };

  vodData.push(asset);
  return asset;
}

export async function updateVodVisibility(
  ids: number[],
  visibility: AssetVisibility
): Promise<void> {
  // Try real API first
  const apiResult = await gatewayApi.put("/api/v1/admin/videos/visibility", { ids, visibility });
  if (apiResult !== null) return;

  // Mock fallback
  console.warn("[content-asset-api] Backend unavailable, using mock data");
  await delay();
  vodData = vodData.map((a) =>
    ids.includes(a.id) ? { ...a, visibility } : a
  );
}

// ── Clip Asset APIs ────────────────────────────────────────────────────────────

export async function getClipAssets(
  filters: ClipFilter,
  page = 0,
  size = 20
): Promise<PageResponse<ClipAsset>> {
  // Try real API first
  const params: Record<string, string> = {
    page: String(page),
    size: String(size),
  };
  if (filters.matchName) params.matchName = filters.matchName;
  if (filters.clipType) params.clipType = filters.clipType;
  if (filters.clipName) params.clipName = filters.clipName;
  if (filters.dateFrom) params.dateFrom = filters.dateFrom;
  if (filters.dateTo) params.dateTo = filters.dateTo;

  const apiResult = await gatewayApi.get<PageResponse<ClipAsset>>(
    "/api/v1/admin/clips",
    params
  );
  if (apiResult) return apiResult;

  // Mock fallback
  console.warn("[content-asset-api] Backend unavailable, using mock data");
  await delay();

  let filtered = [...clipData];

  if (filters.matchName) {
    const kw = filters.matchName.toLowerCase();
    filtered = filtered.filter((c) =>
      c.matchName.toLowerCase().includes(kw)
    );
  }
  if (filters.clipType) {
    filtered = filtered.filter((c) => c.clipType === filters.clipType);
  }
  if (filters.clipName) {
    const kw = filters.clipName.toLowerCase();
    filtered = filtered.filter((c) =>
      c.clipName.toLowerCase().includes(kw)
    );
  }
  if (filters.dateFrom) {
    filtered = filtered.filter((c) => c.createdAt >= filters.dateFrom!);
  }
  if (filters.dateTo) {
    filtered = filtered.filter((c) => c.createdAt <= filters.dateTo!);
  }

  const start = page * size;
  const content = filtered.slice(start, start + size);

  return {
    content,
    totalElements: filtered.length,
    totalPages: Math.ceil(filtered.length / size),
    page,
    size,
  };
}

export async function updateClipVisibility(
  ids: number[],
  visibility: AssetVisibility
): Promise<void> {
  // Try real API first
  const apiResult = await gatewayApi.put("/api/v1/admin/clips/visibility", { ids, visibility });
  if (apiResult !== null) return;

  // Mock fallback
  console.warn("[content-asset-api] Backend unavailable, using mock data");
  await delay();
  clipData = clipData.map((c) =>
    ids.includes(c.id) ? { ...c, visibility } : c
  );
}

// ── Tag APIs ───────────────────────────────────────────────────────────────────

export async function getAssetTags(
  filters: TagFilter,
  page = 0,
  size = 20
): Promise<PageResponse<AssetTag>> {
  // Try real API first
  const params: Record<string, string> = {
    page: String(page),
    size: String(size),
  };
  if (filters.contentType) params.contentType = filters.contentType;
  if (filters.matchName) params.matchName = filters.matchName;
  if (filters.dateFrom) params.dateFrom = filters.dateFrom;
  if (filters.dateTo) params.dateTo = filters.dateTo;

  const apiResult = await gatewayApi.get<PageResponse<AssetTag>>(
    "/api/v1/admin/tags",
    params
  );
  if (apiResult) return apiResult;

  // Mock fallback
  console.warn("[content-asset-api] Backend unavailable, using mock data");
  await delay();

  let filtered = [...tagData];

  if (filters.contentType) {
    filtered = filtered.filter((t) => t.contentType === filters.contentType);
  }
  if (filters.matchName) {
    const kw = filters.matchName.toLowerCase();
    filtered = filtered.filter((t) =>
      t.matchName.toLowerCase().includes(kw)
    );
  }
  if (filters.dateFrom) {
    filtered = filtered.filter((t) => t.createdAt >= filters.dateFrom!);
  }
  if (filters.dateTo) {
    filtered = filtered.filter((t) => t.createdAt <= filters.dateTo!);
  }

  const start = page * size;
  const content = filtered.slice(start, start + size);

  return {
    content,
    totalElements: filtered.length,
    totalPages: Math.ceil(filtered.length / size),
    page,
    size,
  };
}

export async function getTagsByMatch(matchId: number): Promise<TagItem[]> {
  // Try real API first
  const apiResult = await gatewayApi.get<TagItem[]>(
    `/api/v1/admin/tags/match/${matchId}`
  );
  if (apiResult) return apiResult;

  // Mock fallback
  console.warn("[content-asset-api] Backend unavailable, using mock data");
  await delay();
  const match = tagData.find((t) => t.id === matchId);
  return match?.tags ?? [];
}

// ── Dropdown Data ──────────────────────────────────────────────────────────────

export async function getVenueOptions(): Promise<
  { id: number; name: string }[]
> {
  // Try real API first
  const apiResult = await gatewayApi.get<{ id: number; name: string }[]>(
    "/api/v1/admin/venues/options"
  );
  if (apiResult) return apiResult;

  // Mock fallback
  console.warn("[content-asset-api] Backend unavailable, using mock data");
  await delay(100);
  return [
    { id: 1, name: "화랑대기 1구장" },
    { id: 2, name: "화랑대기 2구장" },
    { id: 3, name: "화랑대기 3구장" },
    { id: 4, name: "인천 리틀야구장" },
    { id: 5, name: "서울 올림픽테니스장" },
    { id: 6, name: "서울 풋살파크" },
  ];
}

export async function getOrganizationOptions(): Promise<
  { id: number; name: string }[]
> {
  // Try real API first
  const apiResult = await gatewayApi.get<{ id: number; name: string }[]>(
    "/api/v1/admin/organizations/options"
  );
  if (apiResult) return apiResult;

  // Mock fallback
  console.warn("[content-asset-api] Backend unavailable, using mock data");
  await delay(100);
  return [
    { id: 1, name: "서울시체육회" },
    { id: 2, name: "나이키코리아" },
  ];
}

export async function getBranchOptions(
  _orgId: number
): Promise<{ id: number; name: string }[]> {
  // Try real API first
  const apiResult = await gatewayApi.get<{ id: number; name: string }[]>(
    `/api/v1/admin/organizations/${_orgId}/branches`
  );
  if (apiResult) return apiResult;

  // Mock fallback
  console.warn("[content-asset-api] Backend unavailable, using mock data");
  await delay(100);
  return [
    { id: 1, name: "마포지점" },
  ];
}

export async function getSportOptions(): Promise<
  { id: number; name: string }[]
> {
  // Try real API first
  const apiResult = await gatewayApi.get<{ id: number; name: string }[]>(
    "/api/v1/admin/sports/options"
  );
  if (apiResult) return apiResult;

  // Mock fallback
  console.warn("[content-asset-api] Backend unavailable, using mock data");
  await delay(100);
  return [
    { id: 1, name: "축구" },
    { id: 2, name: "농구" },
    { id: 3, name: "야구" },
    { id: 4, name: "배구" },
    { id: 5, name: "배드민턴" },
    { id: 6, name: "테니스" },
    { id: 7, name: "풋살" },
  ];
}

export async function getTournamentOptions(): Promise<
  { id: number; name: string }[]
> {
  // Try real API first
  const apiResult = await gatewayApi.get<{ id: number; name: string }[]>(
    "/api/v1/admin/competitions/options"
  );
  if (apiResult) return apiResult;

  // Mock fallback
  console.warn("[content-asset-api] Backend unavailable, using mock data");
  await delay(100);
  return [
    { id: 1, name: "2025 화랑대기 유소년축구" },
    { id: 2, name: "제5회 전국 리틀야구" },
    { id: 3, name: "나이키 에어맥스 프리데이" },
    { id: 4, name: "제30회 서울시 협회장기" },
    { id: 5, name: "2025 전국체전" },
  ];
}

// ── Mock Data ──────────────────────────────────────────────────────────────────
// Shared content ID mapping: BO uses numeric IDs internally.
// IDs 1-6 align with shared mock data: live-1..6, vod-1..6, clip-1..8

const mockLiveAssets: LiveAsset[] = [
  {
    id: 1, organizationName: "서울시체육회", branchName: "마포지점", venueName: "화랑대기 1구장",
    matchName: "경기용인YSFC vs 대구강북주니어", startTime: "2025-10-20T12:00:00", endTime: "2025-10-20T14:00:00",
    contentType: "LIVE", visibility: "PUBLIC", ownerType: "B2G", venueId: 1, sportId: 1, sportName: "축구",
    streamUrl: "https://cph-p2p-msl.akamaized.net/hls/live/2000341/test/master.m3u8",
    panoramaUrl: "https://cph-p2p-msl.akamaized.net/hls/live/2000341/test/master.m3u8",
    thumbnailUrl: "https://placehold.co/320x180?text=LIVE1", description: "2025 화랑대기 유소년축구", price: 0, createdAt: "2025-10-18T09:00:00",
  },
  {
    id: 2, organizationName: "서울시체육회", branchName: "마포지점", venueName: "화랑대기 2구장",
    matchName: "인천남동FC vs 수원삼성블루윙즈", startTime: "2025-10-20T12:00:00", endTime: "2025-10-20T14:00:00",
    contentType: "LIVE", visibility: "PUBLIC", ownerType: "B2G", venueId: 2, sportId: 1, sportName: "축구",
    streamUrl: "https://cph-p2p-msl.akamaized.net/hls/live/2000341/test/master.m3u8",
    panoramaUrl: null, thumbnailUrl: "https://placehold.co/320x180?text=LIVE2",
    description: "2025 화랑대기 유소년축구", price: 0, createdAt: "2025-10-18T09:00:00",
  },
  {
    id: 3, organizationName: "서울시체육회", branchName: "마포지점", venueName: "화랑대기 3구장",
    matchName: "서울강남FC vs 부산서면유소년", startTime: "2025-10-20T14:00:00", endTime: "2025-10-20T16:00:00",
    contentType: "LIVE", visibility: "PUBLIC", ownerType: "B2G", venueId: 3, sportId: 1, sportName: "축구",
    streamUrl: "https://cph-p2p-msl.akamaized.net/hls/live/2000341/test/master.m3u8",
    panoramaUrl: "https://cph-p2p-msl.akamaized.net/hls/live/2000341/test/master.m3u8",
    thumbnailUrl: "https://placehold.co/320x180?text=LIVE3", description: "2025 화랑대기 유소년축구", price: 0, createdAt: "2025-10-18T09:00:00",
  },
  {
    id: 4, organizationName: null, branchName: null, venueName: "인천 리틀야구장",
    matchName: "인천리틀스타 vs 수원이글스Jr", startTime: "2025-11-01T10:00:00", endTime: "2025-11-01T13:00:00",
    contentType: "LIVE", visibility: "PUBLIC", ownerType: "B2G", venueId: 4, sportId: 3, sportName: "야구",
    streamUrl: null, panoramaUrl: null, thumbnailUrl: "https://placehold.co/320x180?text=LIVE4",
    description: "제5회 전국 리틀야구", price: 0, createdAt: "2025-10-25T09:00:00",
  },
  {
    id: 5, organizationName: null, branchName: null, venueName: "서울 올림픽테니스장",
    matchName: "서울시협회장기 남자단식 결승", startTime: "2025-11-05T14:00:00", endTime: "2025-11-05T18:00:00",
    contentType: "LIVE", visibility: "PRIVATE", ownerType: "B2C", venueId: 5, sportId: 6, sportName: "테니스",
    streamUrl: null, panoramaUrl: null, thumbnailUrl: null,
    description: "제30회 서울시 협회장기 테니스 대회", price: 0, createdAt: "2025-10-28T09:00:00",
  },
  {
    id: 6, organizationName: "나이키코리아", branchName: null, venueName: "서울 풋살파크",
    matchName: "나이키 에어맥스 프리데이 결승", startTime: "2025-10-27T16:00:00", endTime: "2025-10-27T18:00:00",
    contentType: "LIVE", visibility: "PUBLIC", ownerType: "B2B", venueId: 6, sportId: 7, sportName: "풋살",
    streamUrl: null, panoramaUrl: null, thumbnailUrl: "https://placehold.co/320x180?text=LIVE6",
    description: "나이키 에어맥스 프리데이 풋살 대회", price: 0, createdAt: "2025-10-20T09:00:00",
  },
];

const mockVodAssets: VodAsset[] = [
  {
    id: 1, organizationName: "서울시체육회", branchName: "마포지점", venueName: "화랑대기 1구장",
    matchName: "경기용인YSFC vs 대구강북주니어", startTime: "2025-10-19T12:00:00", endTime: "2025-10-19T14:00:00",
    contentType: "VOD", visibility: "PUBLIC", encodingStatus: "COMPLETED", ownerType: "B2G", venueId: 1, sportId: 1, sportName: "축구",
    vodUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
    panoramaUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
    thumbnailUrl: "https://placehold.co/320x180?text=VOD1", description: "2025 화랑대기 유소년축구 하이라이트",
    price: 0, linkedLiveId: 1, createdAt: "2025-10-19T18:00:00",
  },
  {
    id: 2, organizationName: "서울시체육회", branchName: "마포지점", venueName: "화랑대기 2구장",
    matchName: "인천남동FC vs 수원삼성블루윙즈", startTime: "2025-10-19T14:00:00", endTime: "2025-10-19T16:00:00",
    contentType: "VOD", visibility: "PUBLIC", encodingStatus: "COMPLETED", ownerType: "B2G", venueId: 2, sportId: 1, sportName: "축구",
    vodUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8", panoramaUrl: null,
    thumbnailUrl: "https://placehold.co/320x180?text=VOD2", description: "2025 화랑대기 유소년축구 풀매치",
    price: 0, linkedLiveId: 2, createdAt: "2025-10-19T20:00:00",
  },
  {
    id: 3, organizationName: "서울시체육회", branchName: "마포지점", venueName: "화랑대기 3구장",
    matchName: "서울강남FC vs 부산서면유소년", startTime: "2025-10-18T14:00:00", endTime: "2025-10-18T16:00:00",
    contentType: "VOD", visibility: "PUBLIC", encodingStatus: "COMPLETED", ownerType: "B2G", venueId: 3, sportId: 1, sportName: "축구",
    vodUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8", panoramaUrl: null,
    thumbnailUrl: "https://placehold.co/320x180?text=VOD3", description: "2025 화랑대기 유소년축구 베스트 플레이",
    price: 0, linkedLiveId: 3, createdAt: "2025-10-18T20:00:00",
  },
  {
    id: 4, organizationName: "서울시체육회", branchName: "마포지점", venueName: "화랑대기 4구장",
    matchName: "대구FC유소년 vs 포항스틸러스Jr", startTime: "2025-10-18T12:00:00", endTime: "2025-10-18T14:00:00",
    contentType: "VOD", visibility: "PUBLIC", encodingStatus: "COMPLETED", ownerType: "B2G", venueId: 4, sportId: 1, sportName: "축구",
    vodUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8", panoramaUrl: null,
    thumbnailUrl: "https://placehold.co/320x180?text=VOD4", description: "2025 화랑대기 유소년축구 풀 하이라이트",
    price: 0, linkedLiveId: null, createdAt: "2025-10-18T18:00:00",
  },
  {
    id: 5, organizationName: null, branchName: null, venueName: "포착 스튜디오",
    matchName: "감독의 하루 - 화랑대기 편", startTime: "2025-10-17T00:00:00", endTime: "2025-10-17T00:30:00",
    contentType: "VOD", visibility: "PUBLIC", encodingStatus: "COMPLETED", ownerType: "B2C", venueId: 1, sportId: 1, sportName: "축구",
    vodUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8", panoramaUrl: null,
    thumbnailUrl: "https://placehold.co/320x180?text=VOD5", description: "포착 오리지널 다큐멘터리",
    price: 0, linkedLiveId: null, createdAt: "2025-10-17T09:00:00",
  },
  {
    id: 6, organizationName: null, branchName: null, venueName: "포착 스튜디오",
    matchName: "루키 다이어리 시즌2 EP.1", startTime: "2025-10-16T00:00:00", endTime: "2025-10-16T00:40:00",
    contentType: "VOD", visibility: "PUBLIC", encodingStatus: "COMPLETED", ownerType: "B2C", venueId: 1, sportId: 1, sportName: "축구",
    vodUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8", panoramaUrl: null,
    thumbnailUrl: "https://placehold.co/320x180?text=VOD6", description: "포착 오리지널 밀착 취재",
    price: 0, linkedLiveId: null, createdAt: "2025-10-16T09:00:00",
  },
];

const mockClipAssets: ClipAsset[] = [
  { id: 1, clipName: "U12 유망주 김포착 환상 드리블", sportName: "축구", matchName: "경기용인YSFC vs 대구강북주니어", clipType: "TEAM", viewCount: 152000, visibility: "PUBLIC", createdAt: "2025-10-19T12:00:00" },
  { id: 2, clipName: "경기용인 수비수 신들린 태클", sportName: "축구", matchName: "인천남동FC vs 수원삼성블루윙즈", clipType: "ASSOCIATION", viewCount: 98400, visibility: "PUBLIC", createdAt: "2025-10-19T15:00:00" },
  { id: 3, clipName: "대구강북 에이스 프리킥 골", sportName: "축구", matchName: "서울강남FC vs 부산서면유소년", clipType: "ORG_OPEN", viewCount: 87600, visibility: "PUBLIC", createdAt: "2025-10-19T20:00:00" },
  { id: 4, clipName: "결승골 세리머니 모음", sportName: "축구", matchName: "경기용인YSFC vs 대구강북주니어", clipType: "ORG_CLOSED_HQ", viewCount: 76300, visibility: "PUBLIC", createdAt: "2025-10-19T10:00:00" },
  { id: 5, clipName: "화랑대기 골키퍼 신들린 세이브", sportName: "축구", matchName: "인천남동FC vs 수원삼성블루윙즈", clipType: "PERSONAL", viewCount: 65100, visibility: "PUBLIC", createdAt: "2025-10-19T09:00:00" },
  { id: 6, clipName: "리틀야구 9회말 역전 홈런", sportName: "야구", matchName: "인천리틀스타 vs 수원이글스Jr", clipType: "ORG_CLOSED_BRANCH", viewCount: 54200, visibility: "PUBLIC", createdAt: "2025-10-20T14:00:00" },
  { id: 7, clipName: "테니스 매치포인트 에이스 모음", sportName: "테니스", matchName: "서울시협회장기 남자단식 결승", clipType: "AFFILIATED", viewCount: 43100, visibility: "PUBLIC", createdAt: "2025-10-22T11:00:00" },
  { id: 8, clipName: "화랑대기 베스트 프리킥 TOP5", sportName: "축구", matchName: "경기용인YSFC vs 대구강북주니어", clipType: "TEAM", viewCount: 38700, visibility: "PUBLIC", createdAt: "2025-10-20T16:00:00" },
];

const mockTagData: AssetTag[] = [
  {
    id: 1, matchName: "경기용인YSFC vs 대구강북주니어", contentType: "LIVE",
    tournamentName: "2025 화랑대기 유소년축구", homeTeam: "경기용인YSFC", awayTeam: "대구강북주니어", createdAt: "2025-10-20T12:00:00",
    tags: [
      { id: 1, label: "골", time: "23:15", team: "HOME" },
      { id: 2, label: "옐로카드", time: "35:42", team: "AWAY" },
      { id: 3, label: "골", time: "67:30", team: "AWAY" },
      { id: 4, label: "교체", time: "72:00", team: "HOME" },
    ],
  },
  {
    id: 2, matchName: "인천남동FC vs 수원삼성블루윙즈", contentType: "VOD",
    tournamentName: "2025 화랑대기 유소년축구", homeTeam: "인천남동FC", awayTeam: "수원삼성블루윙즈", createdAt: "2025-10-19T14:00:00",
    tags: [
      { id: 5, label: "골", time: "05:20", team: "HOME" },
      { id: 6, label: "골", time: "12:45", team: "AWAY" },
    ],
  },
  {
    id: 3, matchName: "서울강남FC vs 부산서면유소년", contentType: "LIVE",
    tournamentName: "2025 화랑대기 유소년축구", homeTeam: "서울강남FC", awayTeam: "부산서면유소년", createdAt: "2025-10-20T14:00:00",
    tags: [
      { id: 7, label: "골", time: "03:22", team: "HOME" },
      { id: 8, label: "프리킥", time: "15:10", team: "NONE" },
      { id: 9, label: "골", time: "45:30", team: "AWAY" },
    ],
  },
  {
    id: 4, matchName: "인천리틀스타 vs 수원이글스Jr", contentType: "LIVE",
    tournamentName: "제5회 전국 리틀야구", homeTeam: "인천리틀스타", awayTeam: "수원이글스Jr", createdAt: "2025-11-01T10:00:00",
    tags: [],
  },
  {
    id: 5, matchName: "서울시협회장기 남자단식 결승", contentType: "LIVE",
    tournamentName: "제30회 서울시 협회장기", homeTeam: "김재훈", awayTeam: "박성호", createdAt: "2025-11-05T14:00:00",
    tags: [
      { id: 10, label: "매치포인트", time: "22:00", team: "HOME" },
    ],
  },
];

let liveData = [...mockLiveAssets];
let vodData = [...mockVodAssets];
let clipData = [...mockClipAssets];
const tagData = [...mockTagData];
let nextLiveId = 7;
let nextVodId = 7;
