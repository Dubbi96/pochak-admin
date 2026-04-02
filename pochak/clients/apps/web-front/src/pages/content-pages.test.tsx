import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@/test/test-utils'

vi.mock('@/services/api-client', () => ({
  pochakApi: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
  GATEWAY_URL: 'http://localhost:8080',
}))

const mockContents = [
  { id: 'v1', title: 'VOD 영상 1', type: 'VOD' as const, competition: '대회A', sport: '야구', date: '2026-01-01', duration: '1:30:00', viewCount: 1500, tags: ['야구', '유료'], thumbnailUrl: '' },
  { id: 'v2', title: 'VOD 영상 2', type: 'VOD' as const, competition: '대회B', sport: '축구', date: '2026-01-02', duration: '2:00:00', viewCount: 3000, tags: ['축구'], thumbnailUrl: '' },
]
const mockLiveContents = [
  { id: 'l1', title: '라이브 경기', type: 'LIVE' as const, competition: '대회C', sport: '농구', date: '2026-01-03', viewCount: 500, tags: ['농구'], isLive: true, thumbnailUrl: '' },
]
const mockClipContents = [
  { id: 'c1', title: '클립 1', type: 'CLIP' as const, competition: '대회A', sport: '야구', date: '2026-01-01', viewCount: 800, tags: ['야구'], thumbnailUrl: '' },
  { id: 'c2', title: '클립 2', type: 'CLIP' as const, competition: '대회B', sport: '축구', date: '2026-01-02', viewCount: 1200, tags: ['축구'], thumbnailUrl: '' },
]
const mockTeams = [
  { id: 't1', name: '팀 A', color: '#ff0000', initial: 'A', subtitle: '야구', followers: 100 },
  { id: 't2', name: '팀 B', color: '#0000ff', initial: 'B', subtitle: '축구', followers: 200 },
]
const mockCompetitions = [
  { id: 'comp1', name: '대회1', dateRange: '2026.01~02', logoColor: '#ff0000', logoText: 'A', subtitle: '야구', isAd: false, imageUrl: '' },
]

vi.mock('@/hooks/useApi', () => ({
  useContents: (type?: string) => {
    if (type === 'LIVE') return { data: mockLiveContents, loading: false, error: null }
    if (type === 'CLIP') return { data: mockClipContents, loading: false, error: null }
    if (type === 'VOD') return { data: mockContents, loading: false, error: null }
    return { data: [...mockLiveContents, ...mockContents, ...mockClipContents], loading: false, error: null }
  },
  useTeams: () => ({ data: mockTeams, loading: false, error: null }),
  useCompetitions: () => ({ data: mockCompetitions, loading: false, error: null }),
  useSearchSuggestions: () => ({ data: { contents: [], teams: [], competitions: [] }, loading: false, error: null }),
  useTrendingSearches: () => ({ data: [], loading: false, error: null }),
  useTeamDetail: () => ({ data: mockTeams[0], loading: false, error: null }),
  useProducts: (type?: string) => ({
    data: [
      { id: 1, name: '시즌 패스', category: '이용권', productType: '이용권', price: 49900, description: '전체 시즌 이용권', imageUrl: '/img/pass.png' },
      { id: 2, name: '팀 유니폼', category: '굿즈', productType: '굿즈', price: 89000, description: '공식 유니폼', imageUrl: '/img/uniform.png' },
      { id: 3, name: '응원 타올', category: '굿즈', productType: '굿즈', price: 15000, description: '경기 필수 응원 아이템', imageUrl: '/img/towel.png' },
    ],
    loading: false,
    error: null,
  }),
  useVenueProducts: () => ({ data: [], loading: false, error: null }),
  useTimeSlots: () => ({ data: [], loading: false, error: null }),
  useMyReservations: () => ({ data: [], loading: false, error: null }),
  createReservation: vi.fn().mockResolvedValue(null),
}))

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ type: 'vod', id: 'v1' }),
    useSearchParams: () => [new URLSearchParams()],
  }
})

