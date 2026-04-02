/**
 * Competition & Match Management API service
 * Calls real admin API via gateway.
 */

import type { PageResponse } from "@/types/common";
import type {
  Competition,
  CompetitionFilter,
  CompetitionCreateRequest,
  CompetitionUpdateRequest,
} from "@/types/competition";
import type {
  Match,
  MatchFilter,
  MatchCreateRequest,
  MatchUpdateRequest,
} from "@/types/match";
import { gatewayApi } from "@/lib/api-client";

// ── Competition APIs ───────────────────────────────────────────────────────────

export async function getCompetitions(
  filters: CompetitionFilter,
  page = 0,
  size = 20
): Promise<PageResponse<Competition>> {
  const params: Record<string, string> = {
    page: String(page),
    size: String(size),
  };
  if (filters.isActive !== null && filters.isActive !== undefined) {
    params.isActive = String(filters.isActive);
  }
  if (filters.status) params.status = filters.status;
  if (filters.sportCode) params.sportCode = filters.sportCode;
  if (filters.keyword) params.keyword = filters.keyword;
  if (filters.searchType) params.searchType = filters.searchType;

  return gatewayApi.get<PageResponse<Competition>>(
    "/api/v1/admin/competitions",
    params
  );
}

export async function createCompetition(
  data: CompetitionCreateRequest
): Promise<Competition> {
  return gatewayApi.post<Competition>("/api/v1/admin/competitions", data);
}

export async function updateCompetition(
  id: number,
  data: CompetitionUpdateRequest
): Promise<Competition> {
  return gatewayApi.put<Competition>(`/api/v1/admin/competitions/${id}`, data);
}

export async function deleteCompetition(id: number): Promise<void> {
  await gatewayApi.delete(`/api/v1/admin/competitions/${id}`);
}

// ── Match APIs ─────────────────────────────────────────────────────────────────

export async function getMatches(
  filters: MatchFilter,
  page = 0,
  size = 20
): Promise<PageResponse<Match>> {
  const params: Record<string, string> = {
    page: String(page),
    size: String(size),
  };
  if (filters.dateFrom) params.dateFrom = filters.dateFrom;
  if (filters.dateTo) params.dateTo = filters.dateTo;
  if (filters.sportCode) params.sportCode = filters.sportCode;
  if (filters.competitionId) params.competitionId = String(filters.competitionId);
  if (filters.status) params.status = filters.status;
  if (filters.isActive !== null && filters.isActive !== undefined) {
    params.isActive = String(filters.isActive);
  }
  if (filters.linkStatus) params.linkStatus = filters.linkStatus;
  if (filters.competitionKeyword) params.competitionKeyword = filters.competitionKeyword;
  if (filters.cardKeyword) params.cardKeyword = filters.cardKeyword;

  return gatewayApi.get<PageResponse<Match>>(
    "/api/v1/admin/matches",
    params
  );
}

export async function createMatch(data: MatchCreateRequest): Promise<Match> {
  return gatewayApi.post<Match>("/api/v1/admin/matches", data);
}

export async function updateMatch(
  id: number,
  data: MatchUpdateRequest
): Promise<Match> {
  return gatewayApi.put<Match>(`/api/v1/admin/matches/${id}`, data);
}

export async function deleteMatch(id: number): Promise<void> {
  await gatewayApi.delete(`/api/v1/admin/matches/${id}`);
}

// ── Helper exports for dropdowns ───────────────────────────────────────────────

export async function getCompetitionOptions(): Promise<
  { id: number; name: string; sportCode: string }[]
> {
  return gatewayApi.get<{ id: number; name: string; sportCode: string }[]>(
    "/api/v1/admin/competitions/options"
  );
}
