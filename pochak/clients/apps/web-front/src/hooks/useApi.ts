import { useState, useEffect } from 'react'
import { pochakApi } from '@/services/api-client'
import type { Banner, ContentItem, Channel, Competition, VenueProduct, TimeSlot, Reservation, RecordingSchedule } from '@/types/content'

// ── Generic fetch hook ────────────────────────────────────

function useFetch<T>(
  fetcher: () => Promise<T | null>,
  fallback: T,
  deps: unknown[] = [],
): { data: T; loading: boolean; error: string | null } {
  const [data, setData] = useState<T>(fallback)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    fetcher()
      .then((result) => {
        if (cancelled) return
        setData(result ?? fallback)
        setLoading(false)
      })
      .catch((err) => {
        if (cancelled) return
        setError(err?.message || 'Unknown error')
        setData(fallback)
        setLoading(false)
      })

    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return { data, loading, error }
}

// ── Home ──────────────────────────────────────────────────

interface HomeData {
  banners: Banner[]
  liveNow: ContentItem[]
  recommended: ContentItem[]
  featuredProducts?: unknown[]
}

export function useHome() {
  return useFetch<HomeData>(
    () => pochakApi.get<HomeData>('/api/v1/web/home'),
    { banners: [], liveNow: [], recommended: [] },
  )
}

// ── Banners ───────────────────────────────────────────────

export function useBanners() {
  return useFetch<Banner[]>(
    () => pochakApi.get<Banner[]>('/api/v1/web/banners'),
    [],
  )
}

// ── Contents ──────────────────────────────────────────────

export function useContents(
  type?: string,
  sport?: string,
  sort?: string,
) {
  const params: Record<string, string> = {}
  if (sport && sport !== '전체') params.sport = sport
  if (sort) params.sort = sort

  const path = type && type !== '전체'
    ? `/api/v1/contents/${type.toLowerCase()}`
    : '/api/v1/contents/live'

  return useFetch<ContentItem[]>(
    () => pochakApi.get<ContentItem[]>(path, Object.keys(params).length ? params : undefined),
    [],
    [type, sport, sort],
  )
}

// ── Content Detail ────────────────────────────────────────

export function useContentDetail(type: string, id: string) {
  return useFetch<ContentItem | null>(
    () => pochakApi.get<ContentItem>(`/api/v1/contents/${type}/${id}`),
    null,
    [type, id],
  )
}

// ── Search ────────────────────────────────────────────────

export function useSearch(query: string, types?: string) {
  const isEmpty = !query.trim()

  return useFetch<ContentItem[]>(
    async () => {
      if (isEmpty) return []
      const params: Record<string, string> = { q: query }
      if (types) params.types = types
      return pochakApi.get<ContentItem[]>('/api/v1/search', params)
    },
    [],
    [query, types],
  )
}

// ── Teams ─────────────────────────────────────────────────

export function useTeams() {
  return useFetch<Channel[]>(
    () => pochakApi.get<Channel[]>('/api/v1/teams'),
    [],
  )
}

export function useTeamDetail(id: string) {
  return useFetch<Channel | null>(
    () => pochakApi.get<Channel>(`/api/v1/teams/${id}`),
    null,
    [id],
  )
}

// ── Competitions ──────────────────────────────────────────

export function useCompetitions() {
  return useFetch<Competition[]>(
    () => pochakApi.get<Competition[]>('/api/v1/competitions'),
    [],
  )
}

export function useCompetitionDetail(id: string) {
  return useFetch<Competition | null>(
    () => pochakApi.get<Competition>(`/api/v1/competitions/${id}`),
    null,
    [id],
  )
}

// ── Schedule ──────────────────────────────────────────────

export function useSchedule(sport?: string, year?: number, month?: number) {
  const params: Record<string, string> = {}
  if (sport && sport !== '전체') params.sport = sport
  if (year) params.year = String(year)
  if (month !== undefined) params.month = String(month + 1)

  return useFetch(
    () => pochakApi.get('/api/v1/schedule', Object.keys(params).length ? params : undefined),
    [],
    [sport, year, month],
  )
}

// ── My Page ───────────────────────────────────────────────

export function useMyPage() {
  return useFetch(
    () => pochakApi.get('/api/v1/web/my-page'),
    null,
  )
}

// ── Notifications ─────────────────────────────────────────

export function useNotifications() {
  return useFetch(
    () => pochakApi.get('/api/v1/notifications'),
    [],
  )
}

// ── Products ──────────────────────────────────────────────

export function useProducts(type?: string) {
  const params: Record<string, string> = { isActive: 'true' }
  if (type && type !== '전체') params.productType = type

  return useFetch(
    () => pochakApi.get('/api/v1/products', params),
    [],
    [type],
  )
}

// ── Venues (City) ─────────────────────────────────────────

export function useVenues(keyword?: string, sportId?: string) {
  const params: Record<string, string> = {}
  if (keyword) params.keyword = keyword
  if (sportId) params.sportId = sportId

  return useFetch(
    () => pochakApi.get('/api/v1/venues/search', Object.keys(params).length ? params : undefined),
    [],
    [keyword, sportId],
  )
}

// ── Club Detail ───────────────────────────────────────────

