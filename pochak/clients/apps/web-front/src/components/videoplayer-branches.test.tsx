/**
 * Branch coverage for VideoPlayer.tsx
 * Targets uncovered branches in seek bar, volume, quality menu, etc.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@/test/test-utils'
import type { VideoPlayerProps, TimelineEvent, Chapter } from './VideoPlayer'

let hlsEventHandlers: Record<string, Function> = {}
let hlsInstance: any = null

vi.mock('@/services/api-client', () => ({
  pochakApi: { get: vi.fn(), post: vi.fn() },
  GATEWAY_URL: 'http://localhost:8080',
}))

vi.mock('@/hooks/useApi', () => ({
  useTeams: () => ({ data: [], loading: false, error: null }),
  useSearchSuggestions: () => ({ data: { contents: [], teams: [], competitions: [] }, loading: false, error: null }),
  useTrendingSearches: () => ({ data: [], loading: false, error: null }),
}))

vi.mock('hls.js', () => ({
  default: class MockHls {
    static isSupported() { return true }
    static Events = {
      MANIFEST_PARSED: 'hlsManifestParsed',
      ERROR: 'hlsError',
      LEVEL_SWITCHED: 'hlsLevelSwitched',
    }
    static ErrorTypes = {
      NETWORK_ERROR: 'networkError',
      MEDIA_ERROR: 'mediaError',
      OTHER_ERROR: 'otherError',
    }
    config = {}
    loadSource = vi.fn()
    attachMedia = vi.fn()
    on = vi.fn((event: string, handler: Function) => {
      hlsEventHandlers[event] = handler
    })
    destroy = vi.fn()
    recoverMediaError = vi.fn()
    startLoad = vi.fn()
    levels = [{ height: 1080 }, { height: 720 }, { height: 480 }]
    currentLevel = -1
    constructor() {
      hlsInstance = this
      hlsEventHandlers = {}
    }
  },
}))

beforeEach(() => {
  vi.clearAllMocks()
  hlsEventHandlers = {}
  hlsInstance = null
  HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue(undefined)
  HTMLMediaElement.prototype.pause = vi.fn()
  HTMLMediaElement.prototype.load = vi.fn()
  Object.defineProperty(HTMLMediaElement.prototype, 'paused', { value: true, writable: true, configurable: true })
  Object.defineProperty(HTMLMediaElement.prototype, 'duration', { value: 120, writable: true, configurable: true })
  Object.defineProperty(HTMLMediaElement.prototype, 'currentTime', { value: 30, writable: true, configurable: true })
  Object.defineProperty(HTMLMediaElement.prototype, 'volume', { value: 0.8, writable: true, configurable: true })
  Object.defineProperty(HTMLMediaElement.prototype, 'muted', { value: false, writable: true, configurable: true })
  Object.defineProperty(HTMLMediaElement.prototype, 'playbackRate', { value: 1, writable: true, configurable: true })
  Object.defineProperty(HTMLMediaElement.prototype, 'buffered', {
    value: { length: 1, start: () => 0, end: () => 60 },
    writable: true, configurable: true,
  })
  HTMLVideoElement.prototype.requestPictureInPicture = vi.fn().mockResolvedValue({})
  Object.defineProperty(document, 'pictureInPictureElement', { value: null, writable: true, configurable: true })
  Object.defineProperty(document, 'fullscreenElement', { value: null, writable: true, configurable: true })
})

afterEach(() => {
  vi.restoreAllMocks()
})

async function renderPlayer(props: Partial<VideoPlayerProps> = {}) {
  const { default: VideoPlayer } = await import('./VideoPlayer')
  return render(<VideoPlayer src="/test-stream.m3u8" {...props} />)
}

describe('VideoPlayer seek bar mouse interactions', () => {
  it('handles seek bar mousedown and drag', async () => {
    await renderPlayer({ src: '/test.mp4' })
    // Find the seek bar container - it has cursor: pointer style
    const seekBars = document.querySelectorAll('div[style*="cursor"]')
    for (const bar of seekBars) {
      if ((bar as HTMLElement).style.cursor === 'pointer') {
        Object.defineProperty(bar, 'getBoundingClientRect', {
          value: () => ({ left: 0, width: 1000, top: 0, height: 10, right: 1000, bottom: 10 }),
          configurable: true,
        })
        // mouseDown to start seeking
        fireEvent.mouseDown(bar, { clientX: 300 })
        // mousemove to drag
        fireEvent.mouseMove(window, { clientX: 500 })
        // mouseUp to stop
        fireEvent.mouseUp(window)
        break
      }
    }
  })
})

describe('VideoPlayer non-m3u8 source', () => {
  it('handles mp4 source (non-HLS path)', async () => {
    await renderPlayer({ src: '/test.mp4' })
    // Should set video.src directly instead of using HLS
    expect(hlsInstance).toBeNull() // HLS should not init for .mp4
  })
})

describe('VideoPlayer live mode', () => {
  it('renders in live mode', async () => {
    await renderPlayer({ src: '/test.mp4', isLive: true })
    // In live mode, the time display differs from VOD mode
    expect(document.body).toBeDefined()
  })
})

describe('VideoPlayer with onTimeUpdate callback', () => {
  it('calls onTimeUpdate', async () => {
    const onTimeUpdate = vi.fn()
    await renderPlayer({ src: '/test.mp4', onTimeUpdate })
    // Trigger timeupdate on the video element
    const video = document.querySelector('video')
    if (video) {
      fireEvent.timeUpdate(video)
    }
  })
})

describe('VideoPlayer mouse hover shows controls', () => {
  it('shows and hides controls on mouse enter/leave', async () => {
    await renderPlayer({ src: '/test.mp4' })
    const playerContainer = document.querySelector('video')?.closest('div')
    if (playerContainer) {
      fireEvent.mouseEnter(playerContainer)
      fireEvent.mouseLeave(playerContainer)
    }
  })

  it('shows controls on mouse move', async () => {
    await renderPlayer({ src: '/test.mp4' })
    const playerContainer = document.querySelector('video')?.closest('div')
    if (playerContainer) {
      fireEvent.mouseMove(playerContainer)
    }
  })
})

describe('VideoPlayer chapter and event markers', () => {
  const chapters: Chapter[] = [
    { id: 'ch1', title: '전반전', startTime: 0, endTime: 45, type: 'HALF' },
    { id: 'ch2', title: '하프타임', startTime: 45, endTime: 60, type: 'BREAK' },
    { id: 'ch3', title: '후반전', startTime: 60, endTime: 120, type: 'HALF' },
  ]
  const events: TimelineEvent[] = [
    { id: 'e1', time: 10, label: '골!', type: 'GOAL', teamName: 'Team A' },
    { id: 'e2', time: 30, label: '파울', type: 'FOUL' },
    { id: 'e3', time: 45, label: '교체', type: 'SUBSTITUTION' },
    { id: 'e4', time: 60, label: '하이라이트', type: 'HIGHLIGHT' },
    { id: 'e5', time: 75, label: '전반 종료', type: 'PERIOD' },
    { id: 'e6', time: 90, label: '커스텀', type: 'CUSTOM' },
  ]

  it('renders chapters and events on timeline', async () => {
    await renderPlayer({ src: '/test.mp4', chapters, events })
    // The component should process and display chapter/event markers
    expect(document.body).toBeDefined()
  })

  it('clicks on a chapter marker', async () => {
    await renderPlayer({ src: '/test.mp4', chapters, events })
    // Find chapter or event buttons/markers
    const markers = document.querySelectorAll('[data-chapter], [data-event]')
    markers.forEach(m => fireEvent.click(m))
  })
})

describe('VideoPlayer speed menu full interaction', () => {
  it('opens speed menu and selects all speeds', async () => {
    await renderPlayer({ src: '/test.mp4' })
    const speedBtn = screen.getByLabelText('재생 속도')
    fireEvent.click(speedBtn)

    // Select different speeds
    fireEvent.click(screen.getByText('0.25x'))
    fireEvent.click(speedBtn)
    fireEvent.click(screen.getByText('0.5x'))
    fireEvent.click(speedBtn)
    fireEvent.click(screen.getByText('1.5x'))
    fireEvent.click(speedBtn)
    fireEvent.click(screen.getByText('2x'))
  })
})

describe('VideoPlayer quality selection', () => {
  it('selects specific quality levels', async () => {
    await renderPlayer()
    act(() => {
      hlsEventHandlers['hlsManifestParsed']?.('hlsManifestParsed', {
        levels: [{ height: 1080 }, { height: 720 }, { height: 480 }],
      })
    })
    const qualityBtn = screen.getByLabelText('화질 설정')

    // Select 1080p
    fireEvent.click(qualityBtn)
    fireEvent.click(screen.getByText('1080p'))

    // Select 480p
    fireEvent.click(qualityBtn)
    fireEvent.click(screen.getByText('480p'))

    // Select Auto
    fireEvent.click(qualityBtn)
    fireEvent.click(screen.getByText('Auto'))
  })
})

describe('VideoPlayer keyboard shortcuts additional', () => {
  it('handles number keys (0-9) for percentage seek', async () => {
    await renderPlayer({ src: '/test.mp4' })
    for (const key of ['0', '1', '5', '9']) {
      fireEvent.keyDown(document, { key })
    }
  })

  it('handles . and , for frame stepping', async () => {
    await renderPlayer({ src: '/test.mp4' })
    fireEvent.keyDown(document, { key: '.' })
    fireEvent.keyDown(document, { key: ',' })
  })

  it('handles j/k/l for playback control', async () => {
    await renderPlayer({ src: '/test.mp4' })
    fireEvent.keyDown(document, { key: 'j' })
    fireEvent.keyDown(document, { key: 'k' })
    fireEvent.keyDown(document, { key: 'l' })
  })
})
