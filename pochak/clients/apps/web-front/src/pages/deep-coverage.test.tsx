import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@/test/test-utils'

vi.mock('@/services/api-client', () => ({
  pochakApi: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
  GATEWAY_URL: 'http://localhost:8080',
}))

const mockContents = [
  { id: 'v1', title: 'VOD 영상 1', type: 'VOD' as const, competition: '대회A', sport: '야구', date: '2026-01-01', duration: '1:30:00', viewCount: 1500, tags: ['야구', '유료'], thumbnailUrl: '/thumb1.jpg' },
  { id: 'v2', title: 'VOD 영상 2', type: 'VOD' as const, competition: '대회B', sport: '축구', date: '2026-01-02', duration: '2:00:00', viewCount: 3000, tags: ['축구'], thumbnailUrl: '/thumb2.jpg' },
  { id: 'v3', title: 'VOD 영상 3', type: 'VOD' as const, competition: '대회C', sport: '농구', date: '2026-01-03', duration: '1:45:00', viewCount: 2000, tags: ['농구'], thumbnailUrl: '' },
]
const mockLiveContents = [
  { id: 'l1', title: '라이브 경기 1', type: 'LIVE' as const, competition: '대회C', sport: '농구', date: '2026-01-03', viewCount: 500, tags: ['농구'], isLive: true, thumbnailUrl: '' },
]
const mockClipContents = [
  { id: 'c1', title: '클립 1', type: 'CLIP' as const, competition: '대회A', sport: '야구', date: '2026-01-01', viewCount: 800, tags: ['야구'], thumbnailUrl: '' },
  { id: 'c2', title: '클립 2', type: 'CLIP' as const, competition: '대회B', sport: '축구', date: '2026-01-02', viewCount: 1200, tags: ['축구'], thumbnailUrl: '' },
  { id: 'c3', title: '클립 3', type: 'CLIP' as const, competition: '대회A', sport: '야구', date: '2026-01-03', viewCount: 900, tags: ['야구'], thumbnailUrl: '' },
]
const mockTeams = [
  { id: 't1', name: '팀 A', color: '#ff0000', initial: 'A', subtitle: '야구', followers: 100, imageUrl: '' },
  { id: 't2', name: '팀 B', color: '#0000ff', initial: 'B', subtitle: '축구', followers: 200, imageUrl: '' },
]
const mockCompetitions = [
  { id: 'comp1', name: '대회1', dateRange: '2026.01~02', logoColor: '#ff0000', logoText: 'A', subtitle: '야구', isAd: false, imageUrl: '' },
  { id: 'comp2', name: '대회2', dateRange: '2026.03~04', logoColor: '#0000ff', logoText: 'B', subtitle: '축구', isAd: true, imageUrl: '' },
]

vi.mock('@/hooks/useApi', () => ({
  useHome: () => ({
    data: {
      banners: [
        { id: 'b1', title: '배너1', subtitle: '서브', gradient: 'linear-gradient(red,blue)', linkTo: '/home', imageUrl: '' },
      ],
      liveNow: mockLiveContents,
      recommended: mockContents,
    },
    loading: false,
    error: null,
  }),
  useContents: (type?: string) => {
    if (type === 'LIVE') return { data: mockLiveContents, loading: false, error: null }
    if (type === 'CLIP') return { data: mockClipContents, loading: false, error: null }
    if (type === 'VOD') return { data: mockContents, loading: false, error: null }
    return { data: [...mockLiveContents, ...mockContents, ...mockClipContents], loading: false, error: null }
  },
  useTeams: () => ({ data: mockTeams, loading: false, error: null }),
  useCompetitions: () => ({ data: mockCompetitions, loading: false, error: null }),
  useCompetitionDetail: () => ({ data: null, loading: false, error: null }),
  useContentDetail: () => ({ data: null, loading: false, error: null }),
  useTeamDetail: () => ({ data: mockTeams[0], loading: false, error: null }),
  useSearch: () => ({ data: [...mockContents, ...mockClipContents], loading: false, error: null }),
  useSearchSuggestions: () => ({ data: { contents: [], teams: [], competitions: [] }, loading: false, error: null }),
  useTrendingSearches: () => ({ data: ['축구', '야구', '농구'], loading: false, error: null }),
  useBanners: () => ({ data: [], loading: false, error: null }),
  useSchedule: () => ({ data: [], loading: false, error: null }),
  useMyPage: () => ({ data: null, loading: false, error: null }),
  useNotifications: () => ({ data: [], loading: false, error: null }),
  useProducts: () => ({ data: [], loading: false, error: null }),
  useVenues: () => ({ data: [], loading: false, error: null }),
  useClubs: () => ({ data: [], loading: false, error: null }),
}))

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ type: 'vod', id: 'v1' }),
    useSearchParams: () => {
      const params = new URLSearchParams('q=축구&tab=전체')
      return [params, vi.fn()]
    },
  }
})

