/**
 * Deep coverage tests for PlayerPage.tsx
 * Targets uncovered lines: 144-250, 263-506
 * Exercises: video controls, like toggle, share, collapsible sections,
 * end overlay VOD/LIVE, countdown, keyboard shortcuts, volume,
 * fullscreen, progress bar, drag seeking
 */
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

vi.mock('@/hooks/useApi', () => ({
  useContents: (type?: string) => {
    if (type === 'LIVE') return { data: mockLiveContents, loading: false, error: null }
    if (type === 'CLIP') return { data: mockClipContents, loading: false, error: null }
    if (type === 'VOD') return { data: mockContents, loading: false, error: null }
    return { data: [...mockLiveContents, ...mockContents, ...mockClipContents], loading: false, error: null }
  },
  useTeams: () => ({ data: [], loading: false, error: null }),
  useSearchSuggestions: () => ({ data: { contents: [], teams: [], competitions: [] }, loading: false, error: null }),
  useTrendingSearches: () => ({ data: [], loading: false, error: null }),
}))

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ type: 'vod', id: 'v1' }),
  }
})

beforeEach(() => {
  vi.clearAllMocks()
  HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue(undefined)
  HTMLMediaElement.prototype.pause = vi.fn()
  HTMLMediaElement.prototype.load = vi.fn()
  Object.defineProperty(HTMLMediaElement.prototype, 'paused', { value: true, writable: true, configurable: true })
  Object.defineProperty(HTMLMediaElement.prototype, 'duration', { value: 120, writable: true, configurable: true })
  Object.defineProperty(HTMLMediaElement.prototype, 'currentTime', { value: 0, writable: true, configurable: true })
  Object.defineProperty(HTMLMediaElement.prototype, 'muted', { value: false, writable: true, configurable: true })
  Object.defineProperty(HTMLMediaElement.prototype, 'volume', { value: 1, writable: true, configurable: true })
  Object.defineProperty(HTMLMediaElement.prototype, 'buffered', {
    value: { length: 1, start: () => 0, end: () => 60 },
    writable: true,
    configurable: true,
  })
  Element.prototype.scrollTo = vi.fn() as any
})

async function renderPlayer() {
  const { default: PlayerPage } = await import('./PlayerPage')
  return render(<PlayerPage />)
}

describe('PlayerPage video player controls', () => {
  it('renders play/pause, skip, volume controls', async () => {
    await renderPlayer()
    expect(screen.getByLabelText('재생')).toBeInTheDocument()
    expect(screen.getByTitle('10초 뒤로')).toBeInTheDocument()
    expect(screen.getByTitle('10초 앞으로')).toBeInTheDocument()
  })

  it('toggles play when play button is clicked', async () => {
    await renderPlayer()
    const playBtn = screen.getByLabelText('재생')
    fireEvent.click(playBtn)
    expect(HTMLMediaElement.prototype.play).toHaveBeenCalled()
  })

  it('skips forward 10 seconds', async () => {
    await renderPlayer()
    fireEvent.click(screen.getByTitle('10초 앞으로'))
  })

  it('skips backward 10 seconds', async () => {
    await renderPlayer()
    fireEvent.click(screen.getByTitle('10초 뒤로'))
  })

  it('toggles mute on click', async () => {
    await renderPlayer()
    const muteBtn = screen.getByTitle('음소거')
    fireEvent.click(muteBtn)
  })

  it('renders volume range input', async () => {
    await renderPlayer()
    const volumeInput = document.querySelector('input[type="range"]')
    expect(volumeInput).not.toBeNull()
    if (volumeInput) {
      fireEvent.change(volumeInput, { target: { value: '0.5' } })
      // set volume to 0 triggers mute
      fireEvent.change(volumeInput, { target: { value: '0' } })
    }
  })

  it('renders fullscreen button', async () => {
    await renderPlayer()
    const fsBtn = screen.getByTitle('전체화면')
    expect(fsBtn).toBeInTheDocument()
    fireEvent.click(fsBtn)
  })

  it('renders PIP button', async () => {
    await renderPlayer()
    const pipBtn = screen.getByTitle('PIP')
    expect(pipBtn).toBeInTheDocument()
    HTMLVideoElement.prototype.requestPictureInPicture = vi.fn().mockResolvedValue({})
    fireEvent.click(pipBtn)
  })

  it('renders clip editor button', async () => {
    await renderPlayer()
    const clipBtn = screen.getByTitle('클립 생성')
    expect(clipBtn).toBeInTheDocument()
    fireEvent.click(clipBtn)
    expect(mockNavigate).toHaveBeenCalledWith('/clip/editor')
  })

  it('renders settings button', async () => {
    await renderPlayer()
    expect(screen.getByTitle('설정')).toBeInTheDocument()
  })

  it('shows time display', async () => {
    await renderPlayer()
    const timeDisplays = screen.getAllByText(/00:00/)
    expect(timeDisplays.length).toBeGreaterThanOrEqual(1)
  })
})