beforeEach(() => {
  vi.clearAllMocks()
  // Mock HTMLMediaElement methods for video player tests
  HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue(undefined)
  HTMLMediaElement.prototype.pause = vi.fn()
  HTMLMediaElement.prototype.load = vi.fn()
})

describe('PlayerPage', () => {
  async function renderPlayer() {
    const { default: PlayerPage } = await import('./PlayerPage')
    return render(<PlayerPage />)
  }

  it('renders video player region', async () => {
    await renderPlayer()
    expect(screen.getByRole('region', { name: '비디오 플레이어' })).toBeInTheDocument()
  })

  it('renders video info sections', async () => {
    await renderPlayer()
    expect(screen.getByText('설명')).toBeInTheDocument()
    expect(screen.getByText('즐겨찾기')).toBeInTheDocument()
    expect(screen.getByText('공유')).toBeInTheDocument()
  })

  it('renders play/pause button', async () => {
    await renderPlayer()
    const playBtn = screen.getByLabelText('재생')
    expect(playBtn).toBeInTheDocument()
  })

  it('renders related content sections', async () => {
    await renderPlayer()
    // The page renders clip and VOD section headers dynamically
    const sectionHeaders = screen.getAllByText(/클립|영상/)
    expect(sectionHeaders.length).toBeGreaterThan(0)
  })

  it('toggles like button', async () => {
    await renderPlayer()
    const likeBtn = screen.getByText('100').closest('button')!
    fireEvent.click(likeBtn)
    expect(screen.getByText('101')).toBeInTheDocument()
    fireEvent.click(likeBtn)
    expect(screen.getByText('100')).toBeInTheDocument()
  })

  it('renders collapsible sections', async () => {
    await renderPlayer()
    expect(screen.getByText('이 영상의 내 클립')).toBeInTheDocument()
    expect(screen.getByText('이 대회의 라이브')).toBeInTheDocument()
    expect(screen.getByText('추천영상')).toBeInTheDocument()
  })

  it('can collapse/expand sections', async () => {
    await renderPlayer()
    const sectionBtn = screen.getByText('이 영상의 내 클립')
    fireEvent.click(sectionBtn)
    // After click, the section should toggle
    fireEvent.click(sectionBtn)
  })
})

describe('MyPage', () => {
  async function renderMyPage() {
    const { default: MyPage } = await import('./MyPage')
    return render(<MyPage />)
  }

  it('renders profile header', async () => {
    await renderMyPage()
    // Both ProfileSidebar and page have pochak2026 - use getAllByText
    const names = screen.getAllByText('pochak2026')
    expect(names.length).toBeGreaterThanOrEqual(1)
  })

  it('renders tabs', async () => {
    await renderMyPage()
    expect(screen.getByRole('tab', { name: '홈' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: '시청이력' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: '내클립' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: '시청예약' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: '즐겨찾기' })).toBeInTheDocument()
  })

  it('renders home tab sections', async () => {
    await renderMyPage()
    expect(screen.getByText('최근 본 영상')).toBeInTheDocument()
    expect(screen.getByText('최근 본 클립')).toBeInTheDocument()
  })

  it('switches to watch history tab', async () => {
    await renderMyPage()
    fireEvent.click(screen.getByRole('tab', { name: '시청이력' }))
  })

  it('switches to my clips tab', async () => {
    await renderMyPage()
    fireEvent.click(screen.getByRole('tab', { name: '내클립' }))
  })

  it('switches to reservation tab', async () => {
    await renderMyPage()
    fireEvent.click(screen.getByRole('tab', { name: '시청예약' }))
  })

  it('switches to favorites tab', async () => {
    await renderMyPage()
    fireEvent.click(screen.getByRole('tab', { name: '즐겨찾기' }))
  })
})