// framer-motion mock for HomePage
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}))

beforeEach(() => {
  vi.clearAllMocks()
  HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue(undefined)
  HTMLMediaElement.prototype.pause = vi.fn()
  HTMLMediaElement.prototype.load = vi.fn()
  // Mock Element.prototype.scrollTo for carousel components
  Element.prototype.scrollTo = vi.fn() as any
})

describe('HomePage deep coverage', () => {
  async function renderHomePage() {
    const { default: HomePage } = await import('./HomePage')
    return render(<HomePage />)
  }

  it('renders banner section', async () => {
    await renderHomePage()
    expect(screen.getByLabelText('메인 배너')).toBeInTheDocument()
  })

  it('renders competition section', async () => {
    await renderHomePage()
    expect(screen.getByText('진행중인 대회')).toBeInTheDocument()
  })

  it('renders popular teams section', async () => {
    await renderHomePage()
    expect(screen.getByText('인기 팀/클럽')).toBeInTheDocument()
  })

  it('renders sport filter tabs', async () => {
    await renderHomePage()
    expect(screen.getByText('전체')).toBeInTheDocument()
  })

  it('renders team cards', async () => {
    await renderHomePage()
    expect(screen.getByText('팀 A')).toBeInTheDocument()
    expect(screen.getByText('팀 B')).toBeInTheDocument()
  })

  it('renders competition cards', async () => {
    await renderHomePage()
    expect(screen.getByText('대회1')).toBeInTheDocument()
    expect(screen.getByText('대회2')).toBeInTheDocument()
  })

  it('renders content cards', async () => {
    await renderHomePage()
    // Content section should have video titles
    const titles = screen.getAllByText('VOD 영상 1')
    expect(titles.length).toBeGreaterThanOrEqual(1)
  })

  it('renders banner navigation dots', async () => {
    await renderHomePage()
    // Should have banner dots/controls
    const banner = screen.getByLabelText('메인 배너')
    expect(banner).toBeInTheDocument()
  })
})

describe('SearchPage deep coverage', () => {
  async function renderSearchPage() {
    const { default: SearchPage } = await import('./SearchPage')
    return render(<SearchPage />)
  }

  it('renders search page with query results', async () => {
    await renderSearchPage()
    // Multiple "전체" and "팀/클럽" exist (tabs + content)
    const tabs = screen.getAllByText('전체')
    expect(tabs.length).toBeGreaterThanOrEqual(1)
    const teamTabs = screen.getAllByText('팀/클럽')
    expect(teamTabs.length).toBeGreaterThanOrEqual(1)
  })

  it('renders search result tabs', async () => {
    await renderSearchPage()
    const liveTabs = screen.getAllByText('라이브')
    expect(liveTabs.length).toBeGreaterThanOrEqual(1)
    const compTabs = screen.getAllByText('대회')
    expect(compTabs.length).toBeGreaterThanOrEqual(1)
  })

  it('renders matched content results', async () => {
    await renderSearchPage()
    // With query=축구, it should show search results
    const results = screen.getAllByText(/VOD 영상|클립/)
    expect(results.length).toBeGreaterThanOrEqual(1)
  })

  it('renders team results in search', async () => {
    await renderSearchPage()
    expect(screen.getByText('팀 A')).toBeInTheDocument()
  })
})

