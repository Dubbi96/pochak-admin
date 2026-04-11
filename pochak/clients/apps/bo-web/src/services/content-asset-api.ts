/**
 * Content Asset Management API service (Live, VOD, Clip, Tag)
 * Calls real admin API via gateway.
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

// ── Live Asset APIs ────────────────────────────────────────────────────────────

export async function getLiveAssets(
  filters: ContentFilter,
  page = 0,
  size = 20
): Promise<PageResponse<LiveAsset>> {
  const params: Record<string, string> = {
    page: String(page),
    size: String(size),
  };
  if (filters.ownerType) params.ownerType = filters.ownerType;
  if (filters.venueId) params.venueId = String(filters.venueId);
  if (filters.visibility) params.visibility = filters.visibility;
  if (filters.dateFrom) params.dateFrom = filters.dateFrom;
  if (filters.dateTo) params.dateTo = filters.dateTo;

  return gatewayApi.get<PageResponse<LiveAsset>>(
    "/api/v1/admin/live-assets",
    params
  );
}

export async function createLiveAsset(
  data: LiveCreateRequest
): Promise<LiveAsset> {
  return gatewayApi.post<LiveAsset>("/api/v1/admin/live-assets", data);
}

export async function updateLiveVisibility(
  ids: number[],
  visibility: AssetVisibility
): Promise<void> {
  await gatewayApi.put("/api/v1/admin/live-assets/visibility", { ids, visibility });
}

// ── VOD Asset APIs ─────────────────────────────────────────────────────────────

export async function getVodAssets(
  filters: ContentFilter,
  page = 0,
  size = 20
): Promise<PageResponse<VodAsset>> {
  const params: Record<string, string> = {
    page: String(page),
    size: String(size),
  };
  if (filters.ownerType) params.ownerType = filters.ownerType;
  if (filters.venueId) params.venueId = String(filters.venueId);
  if (filters.visibility) params.visibility = filters.visibility;
  if (filters.dateFrom) params.dateFrom = filters.dateFrom;
  if (filters.dateTo) params.dateTo = filters.dateTo;

  return gatewayApi.get<PageResponse<VodAsset>>(
    "/api/v1/admin/videos",
    params
  );
}

export async function createVodAsset(
  data: VodCreateRequest
): Promise<VodAsset> {
  return gatewayApi.post<VodAsset>("/api/v1/admin/videos", data);
}

export async function updateVodVisibility(
  ids: number[],
  visibility: AssetVisibility
): Promise<void> {
  await gatewayApi.put("/api/v1/admin/videos/visibility", { ids, visibility });
}

// ── Clip Asset APIs ────────────────────────────────────────────────────────────

export async function getClipAssets(
  filters: ClipFilter,
  page = 0,
  size = 20
): Promise<PageResponse<ClipAsset>> {
  const params: Record<string, string> = {
    page: String(page),
    size: String(size),
  };
  if (filters.matchName) params.matchName = filters.matchName;
  if (filters.clipType) params.clipType = filters.clipType;
  if (filters.clipName) params.clipName = filters.clipName;
  if (filters.dateFrom) params.dateFrom = filters.dateFrom;
  if (filters.dateTo) params.dateTo = filters.dateTo;

  return gatewayApi.get<PageResponse<ClipAsset>>(
    "/api/v1/admin/clips",
    params
  );
}

export async function updateClipVisibility(
  ids: number[],
  visibility: AssetVisibility
): Promise<void> {
  await gatewayApi.put("/api/v1/admin/clips/visibility", { ids, visibility });
}

// ── Tag APIs ───────────────────────────────────────────────────────────────────

export async function getAssetTags(
  filters: TagFilter,
  page = 0,
  size = 20
): Promise<PageResponse<AssetTag>> {
  const params: Record<string, string> = {
    page: String(page),
    size: String(size),
  };
  if (filters.contentType) params.contentType = filters.contentType;
  if (filters.matchName) params.matchName = filters.matchName;
  if (filters.dateFrom) params.dateFrom = filters.dateFrom;
  if (filters.dateTo) params.dateTo = filters.dateTo;

  return gatewayApi.get<PageResponse<AssetTag>>(
    "/api/v1/admin/tags",
    params
  );
}

export async function getTagsByMatch(matchId: number): Promise<TagItem[]> {
  return gatewayApi.get<TagItem[]>(
    `/api/v1/admin/tags/match/${matchId}`
  );
}

// ── Dropdown Data ──────────────────────────────────────────────────────────────

export async function getVenueOptions(): Promise<
  { id: number; name: string }[]
> {
  return gatewayApi.get<{ id: number; name: string }[]>(
    "/api/v1/venues/options"
  );
}

export async function getOrganizationOptions(): Promise<
  { id: number; name: string }[]
> {
  return gatewayApi.get<{ id: number; name: string }[]>(
    "/api/v1/admin/organizations/options"
  );
}

export async function getBranchOptions(
  orgId: number
): Promise<{ id: number; name: string }[]> {
  return gatewayApi.get<{ id: number; name: string }[]>(
    `/api/v1/admin/organizations/${orgId}/branches`
  );
}

export async function getSportOptions(): Promise<
  { id: number; name: string }[]
> {
  return gatewayApi.get<{ id: number; name: string }[]>(
    "/api/v1/admin/sports/options"
  );
}

export async function getTournamentOptions(): Promise<
  { id: number; name: string }[]
> {
  return gatewayApi.get<{ id: number; name: string }[]>(
    "/api/v1/admin/competitions/options"
  );
}
