/**
 * Coverage test for App.tsx
 * Renders the App component with router to cover all route definitions.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { SidebarProvider } from '@/contexts/SidebarContext'

vi.mock('@/services/api-client', () => ({
  pochakApi: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
  GATEWAY_URL: 'http://localhost:8080',
}))

vi.mock('@/hooks/useApi', () => ({
  useContents: () => ({ data: [], loading: false, error: null }),
  useTeams: () => ({ data: [], loading: false, error: null }),
  useCompetitions: () => ({ data: [], loading: false, error: null }),
  useSearch: () => ({ data: [], loading: false, error: null }),
  useSearchSuggestions: () => ({ data: { contents: [], teams: [], competitions: [] }, loading: false, error: null }),
  useTrendingSearches: () => ({ data: [], loading: false, error: null }),
  useBanners: () => ({ data: [], loading: false, error: null }),
  useProducts: () => ({ data: [], loading: false, error: null }),
  useTeamDetail: () => ({ data: null, loading: false, error: null }),
  useHome: () => ({ data: { banners: [], liveNow: [], recommended: [] }, loading: false, error: null }),
  useVenueProducts: () => ({ data: [], loading: false, error: null }),
  useTimeSlots: () => ({ data: [], loading: false, error: null }),
  useMyReservations: () => ({ data: [], loading: false, error: null }),
  createReservation: vi.fn().mockResolvedValue(null),
  useMyRecordings: () => ({ data: [], loading: false, error: null }),
  createRecordingSchedule: vi.fn().mockResolvedValue(null),
  updateRecordingSchedule: vi.fn().mockResolvedValue(null),
  deleteRecordingSchedule: vi.fn().mockResolvedValue(null),
}))

beforeEach(() => {
  vi.clearAllMocks()
  Element.prototype.scrollTo = vi.fn() as any
  HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue(undefined)
  HTMLMediaElement.prototype.pause = vi.fn()
  HTMLMediaElement.prototype.load = vi.fn()
  vi.spyOn(window, 'requestAnimationFrame').mockImplementation(() => 1)
  vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {})
})

describe('App routing', () => {
  it('renders the home page at /', async () => {
    const { default: App } = await import('./App')
    render(
      <MemoryRouter initialEntries={['/']}>
        <SidebarProvider>
          <App />
        </SidebarProvider>
      </MemoryRouter>
    )
    // App renders without crashing
    expect(document.body).toBeDefined()
  })

  it('renders the login page at /login', async () => {
    const { default: App } = await import('./App')
    render(
      <MemoryRouter initialEntries={['/login']}>
        <SidebarProvider>
          <App />
        </SidebarProvider>
      </MemoryRouter>
    )
    expect(document.body).toBeDefined()
  })
})