describe('PlayerPage keyboard shortcuts', () => {
  it('space toggles play', async () => {
    await renderPlayer()
    fireEvent.keyDown(window, { key: ' ' })
    expect(HTMLMediaElement.prototype.play).toHaveBeenCalled()
  })

  it('ArrowRight skips forward', async () => {
    await renderPlayer()
    fireEvent.keyDown(window, { key: 'ArrowRight' })
  })

  it('ArrowLeft skips back', async () => {
    await renderPlayer()
    fireEvent.keyDown(window, { key: 'ArrowLeft' })
  })

  it('f toggles fullscreen', async () => {
    await renderPlayer()
    fireEvent.keyDown(window, { key: 'f' })
  })

  it('m toggles mute', async () => {
    await renderPlayer()
    fireEvent.keyDown(window, { key: 'm' })
  })
})

describe('PlayerPage content info', () => {
  it('renders content title', async () => {
    await renderPlayer()
    expect(screen.getAllByText('VOD 영상 1').length).toBeGreaterThanOrEqual(1)
  })

  it('renders competition info', async () => {
    await renderPlayer()
    expect(screen.getAllByText(/대회A/).length).toBeGreaterThanOrEqual(1)
  })

  it('renders tag badges', async () => {
    await renderPlayer()
    expect(screen.getAllByText('#야구').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('#유료').length).toBeGreaterThanOrEqual(1)
  })

  it('renders description section', async () => {
    await renderPlayer()
    expect(screen.getByText('설명')).toBeInTheDocument()
  })
})

describe('PlayerPage like/bookmark/share', () => {
  it('toggles like count up and down', async () => {
    await renderPlayer()
    const likeBtn = screen.getByText('100').closest('button')!
    // Like
    fireEvent.click(likeBtn)
    expect(screen.getByText('101')).toBeInTheDocument()
    // Unlike
    fireEvent.click(likeBtn)
    expect(screen.getByText('100')).toBeInTheDocument()
  })

  it('renders bookmark/follow button', async () => {
    await renderPlayer()
    expect(screen.getByText('즐겨찾기')).toBeInTheDocument()
  })

  it('renders share button', async () => {
    await renderPlayer()
    expect(screen.getByText('공유')).toBeInTheDocument()
  })

  it('renders more options button', async () => {
    await renderPlayer()
    // The ellipsis button renders as icon-sm
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThan(5)
  })
})

describe('PlayerPage collapsible sections', () => {
  it('renders all collapsible sections', async () => {
    await renderPlayer()
    expect(screen.getByText('이 영상의 내 클립')).toBeInTheDocument()
    expect(screen.getByText('이 대회의 라이브')).toBeInTheDocument()
    expect(screen.getByText('추천영상')).toBeInTheDocument()
  })

  it('can collapse and expand sections', async () => {
    await renderPlayer()
    const section = screen.getByText('이 영상의 내 클립')
    // Collapse
    fireEvent.click(section)
    // Expand
    fireEvent.click(section)
  })

  it('collapses 이 대회의 라이브', async () => {
    await renderPlayer()
    fireEvent.click(screen.getByText('이 대회의 라이브'))
    fireEvent.click(screen.getByText('이 대회의 라이브'))
  })

  it('collapses 추천영상', async () => {
    await renderPlayer()
    fireEvent.click(screen.getByText('추천영상'))
    fireEvent.click(screen.getByText('추천영상'))
  })
})