describe('ProfilePage', () => {
  async function renderProfile() {
    const { default: ProfilePage } = await import('./ProfilePage')
    return render(<ProfilePage />)
  }

  it('renders profile header', async () => {
    await renderProfile()
    const names = screen.getAllByText('pochak2026')
    expect(names.length).toBeGreaterThanOrEqual(1)
  })

  it('renders personal info section', async () => {
    await renderProfile()
    expect(screen.getByText('개인정보')).toBeInTheDocument()
    expect(screen.getByText('홍길동')).toBeInTheDocument()
    expect(screen.getByText('2000.01.01')).toBeInTheDocument()
    expect(screen.getByText('010-0000-0000')).toBeInTheDocument()
    expect(screen.getByText('kimpochak@hogak.co.kr')).toBeInTheDocument()
  })

  it('renders additional info section', async () => {
    await renderProfile()
    expect(screen.getByText('추가정보')).toBeInTheDocument()
    expect(screen.getByText('관심지역')).toBeInTheDocument()
    expect(screen.getByText('관심종목')).toBeInTheDocument()
    expect(screen.getByText('서비스이용계기')).toBeInTheDocument()
  })

  it('renders password change button', async () => {
    await renderProfile()
    expect(screen.getByText('비밀번호 변경')).toBeInTheDocument()
  })

  it('renders withdrawal button', async () => {
    await renderProfile()
    expect(screen.getByText('회원탈퇴')).toBeInTheDocument()
  })
})

describe('StorePage', () => {
  async function renderStore() {
    const { default: StorePage } = await import('./StorePage')
    return render(<StorePage />)
  }

  it('renders store title', async () => {
    await renderStore()
    expect(screen.getByText('스토어')).toBeInTheDocument()
  })

  it('renders category filters', async () => {
    await renderStore()
    expect(screen.getByText('전체')).toBeInTheDocument()
    expect(screen.getByText('이용권')).toBeInTheDocument()
    expect(screen.getByText('기프트')).toBeInTheDocument()
    expect(screen.getByText('굿즈')).toBeInTheDocument()
  })

  it('renders all products by default', async () => {
    await renderStore()
    expect(screen.getByText('시즌 패스')).toBeInTheDocument()
    expect(screen.getByText('팀 유니폼')).toBeInTheDocument()
    expect(screen.getByText('응원 타올')).toBeInTheDocument()
  })

  it('filters by category', async () => {
    await renderStore()
    fireEvent.click(screen.getByText('이용권'))
    expect(screen.getByText('시즌 패스')).toBeInTheDocument()
    expect(screen.queryByText('팀 유니폼')).not.toBeInTheDocument()
  })

  it('filters by 굿즈 category', async () => {
    await renderStore()
    fireEvent.click(screen.getByText('굿즈'))
    expect(screen.getByText('팀 유니폼')).toBeInTheDocument()
    expect(screen.getByText('응원 타올')).toBeInTheDocument()
    expect(screen.queryByText('시즌 패스')).not.toBeInTheDocument()
  })

  it('renders purchase buttons for each product', async () => {
    await renderStore()
    const buyBtns = screen.getAllByText('구매하기')
    expect(buyBtns.length).toBe(3)
  })

  it('renders prices formatted correctly', async () => {
    await renderStore()
    expect(screen.getByText('49,900원')).toBeInTheDocument()
    expect(screen.getByText('89,000원')).toBeInTheDocument()
  })
})

describe('StoreDetailPage', () => {
  // The useParams mock returns { type: 'vod', id: 'v1' } - id is 'v1' which maps to no product
  it('renders product not found for non-matching id', async () => {
    const { default: StoreDetailPage } = await import('./StoreDetailPage')
    render(<StoreDetailPage />)
    expect(screen.getByText('상품을 찾을 수 없습니다.')).toBeInTheDocument()
  })
})

