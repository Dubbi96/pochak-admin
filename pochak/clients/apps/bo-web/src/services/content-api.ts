/**
 * Content (Sport) Management API service
 * Calls real admin API via gateway.
 */

import type { PageResponse } from "@/types/common";
import type {
  Sport,
  SportFilter,
  SportCreateRequest,
  SportUpdateRequest,
  SportOrderUpdateRequest,
} from "@/types/sport";
import { gatewayApi } from "@/lib/api-client";

// ── Sport APIs ─────────────────────────────────────────────────────────────────

export async function getSports(
  filters: SportFilter,
  page = 0,
  size = 20
): Promise<PageResponse<Sport>> {
  const params: Record<string, string> = {
    page: String(page),
    size: String(size),
  };
  if (filters.isActive !== null && filters.isActive !== undefined) {
    params.isActive = String(filters.isActive);
  }
  if (filters.keyword) {
    params.keyword = filters.keyword;
  }

  return gatewayApi.get<PageResponse<Sport>>(
    "/api/v1/admin/sports",
    params
  );
}

export async function createSport(data: SportCreateRequest): Promise<Sport> {
  return gatewayApi.post<Sport>("/api/v1/admin/sports", data);
}

export async function updateSport(
  id: number,
  data: SportUpdateRequest
): Promise<Sport> {
  return gatewayApi.put<Sport>(`/api/v1/admin/sports/${id}`, data);
}

export async function updateSportOrder(
  data: SportOrderUpdateRequest
): Promise<void> {
  await gatewayApi.put("/api/v1/admin/sports/order", data);
}

export async function deleteSport(id: number): Promise<void> {
  await gatewayApi.delete(`/api/v1/admin/sports/${id}`);
}
