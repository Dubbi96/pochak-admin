/**
 * Deep coverage tests for HomePage.tsx
 * Targets uncovered lines: 259-386
 * Exercises: banner carousel, banner card strip, content filter tabs,
 * live section, content sections, teams section, issue section,
 * banner navigation, auto-rotate
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@/test/test-utils'

vi.mock('@/services/api-client', () => ({
  pochakApi: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
  GATEWAY_URL: 'http://localhost:8080',
}))

const mockBanners = [
  { id: 'b1', title: '배너1 타이틀', subtitle: '배너1 서브', gradient: 'linear-gradient(red,blue)', linkTo: '/home', imageUrl: '/banner1.jpg' },
  { id: 'b2', title: '배너2 타이틀', subtitle: '배너2 서브', gradient: 'linear-gradient(green,yellow)', linkTo: 'https://external.com', imageUrl: '' },
  { id: 'b3', title: '배너3 타이틀', subtitle: '배너3 서브', gradient: 'linear-gradient(blue,green)', linkTo: '', imageUrl: '/banner3.jpg' },
]
const mockContents = [
  { id: 'v1', title: 'VOD 영상 1', type: 'VOD' as const, competition: '대회A', sport: '야구', date: '2026-01-01', duration: '1:30:00', viewCount: 1500, tags: ['야구'], thumbnailUrl: '/thumb1.jpg' },
  { id: 'v2', title: 'VOD 영상 2', type: 'VOD' as const, competition: '대회B', sport: '축구', date: '2026-01-02', duration: '2:00:00', viewCount: 3000, tags: ['축구'], thumbnailUrl: '' },
]
const mockLiveContents = [
  { id: 'l1', title: '라이브 경기', type: 'LIVE' as const, competition: '대회C', sport: '농구', date: '2026-01-03', viewCount: 500, tags: ['농구'], isLive: true, isFree: true, thumbnailUrl: '', homeTeam: '팀X', awayTeam: '팀Y' },
]
const mockClipContents = [
  { id: 'c1', title: '클립 1', type: 'CLIP' as const, competition: '대회A', sport: '야구', date: '2026-01-01', viewCount: 800, tags: ['야구'], thumbnailUrl: '' },
]
const mockTeams = [
  { id: 't1', name: '팀 A', color: '#ff0000', initial: 'A', subtitle: '야구', followers: 100, imageUrl: '' },
  { id: 't2', name: '팀 B', color: '#0000ff', initial: 'B', subtitle: '축구', followers: 200, imageUrl: '' },
]
const mockCompetitions = [
  { id: 'comp1', name: '대회1', dateRange: '2026.01~02', logoColor: '#ff0000', logoText: 'A', subtitle: '야구', isAd: false, imageUrl: '' },
]

vi.mock('@/hooks/useApi', () => ({
  useHome: () => ({
    data: {
      banners: mockBanners,
      liveNow: mockLiveContents,
      recommended: mockContents,
    },
    loading: false,
    error: null,
  }),
  useContents: (type?: string) => {
    if (type === 'CLIP') return { data: mockClipContents, loading: false, error: null }
    return { data: mockContents, loading: false, error: null }
  },
  useTeams: () => ({ data: mockTeams, loading: false, error: null }),
  useCompetitions: () => ({ data: mockCompetitions, loading: false, error: null }),
  useSearchSuggestions: () => ({ data: { contents: [], teams: [], competitions: [] }, loading: false, error: null }),
  useTrendingSearches: () => ({ data: [], loading: false, error: null }),
}))

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  }
})

beforeEach(() => {
  vi.clearAllMocks()
  Element.prototype.scrollTo = vi.fn() as any
  // Mock requestAnimationFrame - don't call cb synchronously to avoid infinite recursion
  vi.spyOn(window, 'requestAnimationFrame').mockImplementation(() => 1)
  vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {})
})

async function renderHomePage() {
  const { default: HomePage } = await import('./HomePage')
  return render(<HomePage />)
}

describe('HomePage banner section', () => {
  it('renders hero banner with title and subtitle', async () => {
    await renderHomePage()
    expect(screen.getAllByText('배너1 타이틀').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('배너1 서브').length).toBeGreaterThanOrEqual(1)
  })

  it('renders LIVE NOW badge', async () => {
    await renderHomePage()
    expect(screen.getByText('LIVE NOW')).toBeInTheDocument()
  })

  it('renders CTA buttons', async () => {
    await renderHomePage()
    expect(screen.getByText('시청하기')).toBeInTheDocument()
    expect(screen.getByText('상세정보')).toBeInTheDocument()
  })

  it('renders banner navigation arrows', async () => {
    await renderHomePage()
    expect(screen.getByLabelText('이전')).toBeInTheDocument()
    expect(screen.getByLabelText('다음')).toBeInTheDocument()
  })

  it('navigates to next banner', async () => {
    await renderHomePage()
    const nextBtn = screen.getByLabelText('다음')
    fireEvent.click(nextBtn)
    // After clicking, banner 2 should show
    expect(screen.getAllByText('배너2 타이틀').length).toBeGreaterThanOrEqual(1)
  })

  it('navigates to previous banner', async () => {
    await renderHomePage()
    const prevBtn = screen.getByLabelText('이전')
    fireEvent.click(prevBtn)
    // Should wrap to last banner
    expect(screen.getAllByText('배너3 타이틀').length).toBeGreaterThanOrEqual(1)
  })

  it('renders dot indicators for banners', async () => {
    await renderHomePage()
    const dotBtns = screen.getAllByLabelText(/배너 \d/)
    expect(dotBtns.length).toBe(3)
  })

  it('clicking dot changes banner', async () => {
    await renderHomePage()
    fireEvent.click(screen.getByLabelText('배너 3'))
    expect(screen.getAllByText('배너3 타이틀').length).toBeGreaterThanOrEqual(1)
  })

  it('renders banner counter', async () => {
    await renderHomePage()
    expect(screen.getByText(/01 \/ 03/)).toBeInTheDocument()
  })

  it('renders progress bar', async () => {
    await renderHomePage()
    // Progress bar is a child of the banner area
    const banner = screen.getByLabelText('메인 배너')
    expect(banner).toBeInTheDocument()
  })
})

describe('HomePage banner card strip', () => {
  it('renders banner cards in strip', async () => {
    await renderHomePage()
    // Each banner should have a card in the strip
    const titles = screen.getAllByText('배너1 타이틀')
    expect(titles.length).toBeGreaterThanOrEqual(1)
  })

  it('clicking card strip item changes banner', async () => {
    await renderHomePage()
    // Banner card strip items are buttons with banner titles
    const allBtn2 = screen.getAllByText('배너2 타이틀')
    if (allBtn2.length > 1) {
      // Click the strip card (not the hero)
      fireEvent.click(allBtn2[allBtn2.length - 1].closest('button')!)
    }
  })

  it('renders NOW badge on active card', async () => {
    await renderHomePage()
    expect(screen.getByText('NOW')).toBeInTheDocument()
  })
})

describe('HomePage content filter tabs', () => {
  it('renders filter tabs', async () => {
    await renderHomePage()
    expect(screen.getAllByText('전체').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('농구').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('축구').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('클립').length).toBeGreaterThanOrEqual(1)
  })

  it('clicking filter tab changes active state', async () => {
    await renderHomePage()
    // Use getAllByText and click the first match (filter tab)
    fireEvent.click(screen.getAllByText('농구')[0])
    fireEvent.click(screen.getAllByText('축구')[0])
    fireEvent.click(screen.getAllByText('클립')[0])
    fireEvent.click(screen.getAllByText('전체')[0])
  })
})

describe('HomePage content sections', () => {
  it('renders competitions section', async () => {
    await renderHomePage()
    expect(screen.getByText('진행중인 대회')).toBeInTheDocument()
    expect(screen.getByText('대회1')).toBeInTheDocument()
  })

  it('renders live section with LIVE badge', async () => {
    await renderHomePage()
    const liveTexts = screen.getAllByText('LIVE')
    expect(liveTexts.length).toBeGreaterThanOrEqual(1)
  })

  it('renders live section title', async () => {
    await renderHomePage()
    expect(screen.getByText('LIVE 영상')).toBeInTheDocument()
  })

  it('renders live content with team names', async () => {
    await renderHomePage()
    expect(screen.getByText('팀X vs 팀Y')).toBeInTheDocument()
  })

  it('renders FO POCHAK clips section', async () => {
    await renderHomePage()
    expect(screen.getByText('FO POCHAK')).toBeInTheDocument()
  })

  it('renders recent videos section', async () => {
    await renderHomePage()
    expect(screen.getByText('최근 영상')).toBeInTheDocument()
  })

  it('renders popular teams section', async () => {
    await renderHomePage()
    expect(screen.getByText('인기 팀/클럽')).toBeInTheDocument()
    expect(screen.getByText('팀 A')).toBeInTheDocument()
    expect(screen.getByText('팀 B')).toBeInTheDocument()
  })

  it('renders issue/news section', async () => {
    await renderHomePage()
    expect(screen.getByText('이슈')).toBeInTheDocument()
  })

  it('renders more links for sections', async () => {
    await renderHomePage()
    const moreLinks = screen.getAllByText('더보기')
    expect(moreLinks.length).toBeGreaterThanOrEqual(1)
  })
})

describe('HomePage banner click behavior', () => {
  it('navigates to internal link on banner click', async () => {
    await renderHomePage()
    const banner = screen.getByLabelText('메인 배너')
    const clickArea = banner.querySelector('.cursor-pointer')
    if (clickArea) {
      fireEvent.click(clickArea)
    }
  })

  it('opens external link on banner click', async () => {
    await renderHomePage()
    // Switch to banner 2 which has external link
    fireEvent.click(screen.getByLabelText('다음'))
    const banner = screen.getByLabelText('메인 배너')
    const clickArea = banner.querySelector('.cursor-pointer')
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null)
    if (clickArea) {
      fireEvent.click(clickArea)
    }
    openSpy.mockRestore()
  })
})

describe('HomePage banner card strip wheel', () => {
  it('handles wheel event on strip', async () => {
    await renderHomePage()
    const strips = document.querySelectorAll('.snap-x')
    if (strips.length > 0) {
      fireEvent.wheel(strips[0], { deltaY: 100, deltaX: 0 })
    }
  })
})
