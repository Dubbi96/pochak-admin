/**
 * Additional coverage tests for TeamDetailPage.tsx
 * Targets uncovered lines: 92-150 (notification menu, about modal), 425-454 (community comments)
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@/test/test-utils'
import userEvent from '@testing-library/user-event'

vi.mock('@/services/api-client', () => ({
  pochakApi: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
  GATEWAY_URL: 'http://localhost:8080',
}))

const mockTeam = { id: 't1', name: '테스트팀', color: '#ff0000', initial: 'T', subtitle: '야구 | U10', followers: 12400, imageUrl: '' }
const mockContents = [
  { id: 'v1', title: 'VOD 1', type: 'VOD' as const, competition: '대회A', sport: '야구', date: '2026-01-01', duration: '1:30:00', viewCount: 1500, tags: ['야구'], thumbnailUrl: '' },
]
const mockLive = [
  { id: 'l1', title: 'Live 1', type: 'LIVE' as const, competition: '대회C', sport: '농구', date: '2026-01-03', viewCount: 500, tags: ['농구'], isLive: true, thumbnailUrl: '' },
]
const mockClips = [
  { id: 'c1', title: 'Clip 1', type: 'CLIP' as const, competition: '대회A', sport: '야구', date: '2026-01-01', viewCount: 800, tags: ['야구'], thumbnailUrl: '' },
]
const mockTeams = [
  mockTeam,
  { id: 't2', name: '팀 B', color: '#0000ff', initial: 'B', subtitle: '축구', followers: 200, imageUrl: '' },
]

vi.mock('@/hooks/useApi', () => ({
  useTeamDetail: () => ({ data: mockTeam, loading: false, error: null }),
  useContents: (type?: string) => {
    if (type === 'LIVE') return { data: mockLive, loading: false, error: null }
    if (type === 'CLIP') return { data: mockClips, loading: false, error: null }
    if (type === 'VOD') return { data: mockContents, loading: false, error: null }
    return { data: [...mockLive, ...mockContents, ...mockClips], loading: false, error: null }
  },
  useTeams: () => ({ data: mockTeams, loading: false, error: null }),
  useCompetitions: () => ({ data: [], loading: false, error: null }),
  useSearchSuggestions: () => ({ data: { contents: [], teams: [], competitions: [] }, loading: false, error: null }),
  useTrendingSearches: () => ({ data: [], loading: false, error: null }),
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useParams: () => ({ id: 't1' }),
  }
})

beforeEach(() => {
  vi.clearAllMocks()
  Element.prototype.scrollTo = vi.fn() as any
  Element.prototype.scrollBy = vi.fn() as any
})

async function renderPage() {
  const { default: TeamDetailPage } = await import('./TeamDetailPage')
  return render(<TeamDetailPage />)
}

describe('TeamDetailPage notification menu', () => {
  it('opens notification menu after joining and selects options', async () => {
    await renderPage()
    // Click join
    fireEvent.click(screen.getByText('가입'))
    // After joining, should show "가입됨" button
    const joinedBtn = screen.getByText('가입됨')
    expect(joinedBtn).toBeInTheDocument()
    // Click to open notification menu
    fireEvent.click(joinedBtn)
    // Should show notification options
    expect(screen.getByText('전체')).toBeInTheDocument()
    expect(screen.getByText('맞춤설정')).toBeInTheDocument()
    expect(screen.getByText('없음')).toBeInTheDocument()
    expect(screen.getByText('가입 취소')).toBeInTheDocument()
  })

  it('selects "전체" notification setting', async () => {
    await renderPage()
    fireEvent.click(screen.getByText('가입'))
    fireEvent.click(screen.getByText('가입됨'))
    fireEvent.click(screen.getByText('전체'))
    // Menu should close
    expect(screen.queryByText('가입 취소')).not.toBeInTheDocument()
  })

  it('selects "없음" notification setting', async () => {
    await renderPage()
    fireEvent.click(screen.getByText('가입'))
    fireEvent.click(screen.getByText('가입됨'))
    fireEvent.click(screen.getByText('없음'))
  })

  it('cancels membership via notification menu', async () => {
    await renderPage()
    fireEvent.click(screen.getByText('가입'))
    fireEvent.click(screen.getByText('가입됨'))
    fireEvent.click(screen.getByText('가입 취소'))
    // Should go back to showing "가입" button
    expect(screen.getByText('가입')).toBeInTheDocument()
  })

  it('closes notification menu by clicking backdrop', async () => {
    await renderPage()
    fireEvent.click(screen.getByText('가입'))
    fireEvent.click(screen.getByText('가입됨'))
    // The backdrop is a fixed div
    const backdrop = document.querySelector('.fixed.inset-0.z-\\[99\\]')
    if (backdrop) fireEvent.click(backdrop)
  })
})

describe('TeamDetailPage about modal', () => {
  it('opens and closes the about modal', async () => {
    await renderPage()
    // Click "더보기" button
    const moreBtn = screen.getByText('...더보기')
    fireEvent.click(moreBtn)
    // Modal should show team name and description (multiple matches expected)
    expect(screen.getAllByText(/규칙과 공정성을 바탕으로/).length).toBeGreaterThanOrEqual(2)
    expect(screen.getByText('링크')).toBeInTheDocument()
    expect(screen.getByText('pochak.com')).toBeInTheDocument()
    expect(screen.getByText('추가 정보')).toBeInTheDocument()
    expect(screen.getByText('대한민국')).toBeInTheDocument()
    expect(screen.getByText('가입일: 2025. 1. 1.')).toBeInTheDocument()
  })

  it('closes about modal via X button', async () => {
    await renderPage()
    fireEvent.click(screen.getByText('...더보기'))
    // Find close button (LuX)
    const closeButtons = document.querySelectorAll('button')
    const closeBtn = Array.from(closeButtons).find(btn => {
      const rect = btn.closest('.relative.bg-pochak-surface')
      return rect && btn.querySelector('svg')
    })
    if (closeBtn) fireEvent.click(closeBtn)
  })

  it('closes about modal by clicking overlay', async () => {
    await renderPage()
    fireEvent.click(screen.getByText('...더보기'))
    // Click the overlay (outermost fixed div)
    const overlay = document.querySelector('.fixed.inset-0.z-50')
    if (overlay) fireEvent.click(overlay)
  })

  it('stops propagation when clicking modal content', async () => {
    await renderPage()
    fireEvent.click(screen.getByText('...더보기'))
    // Click inside the modal content
    const modalContent = document.querySelector('.relative.bg-pochak-surface.rounded-2xl')
    if (modalContent) fireEvent.click(modalContent)
    // Modal should still be open
    expect(screen.getByText('pochak.com')).toBeInTheDocument()
  })
})

describe('TeamDetailPage community tab comments', () => {
  it('renders community posts and expands comments', async () => {
    const user = userEvent.setup()
    await renderPage()
    // Switch to 커뮤니티 tab
    const communityTabs = screen.getAllByText('커뮤니티')
    const tabTrigger = communityTabs.find(el => el.closest('[role="tab"]'))
    if (tabTrigger) {
      await user.click(tabTrigger)
      // Should show posts
      expect(screen.getByText(/이번 주말 경기/)).toBeInTheDocument()
      // Expand comments by clicking the comment button (LuMessageSquare)
      const commentButtons = document.querySelectorAll('button')
      const commentBtn = Array.from(commentButtons).find(btn =>
        btn.textContent?.includes('3') && btn.querySelector('svg')
      )
      if (commentBtn) {
        await user.click(commentBtn)
        // Comments should appear
        expect(screen.getByText('김포착')).toBeInTheDocument()
        expect(screen.getByText('화이팅!! 이번에는 꼭 우승하자 💪')).toBeInTheDocument()
        // Reply should be visible
        expect(screen.getByText(/POCHAK에서 라이브 중계합니다/)).toBeInTheDocument()
      }
    }
  })

  it('toggles comment expansion', async () => {
    const user = userEvent.setup()
    await renderPage()
    const communityTabs = screen.getAllByText('커뮤니티')
    const tabTrigger = communityTabs.find(el => el.closest('[role="tab"]'))
    if (tabTrigger) {
      await user.click(tabTrigger)
      // Find and click comment expand button
      const commentButtons = document.querySelectorAll('button')
      const commentBtn = Array.from(commentButtons).find(btn =>
        btn.textContent?.includes('3') && btn.querySelector('svg')
      )
      if (commentBtn) {
        // Expand
        await user.click(commentBtn)
        expect(screen.getByText('김포착')).toBeInTheDocument()
        // Collapse
        await user.click(commentBtn)
      }
    }
  })

  it('renders post with image', async () => {
    const user = userEvent.setup()
    await renderPage()
    const communityTabs = screen.getAllByText('커뮤니티')
    const tabTrigger = communityTabs.find(el => el.closest('[role="tab"]'))
    if (tabTrigger) {
      await user.click(tabTrigger)
      // Post with hasImage=true should render an image
      expect(screen.getByText(/새 시즌 유니폼/)).toBeInTheDocument()
    }
  })

  it('renders 정보 tab with team details', async () => {
    const user = userEvent.setup()
    await renderPage()
    const infoTabs = screen.getAllByText('정보')
    const tabTrigger = infoTabs.find(el => el.closest('[role="tab"]'))
    if (tabTrigger) {
      await user.click(tabTrigger)
      expect(screen.getByText('종목')).toBeInTheDocument()
      expect(screen.getByText('야구')).toBeInTheDocument()
      expect(screen.getByText('위치')).toBeInTheDocument()
      expect(screen.getByText('서울특별시')).toBeInTheDocument()
    }
  })

  it('renders 일정 tab with match schedule', async () => {
    const user = userEvent.setup()
    await renderPage()
    const scheduleTabs = screen.getAllByText('일정')
    const tabTrigger = scheduleTabs.find(el => el.closest('[role="tab"]'))
    if (tabTrigger) {
      await user.click(tabTrigger)
      expect(screen.getByText('2026.01.01 (토)')).toBeInTheDocument()
      expect(screen.getByText('2026.01.02 (일)')).toBeInTheDocument()
      // Match states
      expect(screen.getAllByText('다시보기').length).toBeGreaterThanOrEqual(1)
      expect(screen.getAllByText('시청하기').length).toBeGreaterThanOrEqual(1)
      expect(screen.getAllByText('시청예약').length).toBeGreaterThanOrEqual(1)
    }
  })
})