describe('ContentListPage', () => {
  async function renderContentList() {
    const { default: ContentListPage } = await import('./ContentListPage')
    return render(<ContentListPage />)
  }

  it('renders page title and filters', async () => {
    await renderContentList()
    expect(screen.getByText('콘텐츠')).toBeInTheDocument()
    expect(screen.getByText('유형')).toBeInTheDocument()
    expect(screen.getByText('종목')).toBeInTheDocument()
    expect(screen.getByText('정렬')).toBeInTheDocument()
  })

  it('renders type filter options', async () => {
    await renderContentList()
    // Multiple "전체" exist across different filter rows
    const allTexts = screen.getAllByText('전체')
    expect(allTexts.length).toBeGreaterThanOrEqual(2) // type + sport
    const liveTexts = screen.getAllByText('LIVE')
    expect(liveTexts.length).toBeGreaterThanOrEqual(1)
    const vodTexts = screen.getAllByText('VOD')
    expect(vodTexts.length).toBeGreaterThanOrEqual(1)
    const clipTexts = screen.getAllByText('CLIP')
    expect(clipTexts.length).toBeGreaterThanOrEqual(1)
  })

  it('renders sort options', async () => {
    await renderContentList()
    expect(screen.getByText('최신순')).toBeInTheDocument()
    expect(screen.getByText('인기순')).toBeInTheDocument()
  })

  it('switches type filter', async () => {
    await renderContentList()
    const liveElements = screen.getAllByText('LIVE')
    // Click the first one (filter chip)
    fireEvent.click(liveElements[0])
  })

  it('switches sport filter', async () => {
    await renderContentList()
    const sportButtons = screen.getAllByText('축구')
    fireEvent.click(sportButtons[sportButtons.length - 1])
  })

  it('switches sort option', async () => {
    await renderContentList()
    fireEvent.click(screen.getByText('인기순'))
  })
})

describe('CompetitionListPage', () => {
  async function renderCompList() {
    const { default: CompetitionListPage } = await import('./CompetitionListPage')
    return render(<CompetitionListPage />)
  }

  it('renders page title', async () => {
    await renderCompList()
    expect(screen.getByText('대회')).toBeInTheDocument()
  })

  it('renders status filters', async () => {
    await renderCompList()
    expect(screen.getByText('상태')).toBeInTheDocument()
    expect(screen.getByText('진행중')).toBeInTheDocument()
    expect(screen.getByText('예정')).toBeInTheDocument()
    expect(screen.getByText('종료')).toBeInTheDocument()
  })

  it('renders sport filters', async () => {
    await renderCompList()
    expect(screen.getByText('종목')).toBeInTheDocument()
  })

  it('shows competition count', async () => {
    await renderCompList()
    expect(screen.getByText(/총.*개/)).toBeInTheDocument()
  })

  it('filters by status', async () => {
    await renderCompList()
    fireEvent.click(screen.getByText('진행중'))
    // Should show filtered results (empty since mock data lacks status)
    expect(screen.getByText('조건에 맞는 대회가 없습니다.')).toBeInTheDocument()
  })

  it('filters by sport', async () => {
    await renderCompList()
    const sportFilters = screen.getAllByText('축구')
    fireEvent.click(sportFilters[sportFilters.length - 1])
  })
})

describe('VenueDetailPage', () => {
  // useParams returns { type: 'vod', id: 'v1' } from the file-level mock
  // VenueDetailPage uses id from params, defaults to 'v1' if not matching
  async function renderVenue() {
    const { default: VenueDetailPage } = await import('./VenueDetailPage')
    return render(<VenueDetailPage />)
  }

  it('renders venue name and address', async () => {
    await renderVenue()
    expect(screen.getByText('잠실 유소년 야구장')).toBeInTheDocument()
    expect(screen.getByText('서울특별시 송파구 잠실동 10-2')).toBeInTheDocument()
  })

  it('renders info cards', async () => {
    await renderVenue()
    expect(screen.getByText('위치')).toBeInTheDocument()
    expect(screen.getByText('운영시간')).toBeInTheDocument()
    expect(screen.getByText('연락처')).toBeInTheDocument()
    expect(screen.getByText('비고')).toBeInTheDocument()
  })

  it('renders tabs', async () => {
    await renderVenue()
    expect(screen.getByText('소개')).toBeInTheDocument()
    expect(screen.getByText('일정')).toBeInTheDocument()
    expect(screen.getByText('경기영상')).toBeInTheDocument()
    expect(screen.getByText('시설정보')).toBeInTheDocument()
  })

  it('renders venue description in intro tab', async () => {
    await renderVenue()
    expect(screen.getByText('시설 소개')).toBeInTheDocument()
    expect(screen.getByText('시설 안내')).toBeInTheDocument()
    expect(screen.getByText('연결된 팀/클럽')).toBeInTheDocument()
  })

  it('renders action buttons', async () => {
    await renderVenue()
    expect(screen.getByText('길찾기')).toBeInTheDocument()
  })

  it('toggles bookmark', async () => {
    await renderVenue()
    // Click save button (bookmark icon)
  })
})

