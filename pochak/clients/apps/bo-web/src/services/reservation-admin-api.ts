/**
 * Reservation Admin API service (Schedule Calendar, Booking)
 * Calls real admin API via gateway, with mock fallback.
 */

import type { PageResponse } from "@/types/common";
import { gatewayApi } from "@/lib/api-client";

// ── Types ──────────────────────────────────────────────────────────

export type ScheduleStatus = "SCHEDULED" | "IN_PROGRESS" | "CANCELLED" | "FINISHED";
export type BusinessType = "B2B" | "B2G" | "B2C";
export type BookingType = "REGULAR" | "ONE_TIME";

export interface ScheduleEvent {
  id: number;
  sportCode: string;
  sportName: string;
  competitionId: number;
  competitionName: string;
  businessType: BusinessType;
  district: string;
  venueId: number;
  venueName: string;
  startTime: string;
  endTime: string;
  status: ScheduleStatus;
  ballCost: number;
  description: string;
  bookingType: BookingType;
  studioLinked: boolean;
  createdBy: string;
  createdAt: string;
}

export interface ScheduleFilter {
  sportCode?: string | null;
  competitionId?: number | null;
  businessType?: BusinessType | null;
  district?: string | null;
  venueId?: number | null;
  status?: ScheduleStatus | null;
  competitionKeyword?: string;
  month?: number;
  year?: number;
}

export interface ScheduleCreateRequest {
  venueId: number;
  startTime: string;
  endTime: string;
  ballCost: number;
  description: string;
  bookingType: BookingType;
}

export interface BookingVenue {
  id: number;
  venueName: string;
  ballCost: number;
  equipmentType: string;
  registeredBy: string;
  registeredAt: string;
}

export interface BookingFilter {
  district?: string;
  venueId?: number | null;
  equipmentType?: string;
  searchKeyword?: string;
}

export interface BookingCreateRequest {
  venueId: number;
  ballCost: number;
  equipmentType: string;
  description: string;
}

// ── Label Maps ─────────────────────────────────────────────────────

export const SCHEDULE_STATUS_LABELS: Record<ScheduleStatus, string> = {
  SCHEDULED: "예정",
  IN_PROGRESS: "진행중",
  CANCELLED: "경기취소",
  FINISHED: "종료",
};

export const BUSINESS_TYPE_LABELS: Record<BusinessType, string> = {
  B2B: "B2B",
  B2G: "B2G",
  B2C: "B2C",
};

export const BOOKING_TYPE_LABELS: Record<BookingType, string> = {
  REGULAR: "정기",
  ONE_TIME: "일회",
};

// ── Mock Data ──────────────────────────────────────────────────────