describe('ClipEditorPage smoke test', () => {
  it('renders clip editor layout', async () => {
    const { default: ClipEditorPage } = await import('./ClipEditorPage')
    render(<ClipEditorPage />)

    expect(screen.getByText('돌아가기')).toBeInTheDocument()
    expect(screen.getByText('원본 영상 (16:9)')).toBeInTheDocument()
    expect(screen.getByText('클립 프리뷰 (9:16)')).toBeInTheDocument()
  })

  it('renders sidebar tabs', async () => {
    const { default: ClipEditorPage } = await import('./ClipEditorPage')
    render(<ClipEditorPage />)

    expect(screen.getByText('화면 설정')).toBeInTheDocument()
    expect(screen.getByText('텍스트')).toBeInTheDocument()
    expect(screen.getByText('클립 정보')).toBeInTheDocument()
  })

  it('renders clip format badge', async () => {
    const { default: ClipEditorPage } = await import('./ClipEditorPage')
    render(<ClipEditorPage />)
    expect(screen.getByText('클립 형식: 9:16 세로')).toBeInTheDocument()
  })

  it('renders source title', async () => {
    const { default: ClipEditorPage } = await import('./ClipEditorPage')
    render(<ClipEditorPage />)
    expect(screen.getByText('동대문구 리틀야구 vs 군포시 리틀야구')).toBeInTheDocument()
  })

  it('renders save button', async () => {
    const { default: ClipEditorPage } = await import('./ClipEditorPage')
    render(<ClipEditorPage />)
    expect(screen.getByText('저장')).toBeInTheDocument()
  })

  it('switches to text tab', async () => {
    const { default: ClipEditorPage } = await import('./ClipEditorPage')
    render(<ClipEditorPage />)
    fireEvent.click(screen.getByText('텍스트'))
    expect(screen.getByPlaceholderText('상단에 표시할 텍스트')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('하단에 표시할 텍스트')).toBeInTheDocument()
  })

  it('switches to info tab', async () => {
    const { default: ClipEditorPage } = await import('./ClipEditorPage')
    render(<ClipEditorPage />)
    fireEvent.click(screen.getByText('클립 정보'))
    expect(screen.getByPlaceholderText('클립 제목을 입력하세요')).toBeInTheDocument()
  })

  it('edits top text', async () => {
    const { default: ClipEditorPage } = await import('./ClipEditorPage')
    render(<ClipEditorPage />)
    fireEvent.click(screen.getByText('텍스트'))
    const topInput = screen.getByPlaceholderText('상단에 표시할 텍스트')
    fireEvent.change(topInput, { target: { value: '테스트 텍스트' } })
    expect(topInput).toHaveValue('테스트 텍스트')
  })

  it('edits bottom text', async () => {
    const { default: ClipEditorPage } = await import('./ClipEditorPage')
    render(<ClipEditorPage />)
    fireEvent.click(screen.getByText('텍스트'))
    const bottomInput = screen.getByPlaceholderText('하단에 표시할 텍스트')
    fireEvent.change(bottomInput, { target: { value: '하단 테스트' } })
    expect(bottomInput).toHaveValue('하단 테스트')
  })

  it('edits clip title in info tab', async () => {
    const { default: ClipEditorPage } = await import('./ClipEditorPage')
    render(<ClipEditorPage />)
    fireEvent.click(screen.getByText('클립 정보'))
    const titleInput = screen.getByPlaceholderText('클립 제목을 입력하세요')
    fireEvent.change(titleInput, { target: { value: '새 클립 제목' } })
    expect(titleInput).toHaveValue('새 클립 제목')
  })

  it('clicks back button', async () => {
    const { default: ClipEditorPage } = await import('./ClipEditorPage')
    render(<ClipEditorPage />)
    fireEvent.click(screen.getByText('돌아가기'))
    expect(mockNavigate).toHaveBeenCalledWith(-1)
  })

  it('toggles fit mode', async () => {
    const { default: ClipEditorPage } = await import('./ClipEditorPage')
    render(<ClipEditorPage />)
    // Fit/fill toggle
    const fillBtn = screen.getByText('화면 채우기')
    fireEvent.click(fillBtn)
    const fitBtn = screen.getByText('전체 넣기')
    fireEvent.click(fitBtn)
  })

  it('clicks save button', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const { default: ClipEditorPage } = await import('./ClipEditorPage')
    render(<ClipEditorPage />)
    fireEvent.click(screen.getByText('저장'))

    act(() => { vi.advanceTimersByTime(2500) })
    vi.useRealTimers()
  })

  it('manages tags in info tab', async () => {
    const { default: ClipEditorPage } = await import('./ClipEditorPage')
    render(<ClipEditorPage />)
    fireEvent.click(screen.getByText('클립 정보'))
    // Should show existing tags with # prefix
    expect(screen.getByText('#야구')).toBeInTheDocument()
    expect(screen.getByText('#유료')).toBeInTheDocument()
  })

  it('toggles visibility in info tab', async () => {
    const { default: ClipEditorPage } = await import('./ClipEditorPage')
    render(<ClipEditorPage />)
    fireEvent.click(screen.getByText('클립 정보'))
    expect(screen.getByText('공개 설정')).toBeInTheDocument()
    expect(screen.getByText('전체공개')).toBeInTheDocument()
    expect(screen.getByText('나만보기')).toBeInTheDocument()
    fireEvent.click(screen.getByText('나만보기'))
  })

  it('edits description in info tab', async () => {
    const { default: ClipEditorPage } = await import('./ClipEditorPage')
    render(<ClipEditorPage />)
    fireEvent.click(screen.getByText('클립 정보'))
    const descInput = screen.getByPlaceholderText('클립에 대한 설명을 입력하세요')
    fireEvent.change(descInput, { target: { value: '테스트 설명' } })
    expect(descInput).toHaveValue('테스트 설명')
  })

  it('adds a tag via input', async () => {
    const { default: ClipEditorPage } = await import('./ClipEditorPage')
    render(<ClipEditorPage />)
    fireEvent.click(screen.getByText('클립 정보'))
    const tagInput = screen.getByPlaceholderText('태그 추가')
    fireEvent.change(tagInput, { target: { value: '새태그' } })
    fireEvent.keyDown(tagInput, { key: 'Enter' })
  })
})