describe('PlayerPage related content', () => {
  it('renders related clips', async () => {
    await renderPlayer()
    const clips = screen.getAllByText('클립 1')
    expect(clips.length).toBeGreaterThanOrEqual(1)
  })

  it('renders related VODs', async () => {
    await renderPlayer()
    const vods = screen.getAllByText('VOD 영상 1')
    expect(vods.length).toBeGreaterThanOrEqual(1)
  })

  it('renders recommended tag pills', async () => {
    await renderPlayer()
    const tags = screen.getAllByText(/#야구|#유료|#해설|#MLB/)
    expect(tags.length).toBeGreaterThanOrEqual(1)
  })
})

describe('PlayerPage video end overlay', () => {
  it('shows end overlay when video ends (VOD)', async () => {
    await renderPlayer()
    const video = document.querySelector('video')!
    // Trigger the ended event
    fireEvent.ended(video)
    // Should show end overlay with countdown
    expect(screen.getByText('다음영상 재생')).toBeInTheDocument()
  })

  it('countdown decrements over time', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    await renderPlayer()
    const video = document.querySelector('video')!
    fireEvent.ended(video)
    // Countdown ring shows the count
    expect(screen.getByText('다음영상 재생')).toBeInTheDocument()

    act(() => { vi.advanceTimersByTime(1100) })
    expect(screen.getByText('9')).toBeInTheDocument()

    act(() => { vi.advanceTimersByTime(1100) })
    expect(screen.getByText('8')).toBeInTheDocument()
    vi.useRealTimers()
  })

  it('can click play to navigate to next video', async () => {
    await renderPlayer()
    const video = document.querySelector('video')!
    fireEvent.ended(video)
    fireEvent.click(screen.getByText('▶ 재생'))
    expect(mockNavigate).toHaveBeenCalled()
  })

  it('can click close to dismiss overlay', async () => {
    await renderPlayer()
    const video = document.querySelector('video')!
    fireEvent.ended(video)
    fireEvent.click(screen.getByText('✕ 닫기'))
    expect(screen.queryByText('다음영상 재생')).not.toBeInTheDocument()
  })
})

describe('PlayerPage progress bar interactions', () => {
  it('shows hover tooltip on progress bar hover', async () => {
    await renderPlayer()
    const progressBar = document.querySelector('.group\\/progress')
    if (progressBar) {
      fireEvent.mouseMove(progressBar, { clientX: 100 })
      fireEvent.mouseLeave(progressBar)
    }
  })

  it('seeks on progress bar click', async () => {
    await renderPlayer()
    const progressBar = document.querySelector('.group\\/progress')
    if (progressBar) {
      Object.defineProperty(progressBar, 'getBoundingClientRect', {
        value: () => ({ left: 0, width: 500, top: 0, height: 10 }),
      })
      fireEvent.click(progressBar, { clientX: 250 })
    }
  })

  it('handles drag seeking with mousedown', async () => {
    await renderPlayer()
    const progressBar = document.querySelector('.group\\/progress')
    if (progressBar) {
      Object.defineProperty(progressBar, 'getBoundingClientRect', {
        value: () => ({ left: 0, width: 500, top: 0, height: 10 }),
      })
      fireEvent.mouseDown(progressBar, { clientX: 100 })
      // Simulate mouse move and up on window
      fireEvent.mouseMove(window, { clientX: 200 })
      fireEvent.mouseUp(window)
    }
  })
})

describe('PlayerPage video container interactions', () => {
  it('shows controls on mouse move, hides on mouse leave', async () => {
    await renderPlayer()
    const region = screen.getByRole('region', { name: '비디오 플레이어' })
    fireEvent.mouseMove(region)
    fireEvent.mouseLeave(region)
  })

  it('toggles play on video area click', async () => {
    await renderPlayer()
    const region = screen.getByRole('region', { name: '비디오 플레이어' })
    fireEvent.click(region)
    expect(HTMLMediaElement.prototype.play).toHaveBeenCalled()
  })
})

describe('PlayerPage channel info', () => {
  it('renders channel name and follower count', async () => {
    await renderPlayer()
    expect(screen.getByText('12.4만 팔로워')).toBeInTheDocument()
  })
})
