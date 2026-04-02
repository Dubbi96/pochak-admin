/**
 * Competition & Match Management API service
 * Calls real admin API via gateway, with mock fallback.
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

// ── Helper ─────────────────────────────────────────────────────────────────────

function delay(ms = 300): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ── Competition APIs ───────────────────────────────────────────────────────────

export async function getCompetitions(
  filters: CompetitionFilter,
  page = 0,
  size = 20
): Promise<PageResponse<Competition>> {
  // Try real API first
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

  const apiResult = await gatewayApi.get<PageResponse<Competition>>(
    "/api/v1/admin/competitions",
    params
  );
  if (apiResult) return apiResult;

  // Mock fallback
  console.warn("[competition-api] Backend unavailable, using mock data");
  await delay();

  let filtered = [...competitionsData];

  if (filters.isActive !== null && filters.isActive !== undefined) {
    filtered = filtered.filter((c) => c.isActive === filters.isActive);
  }
  if (filters.status) {
    filtered = filtered.filter((c) => c.status === filters.status);
  }
  if (filters.sportCode) {
    filtered = filtered.filter((c) => c.sportCode === filters.sportCode);
  }
  if (filters.keyword) {
    const kw = filters.keyword.toLowerCase();
    if (filters.searchType === "TOURNAMENT") {
      filtered = filtered.filter(
        (c) => c.type === "TOURNAMENT" && c.name.toLowerCase().includes(kw)
      );
    } else if (filters.searchType === "LEAGUE") {
      filtered = filtered.filter(
        (c) => c.type === "LEAGUE" && c.name.toLowerCase().includes(kw)
      );
    } else {
      filtered = filtered.filter((c) => c.name.toLowerCase().includes(kw));
    }
  }

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

export async function createCompetition(
  data: CompetitionCreateRequest
): Promise<Competition> {
  // Try real API first
  const apiResult = await gatewayApi.post<Competition>("/api/v1/admin/competitions", data);
  if (apiResult) return apiResult;

  // Mock fallback
  console.warn("[competition-api] Backend unavailable, using mock data");
  await delay();

  const sportNames: Record<string, string> = {
    SOCCER: "축구",
    BASEBALL: "야구",
    VOLLEYBALL: "배구",
    BASKETBALL: "농구",
    BADMINTON: "배드민턴",
  };

  const competition: Competition = {
    id: nextCompetitionId++,
    name: data.name,
    shortName: data.shortName || "",
    type: data.type,
    sportCode: data.sportCode,
    sportName: sportNames[data.sportCode] || data.sportCode,
    status: "UPCOMING",
    startDate: data.startDate,
    endDate: data.endDate,
    description: data.description || "",
    price: data.price,
    isFree: data.isFree,
    isActive: data.isActive,
    websiteUrl: data.websiteUrl || "",
    eligibility: data.eligibility || "",
    rules: data.rules || "",
    visibility: data.visibility || "PUBLIC",
    inviteUrl: data.visibility === "PRIVATE" ? `https://pochak.tv/invite/comp-${nextCompetitionId - 1}-${Math.random().toString(36).slice(2, 8)}` : undefined,
    videoCount: 0,
    clipCount: 0,
    createdBy: "관리자",
    createdAt: new Date().toISOString(),
  };

  competitionsData.push(competition);
  return competition;
}

export async function updateCompetition(
  id: number,
  data: CompetitionUpdateRequest
): Promise<Competition> {
  // Try real API first
  const apiResult = await gatewayApi.put<Competition>(`/api/v1/admin/competitions/${id}`, data);
  if (apiResult) return apiResult;

  // Mock fallback
  console.warn("[competition-api] Backend unavailable, using mock data");
  await delay();

  const idx = competitionsData.findIndex((c) => c.id === id);
  if (idx === -1) throw new Error("Competition not found");

  const sportNames: Record<string, string> = {
    SOCCER: "축구",
    BASEBALL: "야구",
    VOLLEYBALL: "배구",
    BASKETBALL: "농구",
    BADMINTON: "배드민턴",
  };

  competitionsData[idx] = {
    ...competitionsData[idx],
    name: data.name,
    shortName: data.shortName || "",
    type: data.type,
    sportCode: data.sportCode,
    sportName: sportNames[data.sportCode] || data.sportCode,
    startDate: data.startDate,
    endDate: data.endDate,
    description: data.description || "",
    price: data.price,
    isFree: data.isFree,
    isActive: data.isActive,
    websiteUrl: data.websiteUrl || "",
    eligibility: data.eligibility || "",
    rules: data.rules || "",
  };

  return competitionsData[idx];
}

export async function deleteCompetition(id: number): Promise<void> {
  // Try real API first
  const apiResult = await gatewayApi.delete(`/api/v1/admin/competitions/${id}`);
  if (apiResult !== null) return;

  // Mock fallback
  console.warn("[competition-api] Backend unavailable, using mock data");
  await delay();
  competitionsData = competitionsData.filter((c) => c.id !== id);
}

// ── Match APIs ─────────────────────────────────────────────────────────────────

export async function getMatches(
  filters: MatchFilter,
  page = 0,
  size = 20
): Promise<PageResponse<Match>> {
  // Try real API first
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

  const apiResult = await gatewayApi.get<PageResponse<Match>>(
    "/api/v1/admin/matches",
    params
  );
  if (apiResult) return apiResult;

  // Mock fallback
  console.warn("[competition-api] Backend unavailable, using mock data");
  await delay();

  let filtered = [...matchesData];

  if (filters.dateFrom) {
    filtered = filtered.filter((m) => m.startTime >= filters.dateFrom!);
  }
  if (filters.dateTo) {
    filtered = filtered.filter((m) => m.startTime <= filters.dateTo!);
  }
  if (filters.sportCode) {
    filtered = filtered.filter((m) => m.sportCode === filters.sportCode);
  }
  if (filters.competitionId) {
    filtered = filtered.filter((m) => m.competitionId === filters.competitionId);
  }
  if (filters.status) {
    filtered = filtered.filter((m) => m.status === filters.status);
  }
  if (filters.isActive !== null && filters.isActive !== undefined) {
    filtered = filtered.filter((m) => m.isActive === filters.isActive);
  }
  if (filters.linkStatus) {
    filtered = filtered.filter((m) => m.linkStatus === filters.linkStatus);
  }
  if (filters.competitionKeyword) {
    const kw = filters.competitionKeyword.toLowerCase();
    filtered = filtered.filter((m) =>
      m.competitionName.toLowerCase().includes(kw)
    );
  }
  if (filters.cardKeyword) {
    const kw = filters.cardKeyword.toLowerCase();
    filtered = filtered.filter((m) => m.name.toLowerCase().includes(kw));
  }

  filtered.sort(
    (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
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

export async function createMatch(data: MatchCreateRequest): Promise<Match> {
  // Try real API first
  const apiResult = await gatewayApi.post<Match>("/api/v1/admin/matches", data);
  if (apiResult) return apiResult;

  // Mock fallback
  console.warn("[competition-api] Backend unavailable, using mock data");
  await delay();

  const competition = competitionsData.find(
    (c) => c.id === data.competitionId
  );

  const match: Match = {
    id: nextMatchId++,
    competitionId: data.competitionId,
    competitionName: competition?.name || "",
    sportCode: data.sportCode,
    sportName: competition?.sportName || "",
    name: data.name,
    venueName: data.venueName,
    startTime: data.startTime,
    endTime: data.endTime,
    status: "SCHEDULED",
    isActive: data.isActive,
    linkStatus: "UNLINKED",
    homeTeam: { teamId: data.homeTeamId, teamName: `팀 ${data.homeTeamId}`, score: null },
    awayTeam: { teamId: data.awayTeamId, teamName: `팀 ${data.awayTeamId}`, score: null },
    hasPanorama: data.hasPanorama,
    hasScoreboard: data.hasScoreboard,
    createdBy: "관리자",
    createdAt: new Date().toISOString(),
  };

  matchesData.push(match);
  return match;
}

export async function updateMatch(
  id: number,
  data: MatchUpdateRequest
): Promise<Match> {
  // Try real API first
  const apiResult = await gatewayApi.put<Match>(`/api/v1/admin/matches/${id}`, data);
  if (apiResult) return apiResult;

  // Mock fallback
  console.warn("[competition-api] Backend unavailable, using mock data");
  await delay();

  const idx = matchesData.findIndex((m) => m.id === id);
  if (idx === -1) throw new Error("Match not found");

  const competition = competitionsData.find(
    (c) => c.id === data.competitionId
  );

  matchesData[idx] = {
    ...matchesData[idx],
    competitionId: data.competitionId,
    competitionName: competition?.name || matchesData[idx].competitionName,
    sportCode: data.sportCode,
    name: data.name,
    venueName: data.venueName,
    startTime: data.startTime,
    endTime: data.endTime,
    isActive: data.isActive,
    homeTeam: { teamId: data.homeTeamId, teamName: matchesData[idx].homeTeam.teamName, score: matchesData[idx].homeTeam.score },
    awayTeam: { teamId: data.awayTeamId, teamName: matchesData[idx].awayTeam.teamName, score: matchesData[idx].awayTeam.score },
    hasPanorama: data.hasPanorama,
    hasScoreboard: data.hasScoreboard,
  };

  return matchesData[idx];
}

export async function deleteMatch(id: number): Promise<void> {
  // Try real API first
  const apiResult = await gatewayApi.delete(`/api/v1/admin/matches/${id}`);
  if (apiResult !== null) return;

  // Mock fallback
  console.warn("[competition-api] Backend unavailable, using mock data");
  await delay();
  matchesData = matchesData.filter((m) => m.id !== id);
}

// ── Helper exports for dropdowns ───────────────────────────────────────────────

export async function getCompetitionOptions(): Promise<
  { id: number; name: string; sportCode: string }[]
> {
  // Try real API first
  const apiResult = await gatewayApi.get<{ id: number; name: string; sportCode: string }[]>(
    "/api/v1/admin/competitions/options"
  );
  if (apiResult) return apiResult;

  // Mock fallback
  console.warn("[competition-api] Backend unavailable, using mock data");
  await delay(100);
  return competitionsData
    .filter((c) => c.isActive)
    .map((c) => ({ id: c.id, name: c.name, sportCode: c.sportCode }));
}

// ── Mock Data (values aligned with DB seed V101 / shared/mockData.ts) ─────────

const mockCompetitions: Competition[] = [
  {
    id: 1, name: "2025 화랑대기", shortName: "유소년축구", type: "TOURNAMENT",
    sportCode: "SOCCER", sportName: "축구", status: "IN_PROGRESS", visibility: "PUBLIC",
    startDate: "2025-10-20", endDate: "2025-10-30",
    description: "2025 화랑대기 유소년축구", price: 19900, isFree: false, isActive: true,
    websiteUrl: "", eligibility: "유소년 축구팀", rules: "KFA 유소년 규정",
    videoCount: 24, clipCount: 120, createdBy: "관리자", createdAt: "2025-10-10T09:00:00",
  },
  {
    id: 2, name: "제5회 전국 리틀야구", shortName: "리틀야구", type: "TOURNAMENT",
    sportCode: "BASEBALL", sportName: "야구", status: "UPCOMING", visibility: "PUBLIC",
    startDate: "2025-11-01", endDate: "2025-11-10",
    description: "제5회 전국 리틀야구 리틀야구", price: 14900, isFree: false, isActive: true,
    websiteUrl: "", eligibility: "전국 리틀야구팀", rules: "KBA 리틀야구 규정",
    videoCount: 0, clipCount: 0, createdBy: "관리자", createdAt: "2025-10-15T10:00:00",
  },
  {
    id: 3, name: "나이키 에어맥스 프리데이", shortName: "풋살대회", type: "TOURNAMENT",
    sportCode: "SOCCER", sportName: "풋살", status: "UPCOMING", visibility: "PRIVATE", inviteUrl: "https://pochak.tv/invite/comp-3-a1b2c3",
    startDate: "2025-10-25", endDate: "2025-10-27",
    description: "나이키 에어맥스 프리데이 풋살대회", price: 12900, isFree: false, isActive: true,
    websiteUrl: "", eligibility: "성인 풋살팀", rules: "FIFA 풋살 규정 준용",
    videoCount: 0, clipCount: 0, createdBy: "관리자", createdAt: "2025-10-01T09:00:00",
  },
  {
    id: 4, name: "제30회 서울시 협회장기", shortName: "테니스 대회", type: "TOURNAMENT",
    sportCode: "TENNIS", sportName: "테니스", status: "UPCOMING", visibility: "PUBLIC",
    startDate: "2025-11-05", endDate: "2025-11-15",
    description: "제30회 서울시 협회장기 테니스 대회", price: 9900, isFree: false, isActive: true,
    websiteUrl: "", eligibility: "서울시 테니스 동호인", rules: "KTA 규정 준용",
    videoCount: 0, clipCount: 0, createdBy: "관리자", createdAt: "2025-10-20T11:00:00",
  },
  {
    id: 5, name: "2025 전국체전", shortName: "종합체육대회", type: "TOURNAMENT",
    sportCode: "ALL", sportName: "전체", status: "FINISHED", visibility: "PUBLIC",
    startDate: "2025-10-15", endDate: "2025-10-22",
    description: "2025 전국체전 종합체육대회", price: 0, isFree: true, isActive: false,
    websiteUrl: "", eligibility: "전국 시도 대표", rules: "KSA 규정",
    videoCount: 48, clipCount: 256, createdBy: "운영자", createdAt: "2025-09-01T14:00:00",
  },
];

const mockMatches: Match[] = [
  {
    id: 1, competitionId: 1, competitionName: "2025 화랑대기",
    sportCode: "SOCCER", sportName: "축구", name: "조별리그 1경기",
    venueName: "화랑대기 경기장",
    startTime: "2025-10-20T12:00:00", endTime: "2025-10-20T13:30:00",
    status: "LIVE", isActive: true, linkStatus: "LINKED",
    homeTeam: { teamId: 3, teamName: "경기용인YSFC", score: 2 },
    awayTeam: { teamId: 4, teamName: "대구강북주니어", score: 1 },
    hasPanorama: true, hasScoreboard: true, createdBy: "관리자", createdAt: "2025-10-15T09:00:00",
  },
  {
    id: 2, competitionId: 1, competitionName: "2025 화랑대기",
    sportCode: "SOCCER", sportName: "축구", name: "조별리그 2경기",
    venueName: "화랑대기 경기장",
    startTime: "2025-10-20T12:00:00", endTime: "2025-10-20T13:30:00",
    status: "LIVE", isActive: true, linkStatus: "LINKED",
    homeTeam: { teamId: 5, teamName: "인천남동FC", score: 2 },
    awayTeam: { teamId: 8, teamName: "수원삼성블루윙즈", score: 2 },
    hasPanorama: true, hasScoreboard: true, createdBy: "관리자", createdAt: "2025-10-15T10:00:00",
  },
  {
    id: 3, competitionId: 1, competitionName: "2025 화랑대기",
    sportCode: "SOCCER", sportName: "축구", name: "조별리그 3경기",
    venueName: "화랑대기 경기장",
    startTime: "2025-10-20T14:00:00", endTime: "2025-10-20T15:30:00",
    status: "LIVE", isActive: true, linkStatus: "LINKED",
    homeTeam: { teamId: 6, teamName: "서울강남FC", score: null },
    awayTeam: { teamId: 7, teamName: "부산서면유소년", score: null },
    hasPanorama: true, hasScoreboard: true, createdBy: "관리자", createdAt: "2025-10-15T11:00:00",
  },
  {
    id: 4, competitionId: 2, competitionName: "제5회 전국 리틀야구",
    sportCode: "BASEBALL", sportName: "야구", name: "1회전",
    venueName: "리틀야구장",
    startTime: "2025-11-01T10:00:00", endTime: "2025-11-01T12:00:00",
    status: "SCHEDULED", isActive: true, linkStatus: "UNLINKED",
    homeTeam: { teamId: 9, teamName: "인천리틀스타", score: null },
    awayTeam: { teamId: 10, teamName: "수원이글스Jr", score: null },
    hasPanorama: false, hasScoreboard: true, createdBy: "관리자", createdAt: "2025-10-20T14:00:00",
  },
  {
    id: 5, competitionId: 4, competitionName: "제30회 서울시 협회장기",
    sportCode: "TENNIS", sportName: "테니스", name: "남자단식 결승",
    venueName: "서울 테니스장",
    startTime: "2025-11-05T14:00:00", endTime: "2025-11-05T16:00:00",
    status: "SCHEDULED", isActive: true, linkStatus: "UNLINKED",
    homeTeam: { teamId: 0, teamName: "김재훈", score: null },
    awayTeam: { teamId: 0, teamName: "박성호", score: null },
    hasPanorama: false, hasScoreboard: false, createdBy: "관리자", createdAt: "2025-10-28T09:00:00",
  },
  {
    id: 6, competitionId: 3, competitionName: "나이키 에어맥스 프리데이",
    sportCode: "SOCCER", sportName: "풋살", name: "결승전",
    venueName: "풋살파크",
    startTime: "2025-10-27T16:00:00", endTime: "2025-10-27T18:00:00",
    status: "SCHEDULED", isActive: true, linkStatus: "UNLINKED",
    homeTeam: { teamId: 11, teamName: "서울시청FC", score: null },
    awayTeam: { teamId: 12, teamName: "강남유나이티드", score: null },
    hasPanorama: false, hasScoreboard: true, createdBy: "관리자", createdAt: "2025-10-20T09:00:00",
  },
];

let competitionsData = [...mockCompetitions];
let matchesData = [...mockMatches];
let nextCompetitionId = 6;
let nextMatchId = 8;
