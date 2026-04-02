/**
 * Reservation Admin API service (Schedule Calendar, Booking)
 * Calls real admin API via gateway.
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

// ── Schedule APIs ──────────────────────────────────────────────────

export async function getScheduleEvents(
  filters: ScheduleFilter
): Promise<ScheduleEvent[]> {
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

  return gatewayApi.get<ScheduleEvent[]>("/api/v1/admin/reservations/events", params);
}

export async function createScheduleEvent(
  data: ScheduleCreateRequest
): Promise<ScheduleEvent> {
  return gatewayApi.post<ScheduleEvent>("/api/v1/admin/reservations/events", data);
}

export async function deleteScheduleEvent(id: number): Promise<void> {
  return gatewayApi.delete(`/api/v1/admin/reservations/events/${id}`);
}

// ── Venue Options ──────────────────────────────────────────────────

export async function getVenueOptions(): Promise<
  { id: number; name: string }[]
> {
  return gatewayApi.get<{ id: number; name: string }[]>("/api/v1/admin/reservations/venues/options");
}

// ── Booking APIs ───────────────────────────────────────────────────

export async function getBookingVenues(
  filters: BookingFilter,
  page = 0,
  size = 20
): Promise<PageResponse<BookingVenue>> {
  const params: Record<string, string> = { page: String(page), size: String(size) };
  if (filters.district) params.district = filters.district;
  if (filters.venueId) params.venueId = String(filters.venueId);
  if (filters.equipmentType) params.equipmentType = filters.equipmentType;
  if (filters.searchKeyword) params.searchKeyword = filters.searchKeyword;

  return gatewayApi.get<PageResponse<BookingVenue>>("/api/v1/admin/reservations/venues", params);
}

export async function createBookingVenue(
  data: BookingCreateRequest
): Promise<BookingVenue> {
  return gatewayApi.post<BookingVenue>("/api/v1/admin/reservations/venues", data);
}

export async function deleteBookingVenue(id: number): Promise<void> {
  return gatewayApi.delete(`/api/v1/admin/reservations/venues/${id}`);
}