export interface ClubDetail {
  teamId: number;
  name: string;
  nameEn?: string;
  shortName?: string;
  logoUrl?: string;
  description?: string;
  homeStadium?: string;
  sportId?: number;
  sportName?: string;
  memberCount: number;
  recentContent?: Array<{
    id: number;
    type: string;
    title: string;
    thumbnailUrl?: string;
    createdAt?: string;
  }>;
  customization?: {
    bannerUrl?: string;
    logoUrl?: string;
    themeColor?: string;
    introText?: string;
    socialLinksJson?: Record<string, string>;
  };
  createdAt?: string;
}

export function useClubDetail(teamId: string | number) {
  return useFetch<ClubDetail | null>(
    () => pochakApi.get<ClubDetail>(`/api/v1/clubs/${teamId}`),
    null,
    [teamId],
  )
}

// ── Club Members ──────────────────────────────────────────

export interface ClubMember {
  membershipId: number;
  userId: number;
  nickname?: string;
  role: string;
  joinType: string;
  approvalStatus: string;
  joinedAt?: string;
}

export function useClubMembers(teamId: string | number) {
  return useFetch<ClubMember[]>(
    () => pochakApi.get<ClubMember[]>(`/api/v1/clubs/${teamId}/members`),
    [],
    [teamId],
  )
}

// ── Clubs ─────────────────────────────────────────────────

export interface ClubItem {
  teamId: number;
  name: string;
  shortName?: string;
  logoUrl?: string;
  sportId?: number;
  sportName?: string;
  memberCount: number;
  createdAt?: string;
}

export function useClubs(sportId?: number, keyword?: string) {
  return useFetch<ClubItem[]>(
    () => {
      const params: Record<string, string> = {}
      if (sportId) params.sportId = String(sportId)
      if (keyword?.trim()) params.keyword = keyword.trim()
      return pochakApi.get<ClubItem[]>('/api/v1/clubs', Object.keys(params).length ? params : undefined)
    },
    [],
    [sportId, keyword],
  )
}

export function usePopularClubs() {
  return useFetch<ClubItem[]>(
    () => pochakApi.get<ClubItem[]>('/api/v1/clubs/popular'),
    [],
  )
}

export function useRecentClubs() {
  return useFetch<ClubItem[]>(
    () => pochakApi.get<ClubItem[]>('/api/v1/clubs/recent'),
    [],
  )
}

// ── GNB Search (live suggestions) ─────────────────────────

interface SearchSuggestions {
  contents: ContentItem[]
  teams: Channel[]
  competitions: Competition[]
}

export function useSearchSuggestions(query: string) {
  const isEmpty = !query.trim()

  return useFetch<SearchSuggestions>(
    async () => {
      if (isEmpty) return { contents: [], teams: [], competitions: [] }
      return pochakApi.get<SearchSuggestions>('/api/v1/search/suggestions', { q: query })
    },
    { contents: [], teams: [], competitions: [] },
    [query],
  )
}

// ── Trending Searches ─────────────────────────────────────

export function useTrendingSearches() {
  return useFetch<string[]>(
    () => pochakApi.get<string[]>('/api/v1/search/trending'),
    [],
  )
}

// ── Venue Products ───────────────────────────────────────

export function useVenueProducts(venueId: string) {
  return useFetch<VenueProduct[]>(
    () => pochakApi.get<VenueProduct[]>(`/api/v1/venues/${venueId}/products`),
    [],
    [venueId],
  )
}

export function useTimeSlots(venueId: string, date: string) {
  const isEmpty = !date
  return useFetch<TimeSlot[]>(
    async () => {
      if (isEmpty) return []
      return pochakApi.get<TimeSlot[]>(`/api/v1/venues/${venueId}/time-slots`, { date })
    },
    [],
    [venueId, date],
  )
}

// ── Reservations ─────────────────────────────────────────

export function useMyReservations() {
  return useFetch<Reservation[]>(
    () => pochakApi.get<Reservation[]>('/api/v1/reservations/my'),
    [],
  )
}

export async function createReservation(body: {
  venueId: string;
  productId: string;
  date: string;
  timeSlot: string;
  hours: number;
}) {
  return pochakApi.post<Reservation>('/api/v1/reservations', body)
}

// ── Recording Schedules ──────────────────────────────────

export function useMyRecordings(year?: number, month?: number) {
  const params: Record<string, string> = {}
  if (year) params.year = String(year)
  if (month !== undefined) params.month = String(month + 1)

  return useFetch<RecordingSchedule[]>(
    () => pochakApi.get<RecordingSchedule[]>('/api/v1/recording-schedules/my', Object.keys(params).length ? params : undefined),
    [],
    [year, month],
  )
}

export async function createRecordingSchedule(body: {
  title: string;
  venueId: string;
  date: string;
  startTime: string;
  endTime: string;
  memo?: string;
  reservationId?: string;
}) {
  return pochakApi.post<RecordingSchedule>('/api/v1/recording-schedules', body)
}

export async function updateRecordingSchedule(id: string, body: Partial<{
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  memo: string;
  status: string;
}>) {
  return pochakApi.put<RecordingSchedule>(`/api/v1/recording-schedules/${id}`, body)
}

export async function deleteRecordingSchedule(id: string) {
  return pochakApi.delete(`/api/v1/recording-schedules/${id}`)
}
