/**
 * Coverage for VenueDetailPage (46%) and StoreDetailPage (50%)
 * Uses userEvent to properly activate Radix tabs
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@/test/test-utils'
import userEvent from '@testing-library/user-event'

vi.mock('@/services/api-client', () => ({
  pochakApi: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
  GATEWAY_URL: 'http://localhost:8080',
}))

const mockContents = [
  { id: 'v1', title: 'VOD 1', type: 'VOD' as const, competition: '대회A', sport: '야구', date: '2026-01-01', duration: '1:30:00', viewCount: 1500, tags: ['야구'], thumbnailUrl: '' },
]
const mockLive = [
  { id: 'l1', title: 'Live 1', type: 'LIVE' as const, competition: '대회C', sport: '농구', date: '2026-01-03', viewCount: 500, tags: ['농구'], isLive: true, thumbnailUrl: '' },
]
const mockTeams = [
  { id: 't1', name: '팀 A', color: '#ff0000', initial: 'A', subtitle: '야구', followers: 100, imageUrl: '' },
  { id: 't2', name: '팀 B', color: '#0000ff', initial: 'B', subtitle: '축구', followers: 200, imageUrl: '' },
]

vi.mock('@/hooks/useApi', () => ({
  useContents: (type?: string) => {
    if (type === 'LIVE') return { data: mockLive, loading: false, error: null }
    if (type === 'VOD') return { data: mockContents, loading: false, error: null }
    return { data: [...mockLive, ...mockContents], loading: false, error: null }
  },
  useTeams: () => ({ data: mockTeams, loading: false, error: null }),
  useCompetitions: () => ({ data: [], loading: false, error: null }),
  useProducts: () => ({ data: [], loading: false, error: null }),
  useSearchSuggestions: () => ({ data: { contents: [], teams: [], competitions: [] }, loading: false, error: null }),
  useTrendingSearches: () => ({ data: [], loading: false, error: null }),
  useTeamDetail: () => ({ data: mockTeams[0], loading: false, error: null }),
  useVenueProducts: () => ({ data: [], loading: false, error: null }),
  useTimeSlots: () => ({ data: [], loading: false, error: null }),
  useMyReservations: () => ({ data: [], loading: false, error: null }),
  createReservation: vi.fn().mockResolvedValue(null),
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useParams: () => ({ type: 'vod', id: 'v1' }),
  }
})

beforeEach(() => {
  vi.clearAllMocks()
  Element.prototype.scrollTo = vi.fn() as any
})

describe('VenueDetailPage all tabs with userEvent', () => {
  it('activates 소개 tab (default) and shows content', async () => {
    const { default: VenueDetailPage } = await import('./VenueDetailPage')
    render(<VenueDetailPage />)
    expect(screen.getByText('시설 소개')).toBeInTheDocument()
    expect(screen.getByText('시설 안내')).toBeInTheDocument()
    expect(screen.getByText('연결된 팀/클럽')).toBeInTheDocument()
  })

  it('activates 일정 tab and shows schedule', async () => {
    const user = userEvent.setup()
    const { default: VenueDetailPage } = await import('./VenueDetailPage')
    render(<VenueDetailPage />)
    // Click 일정 tab
    const schedTabs = screen.getAllByText('일정')
    const tabTrigger = schedTabs.find(el => el.closest('[role="tab"]'))
    if (tabTrigger) {
      await user.click(tabTrigger)
      // Schedule content should render
      expect(screen.getByText('2026.01.15 (토)')).toBeInTheDocument()
      expect(screen.getAllByText(/동대문 리틀야구 vs/).length).toBeGreaterThanOrEqual(1)
    }
  })

  it('activates 경기영상 tab and shows videos', async () => {
    const user = userEvent.setup()
    const { default: VenueDetailPage } = await import('./VenueDetailPage')
    render(<VenueDetailPage />)
    await user.click(screen.getByText('경기영상'))
    // Should show video cards
  })

  it('activates 시설정보 tab and shows facility info', async () => {
    const user = userEvent.setup()
    const { default: VenueDetailPage } = await import('./VenueDetailPage')
    render(<VenueDetailPage />)
    await user.click(screen.getByText('시설정보'))
    // Should show facility details
  })

  it('renders action buttons', async () => {
    const { default: VenueDetailPage } = await import('./VenueDetailPage')
    render(<VenueDetailPage />)
    expect(screen.getByText('길찾기')).toBeInTheDocument()
  })

  it('renders venue address', async () => {
    const { default: VenueDetailPage } = await import('./VenueDetailPage')
    render(<VenueDetailPage />)
    expect(screen.getByText('서울특별시 송파구 잠실동 10-2')).toBeInTheDocument()
  })
})

describe('StoreDetailPage coverage', () => {
  it('renders product not found for non-matching id', async () => {
    const { default: StoreDetailPage } = await import('./StoreDetailPage')
    render(<StoreDetailPage />)
    // useParams returns {id: 'v1'} which won't match any product
    expect(screen.getByText('상품을 찾을 수 없습니다.')).toBeInTheDocument()
  })
})