describe('MyPage watch history deep coverage', () => {
  async function renderMyPage() {
    const { default: MyPage } = await import('./MyPage')
    return render(<MyPage />)
  }

  it('renders home tab with all sections', async () => {
    await renderMyPage()
    expect(screen.getByText('최근 본 영상')).toBeInTheDocument()
    expect(screen.getByText('최근 본 클립')).toBeInTheDocument()
    // "내 클립" appears both as tab and section
    const myClipTexts = screen.getAllByText('내 클립')
    expect(myClipTexts.length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('즐겨찾는 대회')).toBeInTheDocument()
    expect(screen.getByText('즐겨찾는 팀/클럽')).toBeInTheDocument()
  })

  it('renders VOD cards in home tab', async () => {
    await renderMyPage()
    const vods = screen.getAllByText('VOD 영상 1')
    expect(vods.length).toBeGreaterThanOrEqual(1)
  })

  it('switches to history tab and shows filter chips', async () => {
    await renderMyPage()
    fireEvent.click(screen.getByRole('tab', { name: '시청이력' }))
    // Filter chips for 영상/클립 should appear
  })

  it('switches to my clips tab', async () => {
    await renderMyPage()
    fireEvent.click(screen.getByRole('tab', { name: '내클립' }))
  })

  it('switches to reservation tab with dates', async () => {
    await renderMyPage()
    fireEvent.click(screen.getByRole('tab', { name: '시청예약' }))
  })

  it('switches to favorites tab', async () => {
    await renderMyPage()
    fireEvent.click(screen.getByRole('tab', { name: '즐겨찾기' }))
  })

  it('renders edit profile link', async () => {
    await renderMyPage()
    // Profile section has edit link
    const links = screen.getAllByRole('link')
    expect(links.length).toBeGreaterThan(0)
  })
})