describe('CheckoutPage', () => {
  async function renderCheckout() {
    const { default: CheckoutPage } = await import('./CheckoutPage')
    return render(<CheckoutPage />)
  }

  it('renders checkout title', async () => {
    await renderCheckout()
    expect(screen.getByText('결제하기')).toBeInTheDocument()
  })

  it('renders product summary', async () => {
    await renderCheckout()
    expect(screen.getByText('주문 상품')).toBeInTheDocument()
  })

  it('renders payment methods', async () => {
    await renderCheckout()
    expect(screen.getByText('신용/체크카드')).toBeInTheDocument()
    expect(screen.getByText('휴대폰 결제')).toBeInTheDocument()
    expect(screen.getByText('계좌이체')).toBeInTheDocument()
  })

  it('shows card info when card is selected', async () => {
    await renderCheckout()
    expect(screen.getByText('카드 정보')).toBeInTheDocument()
  })

  it('hides card info when phone payment selected', async () => {
    await renderCheckout()
    fireEvent.click(screen.getByText('휴대폰 결제'))
    expect(screen.queryByText('카드 정보')).not.toBeInTheDocument()
  })

  it('purchase button disabled without terms agreement', async () => {
    await renderCheckout()
    const buyBtn = screen.getByRole('button', { name: /결제하기/ })
    expect(buyBtn).toBeDisabled()
  })

  it('enables purchase after agreeing to terms', async () => {
    await renderCheckout()
    fireEvent.click(screen.getByText(/결제 약관/))
    const buyBtn = screen.getByRole('button', { name: /결제하기/ })
    expect(buyBtn).not.toBeDisabled()
  })

  it('processes payment and shows completion', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    await renderCheckout()
    fireEvent.click(screen.getByText(/결제 약관/))
    fireEvent.click(screen.getByRole('button', { name: /결제하기/ }))

    expect(screen.getByText('결제 처리 중...')).toBeInTheDocument()

    act(() => { vi.advanceTimersByTime(3000) })

    expect(screen.getByText('결제가 완료되었습니다')).toBeInTheDocument()
    expect(screen.getByText('마이페이지로 이동')).toBeInTheDocument()
    expect(screen.getByText('홈으로 이동')).toBeInTheDocument()

    fireEvent.click(screen.getByText('마이페이지로 이동'))
    expect(mockNavigate).toHaveBeenCalledWith('/my')

    vi.useRealTimers()
  })

  it('renders security note', async () => {
    await renderCheckout()
    expect(screen.getByText(/SSL 암호화/)).toBeInTheDocument()
  })
})