let MOCK_EVENTS: ScheduleEvent[] = [
  {
    id: 1,
    sportCode: "SOCCER",
    sportName: "축구",
    competitionId: 1,
    competitionName: "2026 봄 풋살 챔피언십",
    businessType: "B2C",
    district: "서울 강남구",
    venueId: 1,
    venueName: "강남 풋살파크",
    startTime: "2026-03-20T14:00:00",
    endTime: "2026-03-20T16:00:00",
    status: "SCHEDULED",
    ballCost: 500,
    description: "A조 1경기",
    bookingType: "ONE_TIME",
    studioLinked: true,
    createdBy: "관리자",
    createdAt: "2026-03-01",
  },
  {
    id: 2,
    sportCode: "SOCCER",
    sportName: "축구",
    competitionId: 1,
    competitionName: "2026 봄 풋살 챔피언십",
    businessType: "B2C",
    district: "서울 강남구",
    venueId: 1,
    venueName: "강남 풋살파크",
    startTime: "2026-03-22T10:00:00",
    endTime: "2026-03-22T12:00:00",
    status: "SCHEDULED",
    ballCost: 500,
    description: "A조 2경기",
    bookingType: "ONE_TIME",
    studioLinked: false,
    createdBy: "관리자",
    createdAt: "2026-03-01",
  },
  {
    id: 3,
    sportCode: "BASEBALL",
    sportName: "야구",
    competitionId: 2,
    competitionName: "인천 야구 리그",
    businessType: "B2B",
    district: "인천 남동구",
    venueId: 2,
    venueName: "인천 야구장",
    startTime: "2026-03-19T18:00:00",
    endTime: "2026-03-19T21:00:00",
    status: "IN_PROGRESS",
    ballCost: 800,
    description: "개막전",
    bookingType: "REGULAR",
    studioLinked: true,
    createdBy: "운영자",
    createdAt: "2026-02-20",
  },
  {
    id: 4,
    sportCode: "VOLLEYBALL",
    sportName: "배구",
    competitionId: 3,
    competitionName: "서울 배구 리그",
    businessType: "B2G",
    district: "서울 송파구",
    venueId: 3,
    venueName: "잠실 체육관",
    startTime: "2026-03-25T14:00:00",
    endTime: "2026-03-25T16:00:00",
    status: "SCHEDULED",
    ballCost: 600,
    description: "1라운드",
    bookingType: "REGULAR",
    studioLinked: true,
    createdBy: "관리자",
    createdAt: "2026-03-05",
  },
  {
    id: 5,
    sportCode: "SOCCER",
    sportName: "축구",
    competitionId: 4,
    competitionName: "수원 축구 챔피언십",
    businessType: "B2C",
    district: "수원 영통구",
    venueId: 4,
    venueName: "수원 월드컵경기장",
    startTime: "2026-03-15T19:00:00",
    endTime: "2026-03-15T21:00:00",
    status: "FINISHED",
    ballCost: 1000,
    description: "준결승",
    bookingType: "ONE_TIME",
    studioLinked: true,
    createdBy: "관리자",
    createdAt: "2026-02-28",
  },
  {
    id: 6,
    sportCode: "BASKETBALL",
    sportName: "농구",
    competitionId: 5,
    competitionName: "3on3 챌린지",
    businessType: "B2C",
    district: "서울 마포구",
    venueId: 5,
    venueName: "마포 체육관",
    startTime: "2026-03-28T10:00:00",
    endTime: "2026-03-28T12:00:00",
    status: "SCHEDULED",
    ballCost: 300,
    description: "예선 1경기",
    bookingType: "ONE_TIME",
    studioLinked: false,
    createdBy: "운영자",
    createdAt: "2026-03-10",
  },
  {
    id: 7,
    sportCode: "SOCCER",
    sportName: "축구",
    competitionId: 1,
    competitionName: "2026 봄 풋살 챔피언십",
    businessType: "B2C",
    district: "서울 강남구",
    venueId: 1,
    venueName: "강남 풋살파크",
    startTime: "2026-03-10T14:00:00",
    endTime: "2026-03-10T16:00:00",
    status: "CANCELLED",
    ballCost: 500,
    description: "우천 취소",
    bookingType: "ONE_TIME",
    studioLinked: false,
    createdBy: "관리자",
    createdAt: "2026-02-25",
  },
  {
    id: 8,
    sportCode: "SOCCER",
    sportName: "축구",
    competitionId: 4,
    competitionName: "수원 축구 챔피언십",
    businessType: "B2B",
    district: "수원 영통구",
    venueId: 4,
    venueName: "수원 월드컵경기장",
    startTime: "2026-04-05T15:00:00",
    endTime: "2026-04-05T17:00:00",
    status: "SCHEDULED",
    ballCost: 1000,
    description: "결승전",
    bookingType: "ONE_TIME",
    studioLinked: true,
    createdBy: "관리자",
    createdAt: "2026-03-15",
  },
];

let MOCK_BOOKING_VENUES: BookingVenue[] = [
  { id: 1, venueName: "강남 풋살파크", ballCost: 500, equipmentType: "고정카메라", registeredBy: "관리자", registeredAt: "2025-12-01" },
  { id: 2, venueName: "인천 야구장", ballCost: 800, equipmentType: "이동카메라", registeredBy: "운영자", registeredAt: "2025-12-15" },
  { id: 3, venueName: "잠실 체육관", ballCost: 600, equipmentType: "고정카메라", registeredBy: "관리자", registeredAt: "2026-01-10" },
  { id: 4, venueName: "수원 월드컵경기장", ballCost: 1000, equipmentType: "멀티카메라", registeredBy: "관리자", registeredAt: "2026-01-20" },
  { id: 5, venueName: "마포 체육관", ballCost: 300, equipmentType: "고정카메라", registeredBy: "운영자", registeredAt: "2026-02-01" },
  { id: 6, venueName: "대전 축구장", ballCost: 700, equipmentType: "이동카메라", registeredBy: "관리자", registeredAt: "2026-02-15" },
];

let nextEventId = 9;
let nextBookingVenueId = 7;

// ── Helpers ────────────────────────────────────────────────────────

function delay(ms = 300): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ── Schedule APIs ──────────────────────────────────────────────────

