import { get, api } from './api'

export type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'

export interface Reservation {
  id: number
  venueId: number
  matchId: number | null
  reservedByUserId: number
  reservationType: string
  startTime: string
  endTime: string
  pointCost: number
  status: ReservationStatus
  description: string | null
  createdAt: string
  updatedAt: string
}

export const RESERVATION_STATUS_LABELS: Record<ReservationStatus, string> = {
  PENDING: '대기',
  CONFIRMED: '확정',
  COMPLETED: '완료',
  CANCELLED: '취소',
}

export async function fetchReservations(
  status?: ReservationStatus,
  page = 0,
  size = 20,
): Promise<Reservation[]> {
  const params: Record<string, string> = { page: String(page), size: String(size) }
  if (status) params.status = status
  const data = await get<Reservation[]>('/api/v1/partner/reservations', params)
  return data ?? []
}

export async function approveReservation(id: number): Promise<boolean> {
  try {
    await api.put(`/api/v1/partner/reservations/${id}/approve`)
    return true
  } catch {
    return false
  }
}

export async function rejectReservation(id: number): Promise<boolean> {
  try {
    await api.put(`/api/v1/partner/reservations/${id}/reject`)
    return true
  } catch {
    return false
  }
}