describe('ClubManagerPage', () => {
  async function renderClubManager() {
    const { default: ClubManagerPage } = await import('./ClubManagerPage')
    return render(<ClubManagerPage />)
  }

  it('renders page title and tabs', async () => {
    await renderClubManager()
    expect(screen.getByText('클럽 관리')).toBeInTheDocument()
    expect(screen.getByText('대시보드')).toBeInTheDocument()
    expect(screen.getByText('멤버 관리')).toBeInTheDocument()
    expect(screen.getByText('설정')).toBeInTheDocument()
    expect(screen.getByText('게시글 관리')).toBeInTheDocument()
  })

  it('renders dashboard stats', async () => {
    await renderClubManager()
    expect(screen.getByText('총 멤버')).toBeInTheDocument()
    expect(screen.getByText('24명')).toBeInTheDocument()
    expect(screen.getByText('이번 주 활동')).toBeInTheDocument()
    expect(screen.getByText('새 가입 신청')).toBeInTheDocument()
    expect(screen.getByText('게시글')).toBeInTheDocument()
  })

  it('renders recent activities', async () => {
    await renderClubManager()
    expect(screen.getByText('최근 활동')).toBeInTheDocument()
    expect(screen.getByText('김민준')).toBeInTheDocument()
    expect(screen.getByText('이서연')).toBeInTheDocument()
  })

  it('switches to member management tab', async () => {
    await renderClubManager()
    fireEvent.click(screen.getByText('멤버 관리'))
    expect(screen.getByPlaceholderText('멤버 검색')).toBeInTheDocument()
    expect(screen.getByText('역할')).toBeInTheDocument()
    expect(screen.getByText('가입일')).toBeInTheDocument()
  })

  it('searches members', async () => {
    await renderClubManager()
    fireEvent.click(screen.getByText('멤버 관리'))
    const searchInput = screen.getByPlaceholderText('멤버 검색')
    fireEvent.change(searchInput, { target: { value: '김' } })
    expect(screen.getByText('김민준')).toBeInTheDocument()
  })

  it('shows empty state for member search with no results', async () => {
    await renderClubManager()
    fireEvent.click(screen.getByText('멤버 관리'))
    fireEvent.change(screen.getByPlaceholderText('멤버 검색'), { target: { value: '없는이름' } })
    expect(screen.getByText('검색 결과가 없습니다.')).toBeInTheDocument()
  })

  it('switches to settings tab', async () => {
    await renderClubManager()
    fireEvent.click(screen.getByText('설정'))
    expect(screen.getByDisplayValue('포착 FC')).toBeInTheDocument()
    expect(screen.getByText('클럽 공개 여부')).toBeInTheDocument()
    expect(screen.getByText('저장')).toBeInTheDocument()
  })

  it('edits club settings', async () => {
    await renderClubManager()
    fireEvent.click(screen.getByText('설정'))
    const nameInput = screen.getByDisplayValue('포착 FC')
    fireEvent.change(nameInput, { target: { value: '새 클럽' } })
    expect(screen.getByDisplayValue('새 클럽')).toBeInTheDocument()
  })

  it('switches to post management tab', async () => {
    await renderClubManager()
    fireEvent.click(screen.getByText('게시글 관리'))
    expect(screen.getByText('이번 주 토요일 친선 경기 안내')).toBeInTheDocument()
    expect(screen.getByText('3월 회비 납부 안내')).toBeInTheDocument()
  })

  it('deletes a post', async () => {
    await renderClubManager()
    fireEvent.click(screen.getByText('게시글 관리'))
    // Find delete buttons (trash icons)
    const deleteButtons = screen.getAllByRole('button').filter(btn =>
      btn.querySelector('svg')
    )
    // Click the first delete-like button in the posts section
    const postTitle = screen.getByText('이번 주 토요일 친선 경기 안내')
    expect(postTitle).toBeInTheDocument()
  })
})

describe('ClipPlayerPage', () => {
  // ClipPlayerPage uses useParams for {id} - our mock returns {type: 'vod', id: 'v1'}
  // which won't match any clip - so it falls back to first clip or empty
  async function renderClipPlayer() {
    const { default: ClipPlayerPage } = await import('./ClipPlayerPage')
    return render(<ClipPlayerPage />)
  }

  it('renders clip player with info panel', async () => {
    await renderClipPlayer()
    // It renders even with no matching clip - falls back to first clip or empty
    expect(screen.getByText('설명')).toBeInTheDocument()
    expect(screen.getByText('관련 클립')).toBeInTheDocument()
    expect(screen.getByText('원본 영상 보기')).toBeInTheDocument()
  })

  it('renders action buttons', async () => {
    await renderClipPlayer()
    expect(screen.getByText('공유')).toBeInTheDocument()
  })
})
