import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@/test/test-utils'

// Mock the API hooks to avoid actual fetch calls
vi.mock('@/hooks/useApi', () => ({
  useHome: () => ({ data: { banners: [], liveNow: [], recommended: [] }, loading: false, error: null }),
  useBanners: () => ({ data: [], loading: false, error: null }),
  useContents: () => ({ data: [], loading: false, error: null }),
  useContentDetail: () => ({ data: null, loading: false, error: null }),
  useSearch: () => ({ data: [], loading: false, error: null }),
  useSearchSuggestions: () => ({ data: { contents: [], teams: [], competitions: [] }, loading: false, error: null }),
  useTrendingSearches: () => ({ data: [], loading: false, error: null }),
  useTeams: () => ({ data: [], loading: false, error: null }),
  useTeamDetail: () => ({ data: { id: 't1', name: 'Test Team', color: '#ff0000', initial: 'T', subtitle: '야구', followers: 100 }, loading: false, error: null }),
  useCompetitions: () => ({ data: [], loading: false, error: null }),
  useCompetitionDetail: () => ({ data: null, loading: false, error: null }),
  useSchedule: () => ({ data: [], loading: false, error: null }),
  useMyPage: () => ({ data: null, loading: false, error: null }),
  useNotifications: () => ({ data: [], loading: false, error: null }),
  useProducts: () => ({ data: [], loading: false, error: null }),
  useVenues: () => ({ data: [], loading: false, error: null }),
  useClubs: () => ({ data: [], loading: false, error: null }),
}))

vi.mock('@/services/api-client', () => ({
  pochakApi: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
  GATEWAY_URL: 'http://localhost:8080',
}))

describe('Phase 2: Page rendering (no blank pages)', () => {
  it('TeamDetailPage renders team banner', async () => {
    const { default: TeamDetailPage } = await import('./TeamDetailPage')
    render(<TeamDetailPage />)
    expect(screen.getByText('가입')).toBeInTheDocument()
    expect(screen.getAllByText('홈').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('최근 영상')).toBeInTheDocument()
  })

  it('TeamsPage renders title and search', async () => {
    const { default: TeamsPage } = await import('./TeamsPage')
    render(<TeamsPage />)
    expect(screen.getByText('팀/클럽 탐색')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('팀/클럽 검색')).toBeInTheDocument()
  })

  it('CompetitionDetailPage renders competition info', async () => {
    const { default: CompetitionDetailPage } = await import('./CompetitionDetailPage')
    render(<CompetitionDetailPage />)
    expect(screen.getByText('구매하기')).toBeInTheDocument()
    expect(screen.getByText('홈')).toBeInTheDocument()
    expect(screen.getByText('영상')).toBeInTheDocument()
  })

  it('CityPage renders title and search', async () => {
    const { default: CityPage } = await import('./CityPage')
    render(<CityPage />)
    expect(screen.getByText((_content, element) => element?.tagName === 'H1' && element.textContent?.includes('지역, 시설, 일정이') === true)).toBeInTheDocument()
    expect(screen.getByPlaceholderText('시설명, 지역으로 검색')).toBeInTheDocument()
  })

  it('ClubPage renders title and search', async () => {
    const { default: ClubPage } = await import('./ClubPage')
    render(<ClubPage />)
    expect(screen.getByText((_content, element) => element?.tagName === 'H1' && element.textContent?.includes('클럽을 발견하고') === true)).toBeInTheDocument()
    expect(screen.getByPlaceholderText('클럽 검색')).toBeInTheDocument()
  })

  it('NotificationsPage renders title', async () => {
    const { default: NotificationsPage } = await import('./NotificationsPage')
    render(<NotificationsPage />)
    expect(screen.getByText('알림')).toBeInTheDocument()
    expect(screen.getByText('모두 읽음')).toBeInTheDocument()
  })

  it('SettingsPage renders title and tabs', async () => {
    const { default: SettingsPage } = await import('./SettingsPage')
    render(<SettingsPage />)
    expect(screen.getByRole('heading', { name: '설정' })).toBeInTheDocument()
    expect(screen.getByText('알림설정')).toBeInTheDocument()
    expect(screen.getByText('환경설정')).toBeInTheDocument()
  })

  it('NoticesPage renders title', async () => {
    const { default: NoticesPage } = await import('./NoticesPage')
    render(<NoticesPage />)
    expect(screen.getByText('공지사항')).toBeInTheDocument()
  })

  it('SupportPage renders FAQ section', async () => {
    const { default: SupportPage } = await import('./SupportPage')
    render(<SupportPage />)
    expect(screen.getByText('고객센터')).toBeInTheDocument()
    expect(screen.getByText('자주 묻는 질문')).toBeInTheDocument()
    expect(screen.getByText('1:1 문의')).toBeInTheDocument()
  })

  it('AboutPage renders company info', async () => {
    const { default: AboutPage } = await import('./AboutPage')
    render(<AboutPage />)
    expect(screen.getByText('회사소개')).toBeInTheDocument()
    expect(screen.getByText('회사 정보')).toBeInTheDocument()
  })

  it('PartnershipPage renders form', async () => {
    const { default: PartnershipPage } = await import('./PartnershipPage')
    render(<PartnershipPage />)
    expect(screen.getByText('제휴문의')).toBeInTheDocument()
    expect(screen.getByText('제출하기')).toBeInTheDocument()
  })

  it('TermsPage renders tabs', async () => {
    const { default: TermsPage } = await import('./TermsPage')
    render(<TermsPage />)
    expect(screen.getByText('약관 및 정책')).toBeInTheDocument()
    expect(screen.getByText('이용약관')).toBeInTheDocument()
  })

  it('SubscriptionPage renders title and tabs', async () => {
    const { default: SubscriptionPage } = await import('./SubscriptionPage')
    render(<SubscriptionPage />)
    expect(screen.getByRole('heading', { name: '구독/이용권 구매' })).toBeInTheDocument()
    expect(screen.getByText('구독')).toBeInTheDocument()
    expect(screen.getByText('대회')).toBeInTheDocument()
  })

  it('HomePage renders sections', async () => {
    const { default: HomePage } = await import('./HomePage')
    render(<HomePage />)
    expect(screen.getByText('공식 라이브')).toBeInTheDocument()
    expect(screen.getByText('인기 클립')).toBeInTheDocument()
  })

  it('SearchPage renders tabs', async () => {
    const { default: SearchPage } = await import('./SearchPage')
    render(<SearchPage />)
    expect(screen.getByText('전체')).toBeInTheDocument()
    expect(screen.getByText('팀/클럽')).toBeInTheDocument()
  })

  it('SchedulePage renders tabs', async () => {
    const { default: SchedulePage } = await import('./SchedulePage')
    render(<SchedulePage />)
    expect(screen.getByText('이달의대회')).toBeInTheDocument()
    expect(screen.getByText('#축구')).toBeInTheDocument()
  })
})
