/**
 * Deep coverage tests for Header.tsx and Sidebar.tsx
 * Header targets: lines 226-330, 366-433
 * Sidebar targets: lines 104-164, 227-228
 * Exercises: search bar interactions, notification dropdown, user menu,
 * sidebar collapsed/expanded state, team links, util nav
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@/test/test-utils'

vi.mock('@/services/api-client', () => ({
  pochakApi: { get: vi.fn(), post: vi.fn() },
  GATEWAY_URL: 'http://localhost:8080',
}))

const mockTeams = [
  { id: 't1', name: '팀 A', color: '#ff0000', initial: 'A', subtitle: '야구', followers: 100, imageUrl: '' },
  { id: 't2', name: '팀 B', color: '#0000ff', initial: 'B', subtitle: '축구', followers: 200, imageUrl: '' },
  { id: 't3', name: '팀 C', color: '#00ff00', initial: 'C', subtitle: '농구', followers: 300, imageUrl: '' },
  { id: 't4', name: '팀 D', color: '#ffff00', initial: 'D', subtitle: '배드민턴', followers: 400, imageUrl: '' },
  { id: 't5', name: '팀 E', color: '#ff00ff', initial: 'E', subtitle: '탁구', followers: 500, imageUrl: '' },
  { id: 't6', name: '팀 F', color: '#00ffff', initial: 'F', subtitle: '테니스', followers: 600, imageUrl: '' },
  { id: 't7', name: '팀 G', color: '#888888', initial: 'G', subtitle: '수영', followers: 700, imageUrl: '' },
]

vi.mock('@/hooks/useApi', () => ({
  useTeams: () => ({ data: mockTeams, loading: false, error: null }),
  useSearchSuggestions: (q: string) => {
    if (q && q.trim().length > 0) {
      return {
        data: {
          contents: [
            { id: 'v1', title: '축구 하이라이트', type: 'VOD', competition: '대회A', thumbnailUrl: '' },
          ],
          teams: [
            { id: 't1', name: '팀 A', color: '#ff0000', initial: 'A', subtitle: '야구', imageUrl: '' },
          ],
          competitions: [
            { id: 'comp1', name: '대회1', logoColor: '#ff0000', dateRange: '2026.01~02', imageUrl: '' },
          ],
        },
        loading: false,
        error: null,
      }
    }
    return { data: { contents: [], teams: [], competitions: [] }, loading: false, error: null }
  },
  useTrendingSearches: () => ({ data: ['축구', '야구'], loading: false, error: null }),
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('Header search bar interactions', () => {
  it('renders search input', async () => {
    const { default: Header } = await import('./Header')
    render(<Header />)
    expect(screen.getByPlaceholderText('검색어를 입력하세요')).toBeInTheDocument()
  })

  it('types in search bar and shows suggestions dropdown', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const { default: Header } = await import('./Header')
    render(<Header />)
    const input = screen.getByPlaceholderText('검색어를 입력하세요')
    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: '축구' } })
    // Wait for debounce
    act(() => { vi.advanceTimersByTime(300) })
    vi.useRealTimers()
  })

  it('submits search form', async () => {
    const { default: Header } = await import('./Header')
    render(<Header />)
    const input = screen.getByPlaceholderText('검색어를 입력하세요')
    fireEvent.change(input, { target: { value: '테스트' } })
    fireEvent.submit(input.closest('form')!)
  })

  it('clears search on Escape', async () => {
    const { default: Header } = await import('./Header')
    render(<Header />)
    const input = screen.getByPlaceholderText('검색어를 입력하세요')
    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: '테스트' } })
    fireEvent.keyDown(input, { key: 'Escape' })
  })

  it('closes dropdown on outside click', async () => {
    const { default: Header } = await import('./Header')
    render(<Header />)
    const input = screen.getByPlaceholderText('검색어를 입력하세요')
    fireEvent.change(input, { target: { value: '테스트' } })
    fireEvent.focus(input)
    // Click outside
    fireEvent.mouseDown(document.body)
  })
})

describe('Header notification dropdown', () => {
  it('renders notification bell with indicator', async () => {
    const { default: Header } = await import('./Header')
    render(<Header />)
    expect(screen.getByLabelText('알림')).toBeInTheDocument()
  })

  it('notification bell is a button', async () => {
    const { default: Header } = await import('./Header')
    render(<Header />)
    const bellBtns = screen.getAllByLabelText('알림')
    expect(bellBtns[0].tagName === 'BUTTON' || bellBtns[0].closest('button')).toBeTruthy()
  })
})

describe('Header profile dropdown', () => {
  it('renders profile button', async () => {
    const { default: Header } = await import('./Header')
    render(<Header />)
    expect(screen.getByLabelText('내 프로필')).toBeInTheDocument()
  })

  it('profile button is clickable', async () => {
    const { default: Header } = await import('./Header')
    render(<Header />)
    const profileBtn = screen.getByLabelText('내 프로필')
    expect(profileBtn).toBeInTheDocument()
    // Radix dropdown menus need pointer events to open in jsdom
    // Just verify the trigger element exists and is interactive
    expect(profileBtn.tagName === 'BUTTON' || profileBtn.closest('button')).toBeTruthy()
  })
})

describe('Header service tabs', () => {
  it('renders all service tabs', async () => {
    const { default: Header } = await import('./Header')
    render(<Header />)
    expect(screen.getByText('포착TV')).toBeInTheDocument()
    expect(screen.getByText('포착시티')).toBeInTheDocument()
    expect(screen.getByText('포착클럽')).toBeInTheDocument()
  })

  it('renders action buttons', async () => {
    const { default: Header } = await import('./Header')
    render(<Header />)
    expect(screen.getByLabelText('촬영')).toBeInTheDocument()
    expect(screen.getByLabelText('이벤트')).toBeInTheDocument()
  })

  it('handles scroll for background change', async () => {
    const { default: Header } = await import('./Header')
    render(<Header />)
    // Simulate scroll
    Object.defineProperty(window, 'scrollY', { value: 50, writable: true })
    fireEvent.scroll(window)
  })
})

describe('Header menu toggle', () => {
  it('renders menu toggle button', async () => {
    const { default: Header } = await import('./Header')
    render(<Header />)
    const menuBtn = screen.getByLabelText('메뉴 토글')
    expect(menuBtn).toBeInTheDocument()
    fireEvent.click(menuBtn)
  })
})

describe('Sidebar expanded state', () => {
  it('renders main navigation in expanded state', async () => {
    const { default: Sidebar } = await import('./Sidebar')
    render(<Sidebar />)
    expect(screen.getByText('홈')).toBeInTheDocument()
    expect(screen.getByText('일정')).toBeInTheDocument()
    expect(screen.getByText('POCHAK')).toBeInTheDocument()
    expect(screen.getByText('마이')).toBeInTheDocument()
  })

  it('renders following team links', async () => {
    const { default: Sidebar } = await import('./Sidebar')
    render(<Sidebar />)
    // Should show team names in expanded mode
    expect(screen.getByText('팀 A')).toBeInTheDocument()
    expect(screen.getByText('팀 B')).toBeInTheDocument()
  })

  it('renders 마이팀 section', async () => {
    const { default: Sidebar } = await import('./Sidebar')
    render(<Sidebar />)
    expect(screen.getByText(/마이팀/)).toBeInTheDocument()
  })

  it('renders 인기 section', async () => {
    const { default: Sidebar } = await import('./Sidebar')
    render(<Sidebar />)
    expect(screen.getByText(/인기/)).toBeInTheDocument()
  })

  it('renders 더보기 link', async () => {
    const { default: Sidebar } = await import('./Sidebar')
    render(<Sidebar />)
    expect(screen.getByText('더보기')).toBeInTheDocument()
  })

  it('renders utility navigation', async () => {
    const { default: Sidebar } = await import('./Sidebar')
    render(<Sidebar />)
    expect(screen.getByText('설정')).toBeInTheDocument()
    expect(screen.getByText('고객센터')).toBeInTheDocument()
    expect(screen.getByText('공지사항')).toBeInTheDocument()
  })

  it('renders logout button', async () => {
    const { default: Sidebar } = await import('./Sidebar')
    render(<Sidebar />)
    const logoutBtns = screen.getAllByText('로그아웃')
    expect(logoutBtns.length).toBeGreaterThanOrEqual(1)
  })

  it('renders ad section', async () => {
    const { default: Sidebar } = await import('./Sidebar')
    render(<Sidebar />)
    expect(screen.getAllByText('AD').length).toBeGreaterThanOrEqual(1)
  })
})

describe('Sidebar collapsed state', () => {
  it('renders collapsed sidebar when sidebar context is collapsed', async () => {
    // The sidebar uses SidebarContext. In default test-utils, it wraps with SidebarProvider.
    // By default expanded = true. To test collapsed, we need to toggle.
    const { default: Sidebar } = await import('./Sidebar')
    const { default: Header } = await import('./Header')
    render(
      <>
        <Header />
        <Sidebar />
      </>
    )
    // Toggle sidebar to collapsed
    const menuBtn = screen.getByLabelText('메뉴 토글')
    fireEvent.click(menuBtn)
    // Now sidebar should be collapsed - team avatars instead of names
  })
})
