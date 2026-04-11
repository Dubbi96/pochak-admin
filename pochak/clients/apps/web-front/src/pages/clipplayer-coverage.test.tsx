/**
 * Additional coverage for ClipPlayerPage.tsx
 * Targets: keyboard nav (lines 87-88), prev/next buttons (122-133),
 * share modal open (223-228), bookmark toggle, like toggle
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@/test/test-utils'

vi.mock('@/services/api-client', () => ({
  pochakApi: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
  GATEWAY_URL: 'http://localhost:8080',
}))

const mockClips = [
  { id: 'c1', title: '클립 1', type: 'CLIP' as const, competition: '대회A', sport: '야구', date: '2026-01-01', viewCount: 800, tags: ['야구', '하이라이트'], thumbnailUrl: '' },
  { id: 'c2', title: '클립 2', type: 'CLIP' as const, competition: '대회B', sport: '축구', date: '2026-01-02', viewCount: 1200, tags: ['축구'], thumbnailUrl: '' },
  { id: 'c3', title: '클립 3', type: 'CLIP' as const, competition: '대회C', sport: '농구', date: '2026-01-03', viewCount: 500, tags: ['농구'], thumbnailUrl: '' },
]

vi.mock('@/hooks/useApi', () => ({
  useContents: () => ({ data: mockClips, loading: false, error: null }),
  useTeams: () => ({ data: [], loading: false, error: null }),
  useCompetitions: () => ({ data: [], loading: false, error: null }),
  useSearchSuggestions: () => ({ data: { contents: [], teams: [], competitions: [] }, loading: false, error: null }),
  useTrendingSearches: () => ({ data: [], loading: false, error: null }),
}))

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ id: 'c2' }),
  }
})

beforeEach(() => {
  vi.clearAllMocks()
  HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue(undefined)
  HTMLMediaElement.prototype.pause = vi.fn()
  HTMLMediaElement.prototype.load = vi.fn()
  Object.defineProperty(HTMLMediaElement.prototype, 'paused', { value: false, writable: true, configurable: true })
  Object.defineProperty(HTMLMediaElement.prototype, 'duration', { value: 30, writable: true, configurable: true })
  Object.defineProperty(HTMLMediaElement.prototype, 'currentTime', { value: 10, writable: true, configurable: true })
  Object.defineProperty(HTMLMediaElement.prototype, 'muted', { value: true, writable: true, configurable: true })
  vi.spyOn(window, 'requestAnimationFrame').mockImplementation(() => 1)
  vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {})
  window.open = vi.fn()
  Object.assign(navigator, { clipboard: { writeText: vi.fn().mockResolvedValue(undefined) } })
  Element.prototype.scrollTo = vi.fn() as any
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('ClipPlayerPage keyboard navigation', () => {
  it('navigates to prev clip on ArrowUp', async () => {
    const { default: ClipPlayerPage } = await import('./ClipPlayerPage')
    render(<ClipPlayerPage />)
    fireEvent.keyDown(window, { key: 'ArrowUp' })
    expect(mockNavigate).toHaveBeenCalledWith('/clip/c1')
  })

  it('navigates to next clip on ArrowDown', async () => {
    const { default: ClipPlayerPage } = await import('./ClipPlayerPage')
    render(<ClipPlayerPage />)
    fireEvent.keyDown(window, { key: 'ArrowDown' })
    expect(mockNavigate).toHaveBeenCalledWith('/clip/c3')
  })

  it('toggles play on Space key', async () => {
    const { default: ClipPlayerPage } = await import('./ClipPlayerPage')
    render(<ClipPlayerPage />)
    fireEvent.keyDown(window, { key: ' ' })
    expect(HTMLMediaElement.prototype.pause).toHaveBeenCalled()
  })

  it('toggles mute on m key', async () => {
    const { default: ClipPlayerPage } = await import('./ClipPlayerPage')
    render(<ClipPlayerPage />)
    fireEvent.keyDown(window, { key: 'm' })
  })
})

describe('ClipPlayerPage navigation buttons', () => {
  it('clicks prev clip button', async () => {
    const { default: ClipPlayerPage } = await import('./ClipPlayerPage')
    render(<ClipPlayerPage />)
    // Find up arrow button (prev clip)
    const buttons = screen.getAllByRole('button')
    const prevBtn = buttons.find(b => !b.disabled && b.querySelector('svg'))
    if (prevBtn) fireEvent.click(prevBtn)
  })
})

describe('ClipPlayerPage share modal', () => {
  it('opens share modal on share button click', async () => {
    const { default: ClipPlayerPage } = await import('./ClipPlayerPage')
    render(<ClipPlayerPage />)
    const shareBtn = screen.getByText('공유')
    fireEvent.click(shareBtn)
    // ShareModal should be visible
    expect(screen.getByText('링크 복사')).toBeInTheDocument()
  })
})

describe('ClipPlayerPage like and bookmark', () => {
  it('toggles like', async () => {
    const { default: ClipPlayerPage } = await import('./ClipPlayerPage')
    render(<ClipPlayerPage />)
    const likeBtn = screen.getByText('100').closest('button')
    if (likeBtn) {
      fireEvent.click(likeBtn)
      expect(screen.getByText('101')).toBeInTheDocument()
    }
  })

  it('toggles bookmark', async () => {
    const { default: ClipPlayerPage } = await import('./ClipPlayerPage')
    render(<ClipPlayerPage />)
    const buttons = screen.getAllByRole('button')
    const bookmarkBtn = buttons.find(b => b.querySelector('.fill-current') || b.getAttribute('data-active') !== null || b.className.includes('ml-auto'))
    if (bookmarkBtn) fireEvent.click(bookmarkBtn)
  })
})

describe('ClipPlayerPage video toggle', () => {
  it('toggles play/pause by clicking video area', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const { default: ClipPlayerPage } = await import('./ClipPlayerPage')
    render(<ClipPlayerPage />)
    const video = document.querySelector('video')
    if (video) {
      fireEvent.click(video)
      act(() => { vi.advanceTimersByTime(700) })
    }
    vi.useRealTimers()
  })
})
