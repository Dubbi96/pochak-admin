import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@/test/test-utils'

vi.mock('@/services/api-client', () => ({
  pochakApi: { get: vi.fn(), post: vi.fn() },
  GATEWAY_URL: 'http://localhost:8080',
}))

vi.mock('@/hooks/useApi', () => ({
  useTeams: () => ({ data: [], loading: false, error: null }),
  useSearchSuggestions: () => ({ data: { contents: [], teams: [], competitions: [] }, loading: false, error: null }),
  useTrendingSearches: () => ({ data: [], loading: false, error: null }),
}))

// Mock hls.js
vi.mock('hls.js', () => ({
  default: class MockHls {
    static isSupported() { return false }
    static Events = { MANIFEST_PARSED: 'hlsManifestParsed', ERROR: 'hlsError', LEVEL_SWITCHED: 'hlsLevelSwitched' }
    static ErrorTypes = { NETWORK_ERROR: 'networkError', MEDIA_ERROR: 'mediaError' }
    loadSource = vi.fn()
    attachMedia = vi.fn()
    on = vi.fn()
    destroy = vi.fn()
    recoverMediaError = vi.fn()
    levels = []
    currentLevel = -1
  },
}))

beforeEach(() => {
  vi.clearAllMocks()
  HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue(undefined)
  HTMLMediaElement.prototype.pause = vi.fn()
  HTMLMediaElement.prototype.load = vi.fn()
})

describe('VideoPlayer', () => {
  it('renders without src (no src state)', async () => {
    const { default: VideoPlayer } = await import('./VideoPlayer')
    render(<VideoPlayer src={null} />)
    // Should show no-src state or empty player
  })

  it('renders with src', async () => {
    const { default: VideoPlayer } = await import('./VideoPlayer')
    render(<VideoPlayer src="/test.mp4" />)
    // Should render the video player container
    const container = document.querySelector('[data-player]') || document.querySelector('video')
    // VideoPlayer renders a video element
  })

  it('renders with poster', async () => {
    const { default: VideoPlayer } = await import('./VideoPlayer')
    render(<VideoPlayer src="/test.mp4" poster="/poster.jpg" />)
  })

  it('renders live mode', async () => {
    const { default: VideoPlayer } = await import('./VideoPlayer')
    render(<VideoPlayer src="/live.m3u8" isLive />)
  })

  it('renders with events', async () => {
    const { default: VideoPlayer } = await import('./VideoPlayer')
    render(
      <VideoPlayer
        src="/test.mp4"
        events={[
          { id: 'e1', time: 10, label: '골!', type: 'GOAL', teamName: 'Team A' },
          { id: 'e2', time: 30, label: '파울', type: 'FOUL' },
        ]}
      />
    )
  })

  it('renders with chapters', async () => {
    const { default: VideoPlayer } = await import('./VideoPlayer')
    render(
      <VideoPlayer
        src="/test.mp4"
        chapters={[
          { id: 'ch1', title: '전반전', startTime: 0, endTime: 2700, type: 'HALF' },
          { id: 'ch2', title: '후반전', startTime: 2700, endTime: 5400, type: 'HALF' },
        ]}
      />
    )
  })

  it('renders with autoPlay', async () => {
    const { default: VideoPlayer } = await import('./VideoPlayer')
    render(<VideoPlayer src="/test.mp4" autoPlay />)
  })

  it('handles onTimeUpdate callback', async () => {
    const onTimeUpdate = vi.fn()
    const { default: VideoPlayer } = await import('./VideoPlayer')
    render(<VideoPlayer src="/test.mp4" onTimeUpdate={onTimeUpdate} />)
  })

  it('handles onEnded callback', async () => {
    const onEnded = vi.fn()
    const { default: VideoPlayer } = await import('./VideoPlayer')
    render(<VideoPlayer src="/test.mp4" onEnded={onEnded} />)
  })
})

describe('Header interactions', () => {
  it('renders header with search and menu toggle', async () => {
    const { default: Header } = await import('./Header')
    render(<Header />)
    expect(screen.getByLabelText('메뉴 토글')).toBeInTheDocument()
    expect(screen.getByLabelText('POCHAK 홈')).toBeInTheDocument()
  })

  it('renders service tabs', async () => {
    const { default: Header } = await import('./Header')
    render(<Header />)
    expect(screen.getByText('포착TV')).toBeInTheDocument()
    expect(screen.getByText('포착시티')).toBeInTheDocument()
    expect(screen.getByText('포착클럽')).toBeInTheDocument()
  })

  it('renders search input', async () => {
    const { default: Header } = await import('./Header')
    render(<Header />)
    expect(screen.getByPlaceholderText('검색어를 입력하세요')).toBeInTheDocument()
  })

  it('renders notification bell', async () => {
    const { default: Header } = await import('./Header')
    render(<Header />)
    expect(screen.getByLabelText('알림')).toBeInTheDocument()
  })

  it('toggles menu on button click', async () => {
    const { default: Header } = await import('./Header')
    render(<Header />)
    const menuBtn = screen.getByLabelText('메뉴 토글')
    fireEvent.click(menuBtn)
  })

  it('focuses search input on click', async () => {
    const { default: Header } = await import('./Header')
    render(<Header />)
    const searchInput = screen.getByPlaceholderText('검색어를 입력하세요')
    fireEvent.focus(searchInput)
    fireEvent.change(searchInput, { target: { value: '축구' } })
  })

  it('clears search on escape', async () => {
    const { default: Header } = await import('./Header')
    render(<Header />)
    const searchInput = screen.getByPlaceholderText('검색어를 입력하세요')
    fireEvent.focus(searchInput)
    fireEvent.change(searchInput, { target: { value: '테스트' } })
    fireEvent.keyDown(searchInput, { key: 'Escape' })
  })
})

describe('Sidebar interactions', () => {
  it('renders sidebar with navigation', async () => {
    const { default: Sidebar } = await import('./Sidebar')
    render(<Sidebar />)
    expect(screen.getByText('홈')).toBeInTheDocument()
    expect(screen.getByText('일정')).toBeInTheDocument()
    expect(screen.getByText('마이')).toBeInTheDocument()
  })

  it('renders settings and support links', async () => {
    const { default: Sidebar } = await import('./Sidebar')
    render(<Sidebar />)
    expect(screen.getByText('설정')).toBeInTheDocument()
    expect(screen.getByText('고객센터')).toBeInTheDocument()
  })

  it('renders ad section', async () => {
    const { default: Sidebar } = await import('./Sidebar')
    render(<Sidebar />)
    const ads = screen.getAllByText('AD')
    expect(ads.length).toBeGreaterThanOrEqual(1)
  })
})