export async function getScheduleEvents(
  filters: ScheduleFilter
): Promise<ScheduleEvent[]> {
  // Try real API first
  const params: Record<string, string> = {};
  if (filters.sportCode) params.sportCode = filters.sportCode;
  if (filters.competitionId) params.competitionId = String(filters.competitionId);
  if (filters.businessType) params.businessType = filters.businessType;
  if (filters.district) params.district = filters.district;
  if (filters.venueId) params.venueId = String(filters.venueId);
  if (filters.status) params.status = filters.status;
  if (filters.competitionKeyword) params.competitionKeyword = filters.competitionKeyword;
  if (filters.month) params.month = String(filters.month);
  if (filters.year) params.year = String(filters.year);

  const apiResult = await gatewayApi.get<ScheduleEvent[]>("/api/v1/admin/reservations/events", params);
  if (apiResult) return apiResult;

  // Mock fallback
  console.warn("[reservation-admin-api] Backend unavailable, using mock data");
  await delay();

  let filtered = [...MOCK_EVENTS];

  if (filters.sportCode) {
    filtered = filtered.filter((e) => e.sportCode === filters.sportCode);
  }
  if (filters.competitionId) {
    filtered = filtered.filter((e) => e.competitionId === filters.competitionId);
  }
  if (filters.businessType) {
    filtered = filtered.filter((e) => e.businessType === filters.businessType);
  }
  if (filters.district) {
    filtered = filtered.filter((e) => e.district.includes(filters.district!));
  }
  if (filters.venueId) {
    filtered = filtered.filter((e) => e.venueId === filters.venueId);
  }
  if (filters.status) {
    filtered = filtered.filter((e) => e.status === filters.status);
  }
  if (filters.competitionKeyword) {
    const kw = filters.competitionKeyword.toLowerCase();
    filtered = filtered.filter((e) =>
      e.competitionName.toLowerCase().includes(kw)
    );
  }

  return filtered;
}

export async function createScheduleEvent(
  data: ScheduleCreateRequest
): Promise<ScheduleEvent> {
  // Try real API first
  const apiResult = await gatewayApi.post<ScheduleEvent>("/api/v1/admin/reservations/events", data);
  if (apiResult) return apiResult;

  // Mock fallback
  console.warn("[reservation-admin-api] Backend unavailable, using mock data");
  await delay();

  const venue = MOCK_BOOKING_VENUES.find((v) => v.id === data.venueId);
  const event: ScheduleEvent = {
    id: nextEventId++,
    sportCode: "SOCCER",
    sportName: "축구",
    competitionId: 0,
    competitionName: "",
    businessType: "B2C",
    district: "",
    venueId: data.venueId,
    venueName: venue?.venueName || "",
    startTime: data.startTime,
    endTime: data.endTime,
    status: "SCHEDULED",
    ballCost: data.ballCost,
    description: data.description,
    bookingType: data.bookingType,
    studioLinked: false,
    createdBy: "관리자",
    createdAt: new Date().toISOString().slice(0, 10),
  };

  MOCK_EVENTS.push(event);
  return event;
}

export async function deleteScheduleEvent(id: number): Promise<void> {
  const apiResult = await gatewayApi.delete(`/api/v1/admin/reservations/events/${id}`);
  if (apiResult !== null) return;
  console.warn("[reservation-admin-api] Backend unavailable, using mock data");
  await delay();
  MOCK_EVENTS = MOCK_EVENTS.filter((e) => e.id !== id);
}

// ── Venue Options ──────────────────────────────────────────────────

export async function getVenueOptions(): Promise<
  { id: number; name: string }[]
> {
  await delay(100);
  return MOCK_BOOKING_VENUES.map((v) => ({ id: v.id, name: v.venueName }));
}

// ── Booking APIs ───────────────────────────────────────────────────

export async function getBookingVenues(
  filters: BookingFilter,
  page = 0,
  size = 20
): Promise<PageResponse<BookingVenue>> {
  // Try real API first
  const params: Record<string, string> = { page: String(page), size: String(size) };
  if (filters.district) params.district = filters.district;
  if (filters.venueId) params.venueId = String(filters.venueId);
  if (filters.equipmentType) params.equipmentType = filters.equipmentType;
  if (filters.searchKeyword) params.searchKeyword = filters.searchKeyword;

  const apiResult = await gatewayApi.get<PageResponse<BookingVenue>>("/api/v1/admin/reservations/venues", params);
  if (apiResult) return apiResult;

  // Mock fallback
  console.warn("[reservation-admin-api] Backend unavailable, using mock data");
  await delay();

  let filtered = [...MOCK_BOOKING_VENUES];

  if (filters.district) {
    // Not filtering by district since venues don't have district in mock
  }
  if (filters.venueId) {
    filtered = filtered.filter((v) => v.id === filters.venueId);
  }
  if (filters.equipmentType) {
    filtered = filtered.filter((v) => v.equipmentType === filters.equipmentType);
  }
  if (filters.searchKeyword) {
    const kw = filters.searchKeyword.toLowerCase();
    filtered = filtered.filter((v) => v.venueName.toLowerCase().includes(kw));
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

export async function createBookingVenue(
  data: BookingCreateRequest
): Promise<BookingVenue> {
  await delay();

  const venue: BookingVenue = {
    id: nextBookingVenueId++,
    venueName: `구장 ${nextBookingVenueId}`,
    ballCost: data.ballCost,
    equipmentType: data.equipmentType,
    registeredBy: "관리자",
    registeredAt: new Date().toISOString().slice(0, 10),
  };

  MOCK_BOOKING_VENUES.push(venue);
  return venue;
}

export async function deleteBookingVenue(id: number): Promise<void> {
  await delay();
  MOCK_BOOKING_VENUES = MOCK_BOOKING_VENUES.filter((v) => v.id !== id);
}
