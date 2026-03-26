/**
 * Content (Sport) Management API service
 * Calls real admin API via gateway, with mock fallback.
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

// ── Helper ─────────────────────────────────────────────────────────────────────

function delay(ms = 300): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ── Sport APIs ─────────────────────────────────────────────────────────────────

export async function getSports(
  filters: SportFilter,
  page = 0,
  size = 20
): Promise<PageResponse<Sport>> {
  // Try real API first
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

  const apiResult = await gatewayApi.get<PageResponse<Sport>>(
    "/api/v1/admin/sports",
    params
  );
  if (apiResult) return apiResult;

  // Mock fallback
  console.warn("[content-api] Backend unavailable, using mock data");
  await delay();

  let filtered = [...MOCK_SPORTS];

  if (filters.isActive !== null && filters.isActive !== undefined) {
    filtered = filtered.filter((s) => s.isActive === filters.isActive);
  }
  if (filters.keyword) {
    const kw = filters.keyword.toLowerCase();
    filtered = filtered.filter((s) => s.name.toLowerCase().includes(kw));
  }

  filtered.sort((a, b) => a.displayOrder - b.displayOrder);

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

export async function createSport(data: SportCreateRequest): Promise<Sport> {
  // Try real API first
  const apiResult = await gatewayApi.post<Sport>("/api/v1/admin/sports", data);
  if (apiResult) return apiResult;

  // Mock fallback
  console.warn("[content-api] Backend unavailable, using mock data");
  await delay();

  const sport: Sport = {
    id: nextSportId++,
    sportCode: data.sportCode,
    name: data.name,
    imageUrl: data.imageUrl || null,
    displayOrder: MOCK_SPORTS.length + 1,
    isActive: data.isActive,
    tags: data.tags.map((t, i) => ({ id: Date.now() + i, name: t })),
    createdBy: "관리자",
    createdAt: new Date().toISOString(),
  };

  MOCK_SPORTS.push(sport);
  return sport;
}

export async function updateSport(
  id: number,
  data: SportUpdateRequest
): Promise<Sport> {
  // Try real API first
  const apiResult = await gatewayApi.put<Sport>(`/api/v1/admin/sports/${id}`, data);
  if (apiResult) return apiResult;

  // Mock fallback
  console.warn("[content-api] Backend unavailable, using mock data");
  await delay();

  const idx = sportsData.findIndex((s) => s.id === id);
  if (idx === -1) throw new Error("Sport not found");

  sportsData[idx] = {
    ...sportsData[idx],
    name: data.name,
    sportCode: data.sportCode,
    imageUrl: data.imageUrl || null,
    isActive: data.isActive,
    tags: data.tags.map((t, i) => ({ id: Date.now() + i, name: t })),
  };

  return sportsData[idx];
}

export async function updateSportOrder(
  data: SportOrderUpdateRequest
): Promise<void> {
  // Try real API first
  const apiResult = await gatewayApi.put("/api/v1/admin/sports/order", data);
  if (apiResult !== null) return;

  // Mock fallback
  console.warn("[content-api] Backend unavailable, using mock data");
  await delay();

  for (const item of data.items) {
    const idx = sportsData.findIndex((s) => s.id === item.id);
    if (idx !== -1) {
      sportsData[idx] = { ...sportsData[idx], displayOrder: item.displayOrder };
    }
  }
}

export async function deleteSport(id: number): Promise<void> {
  // Try real API first
  const apiResult = await gatewayApi.delete(`/api/v1/admin/sports/${id}`);
  if (apiResult !== null) return;

  // Mock fallback
  console.warn("[content-api] Backend unavailable, using mock data");
  await delay();
  sportsData = sportsData.filter((s) => s.id !== id);
}

// ── Mock Data ──────────────────────────────────────────────────────────────────

const MOCK_SPORTS: Sport[] = [
  {
    id: 1,
    sportCode: "SOCCER",
    name: "축구",
    imageUrl: "https://placehold.co/80x80?text=Soccer",
    displayOrder: 1,
    isActive: true,
    tags: [
      { id: 1, name: "실내" },
      { id: 2, name: "실외" },
    ],
    createdBy: "관리자",
    createdAt: "2025-01-15T09:00:00",
  },
  {
    id: 2,
    sportCode: "BASKETBALL",
    name: "농구",
    imageUrl: "https://placehold.co/80x80?text=Basketball",
    displayOrder: 2,
    isActive: true,
    tags: [{ id: 3, name: "실내" }],
    createdBy: "관리자",
    createdAt: "2025-01-16T10:00:00",
  },
  {
    id: 3,
    sportCode: "BASEBALL",
    name: "야구",
    imageUrl: "https://placehold.co/80x80?text=Baseball",
    displayOrder: 3,
    isActive: true,
    tags: [
      { id: 4, name: "실외" },
      { id: 5, name: "프로" },
      { id: 6, name: "아마추어" },
    ],
    createdBy: "관리자",
    createdAt: "2025-02-01T11:00:00",
  },
  {
    id: 4,
    sportCode: "VOLLEYBALL",
    name: "배구",
    imageUrl: null,
    displayOrder: 4,
    isActive: false,
    tags: [{ id: 7, name: "실내" }],
    createdBy: "운영자",
    createdAt: "2025-02-10T14:00:00",
  },
  {
    id: 5,
    sportCode: "BADMINTON",
    name: "배드민턴",
    imageUrl: "https://placehold.co/80x80?text=Badminton",
    displayOrder: 5,
    isActive: true,
    tags: [],
    createdBy: "관리자",
    createdAt: "2025-03-05T08:30:00",
  },
];

let sportsData = [...MOCK_SPORTS];
let nextSportId = 6;