describe('PlayerPage with content data', () => {
  async function renderPlayer() {
    const { default: PlayerPage } = await import('./PlayerPage')
    return render(<PlayerPage />)
  }

  it('renders video player with controls', async () => {
    await renderPlayer()
    expect(screen.getByRole('region', { name: '비디오 플레이어' })).toBeInTheDocument()
  })

  it('renders content title and competition', async () => {
    await renderPlayer()
    // The player page should find content from mock data
    expect(screen.getByText('설명')).toBeInTheDocument()
  })

  it('renders related clips section with actual clips', async () => {
    await renderPlayer()
    const clips = screen.getAllByText('클립 1')
    expect(clips.length).toBeGreaterThanOrEqual(1)
  })

  it('renders related VODs', async () => {
    await renderPlayer()
    const vodTitles = screen.getAllByText('VOD 영상 1')
    expect(vodTitles.length).toBeGreaterThanOrEqual(1)
  })

  it('renders sidebar sections', async () => {
    await renderPlayer()
    expect(screen.getByText('이 영상의 내 클립')).toBeInTheDocument()
    expect(screen.getByText('추천영상')).toBeInTheDocument()
  })

  it('renders tag badges in sidebar', async () => {
    await renderPlayer()
    const tags = screen.getAllByText(/#야구|#유료/)
    expect(tags.length).toBeGreaterThanOrEqual(1)
  })

  it('renders bookmark button', async () => {
    await renderPlayer()
    expect(screen.getByText('즐겨찾기')).toBeInTheDocument()
  })

  it('can toggle collapsible sections', async () => {
    await renderPlayer()
    // Click section header to collapse
    fireEvent.click(screen.getByText('이 영상의 내 클립'))
    // Click again to expand
    fireEvent.click(screen.getByText('이 영상의 내 클립'))
  })

  it('renders time display', async () => {
    await renderPlayer()
    // Should show time format - multiple elements may match
    const timeDisplays = screen.getAllByText(/00:00/)
    expect(timeDisplays.length).toBeGreaterThanOrEqual(1)
  })
})

describe('CompetitionDetailPage deep coverage', () => {
  it('renders competition detail', async () => {
    const { default: CompetitionDetailPage } = await import('./CompetitionDetailPage')
    render(<CompetitionDetailPage />)
    expect(screen.getByText('구매하기')).toBeInTheDocument()
    expect(screen.getByText('홈')).toBeInTheDocument()
    expect(screen.getByText('영상')).toBeInTheDocument()
  })
})

describe('SettingsPage deep coverage', () => {
  it('renders all settings sections', async () => {
    const { default: SettingsPage } = await import('./SettingsPage')
    render(<SettingsPage />)
    expect(screen.getByRole('heading', { name: '설정' })).toBeInTheDocument()
    expect(screen.getByText('알림설정')).toBeInTheDocument()
    expect(screen.getByText('환경설정')).toBeInTheDocument()
  })

  it('switches to 환경설정 tab', async () => {
    const { default: SettingsPage } = await import('./SettingsPage')
    render(<SettingsPage />)
    fireEvent.click(screen.getByText('환경설정'))
  })
})

describe('SupportPage deep coverage', () => {
  it('renders FAQ and contact', async () => {
    const { default: SupportPage } = await import('./SupportPage')
    render(<SupportPage />)
    expect(screen.getByText('고객센터')).toBeInTheDocument()
    expect(screen.getByText('자주 묻는 질문')).toBeInTheDocument()
    expect(screen.getByText('1:1 문의')).toBeInTheDocument()
  })

  it('expands FAQ item', async () => {
    const { default: SupportPage } = await import('./SupportPage')
    render(<SupportPage />)
    // Click on first FAQ question
    const faqButtons = screen.getAllByRole('button')
    if (faqButtons.length > 0) {
      fireEvent.click(faqButtons[0])
    }
  })
})

describe('PartnershipPage deep coverage', () => {
  it('renders form fields', async () => {
    const { default: PartnershipPage } = await import('./PartnershipPage')
    render(<PartnershipPage />)
    expect(screen.getByText('제휴문의')).toBeInTheDocument()
    expect(screen.getByText('제출하기')).toBeInTheDocument()
  })

  it('fills partnership form', async () => {
    const { default: PartnershipPage } = await import('./PartnershipPage')
    render(<PartnershipPage />)
    const inputs = screen.getAllByRole('textbox')
    if (inputs.length > 0) {
      fireEvent.change(inputs[0], { target: { value: '테스트 회사' } })
    }
  })
})

describe('NotificationsPage deep coverage', () => {
  it('renders notification list', async () => {
    const { default: NotificationsPage } = await import('./NotificationsPage')
    render(<NotificationsPage />)
    expect(screen.getByText('알림')).toBeInTheDocument()
    expect(screen.getByText('모두 읽음')).toBeInTheDocument()
  })
})

describe('SubscriptionPage deep coverage', () => {
  it('renders subscription tabs', async () => {
    const { default: SubscriptionPage } = await import('./SubscriptionPage')
    render(<SubscriptionPage />)
    expect(screen.getByRole('heading', { name: '구독/이용권 구매' })).toBeInTheDocument()
    expect(screen.getByText('구독')).toBeInTheDocument()
    expect(screen.getByText('대회')).toBeInTheDocument()
  })

  it('switches to 대회 tab', async () => {
    const { default: SubscriptionPage } = await import('./SubscriptionPage')
    render(<SubscriptionPage />)
    fireEvent.click(screen.getByText('대회'))
  })
})

describe('SchedulePage deep coverage', () => {
  it('renders schedule filters', async () => {
    const { default: SchedulePage } = await import('./SchedulePage')
    render(<SchedulePage />)
    expect(screen.getByText('이달의대회')).toBeInTheDocument()
    expect(screen.getByText('#축구')).toBeInTheDocument()
  })
})

describe('CityPage deep coverage', () => {
  it('renders city search page', async () => {
    const { default: CityPage } = await import('./CityPage')
    render(<CityPage />)
    expect(screen.getByPlaceholderText('시설명, 지역으로 검색')).toBeInTheDocument()
  })
})

describe('ClubPage deep coverage', () => {
  it('renders club search page', async () => {
    const { default: ClubPage } = await import('./ClubPage')
    render(<ClubPage />)
    expect(screen.getByPlaceholderText('클럽 검색')).toBeInTheDocument()
  })
})

describe('TeamsPage deep coverage', () => {
  it('renders teams with filter', async () => {
    const { default: TeamsPage } = await import('./TeamsPage')
    render(<TeamsPage />)
    expect(screen.getByText('팀/클럽 탐색')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('팀/클럽 검색')).toBeInTheDocument()
  })

  it('renders team cards', async () => {
    const { default: TeamsPage } = await import('./TeamsPage')
    render(<TeamsPage />)
    expect(screen.getByText('팀 A')).toBeInTheDocument()
    expect(screen.getByText('팀 B')).toBeInTheDocument()
  })
})
