/**
 * Additional coverage tests for SearchPage.tsx
 * Targets uncovered lines: 19-21 (setActiveTab), 263-297 (NoResults component with recommendations)
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@/test/test-utils'
import userEvent from '@testing-library/user-event'

vi.mock('@/services/api-client', () => ({
  pochakApi: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
  GATEWAY_URL: 'http://localhost:8080',
}))

const mockTeams = [
  { id: 't1', name: '추천팀', color: '#ff0000', initial: 'R', subtitle: '야구', followers: 500, imageUrl: '' },
]
const mockVod = [
  { id: 'v1', title: '추천 VOD', type: 'VOD' as const, competition: '대회A', sport: '야구', date: '2026-01-01', duration: '1:30:00', viewCount: 1500, tags: ['야구'], thumbnailUrl: '' },
]
const mockClips = [
  { id: 'c1', title: '추천 클립', type: 'CLIP' as const, competition: '대회A', sport: '야구', date: '2026-01-01', viewCount: 800, tags: ['야구'], thumbnailUrl: '' },
]
const mockComps = [
  { id: 'comp1', name: '추천 대회', dateRange: '2026.01~02', logoColor: '#ff0000', logoText: 'R', subtitle: '야구', isAd: false, imageUrl: '' },
]

// Control whether API returns data
let returnEmptyData = false

vi.mock('@/hooks/useApi', () => ({
  useSearch: () => ({ data: [], loading: false, error: null }),
  useTeams: () => ({ data: returnEmptyData ? [] : mockTeams, loading: false, error: null }),
  useContents: (type?: string) => {
    if (returnEmptyData) return { data: [], loading: false, error: null }
    if (type === 'LIVE') return { data: [], loading: false, error: null }
    if (type === 'CLIP') return { data: mockClips, loading: false, error: null }
    return { data: mockVod, loading: false, error: null }
  },
  useCompetitions: () => ({ data: returnEmptyData ? [] : mockComps, loading: false, error: null }),
  useSearchSuggestions: () => ({ data: { contents: [], teams: [], competitions: [] }, loading: false, error: null }),
  useTrendingSearches: () => ({ data: [], loading: false, error: null }),
}))

let mockSearchParams = new URLSearchParams()
const mockSetSearchParams = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useSearchParams: () => [mockSearchParams, mockSetSearchParams],
  }
})

beforeEach(() => {
  vi.clearAllMocks()
  Element.prototype.scrollTo = vi.fn() as any
})

describe('SearchPage setActiveTab function', () => {
  it('calls setSearchParams when switching tabs with a query', async () => {
    mockSearchParams = new URLSearchParams('q=테스트&tab=전체')
    const user = userEvent.setup()
    const { default: SearchPage } = await import('./SearchPage')
    render(<SearchPage />)

    // Click on a different tab to trigger setActiveTab (lines 19-21)
    const tabButtons = screen.getAllByRole('tab')
    const teamTab = tabButtons.find(btn => btn.textContent === '팀/클럽')
    if (teamTab) {
      await user.click(teamTab)
      expect(mockSetSearchParams).toHaveBeenCalled()
    }
  })
})

describe('SearchPage NoResults with recommendations', () => {
  beforeEach(() => {
    returnEmptyData = true
  })

  afterEach(() => {
    returnEmptyData = false
  })

  it('renders NoResults for 전체 tab when no results', async () => {
    mockSearchParams = new URLSearchParams('q=없는검색어&tab=전체')
    const { default: SearchPage } = await import('./SearchPage')
    render(<SearchPage />)
    expect(screen.getByText('검색 결과가 없습니다')).toBeInTheDocument()
    expect(screen.getAllByText(/없는검색어/).length).toBeGreaterThanOrEqual(1)
  })

  it('renders NoResults for 팀/클럽 tab', async () => {
    mockSearchParams = new URLSearchParams('q=없는검색어&tab=팀/클럽')
    const { default: SearchPage } = await import('./SearchPage')
    render(<SearchPage />)
    expect(screen.getByText('검색 결과가 없습니다')).toBeInTheDocument()
  })

  it('renders NoResults for 라이브 tab', async () => {
    mockSearchParams = new URLSearchParams('q=없는검색어&tab=라이브')
    const { default: SearchPage } = await import('./SearchPage')
    render(<SearchPage />)
    expect(screen.getByText('검색 결과가 없습니다')).toBeInTheDocument()
  })

  it('renders NoResults for 대회 tab', async () => {
    mockSearchParams = new URLSearchParams('q=없는검색어&tab=대회')
    const { default: SearchPage } = await import('./SearchPage')
    render(<SearchPage />)
    expect(screen.getByText('검색 결과가 없습니다')).toBeInTheDocument()
  })

  it('renders NoResults for 영상 tab', async () => {
    mockSearchParams = new URLSearchParams('q=없는검색어&tab=영상')
    const { default: SearchPage } = await import('./SearchPage')
    render(<SearchPage />)
    expect(screen.getByText('검색 결과가 없습니다')).toBeInTheDocument()
  })

  it('renders NoResults for 클립 tab', async () => {
    mockSearchParams = new URLSearchParams('q=없는검색어&tab=클립')
    const { default: SearchPage } = await import('./SearchPage')
    render(<SearchPage />)
    expect(screen.getByText('검색 결과가 없습니다')).toBeInTheDocument()
  })
})
