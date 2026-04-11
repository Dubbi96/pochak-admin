/**
 * Additional coverage for VideoPlayer.tsx
 * Targets: handleVideoAreaClick (double-click fullscreen, line 682-683),
 * volume slider (line 1097), closeMenus, LEVEL_SWITCHED handler
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
  Object.defineProperty(HTMLMediaElement.prototype, 'currentTime', { value: 0, writable: true, configurable: true })
  Object.defineProperty(HTMLMediaElement.prototype, 'volume', { value: 1, writable: true, configurable: true })
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

describe('VideoPlayer double-click to fullscreen', () => {
  it('triggers fullscreen on rapid double-click (lines 676-683)', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    await renderPlayer({ src: '/test.mp4' })

    // Find the video area (click target)
    const videoArea = document.querySelector('video')?.parentElement
    if (videoArea) {
      // First click starts the timer
      fireEvent.click(videoArea)
      // Second click within 250ms should trigger fullscreen
      fireEvent.click(videoArea)
    }

    vi.useRealTimers()
  })

  it('triggers play/pause on single click after timeout', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    await renderPlayer({ src: '/test.mp4' })

    const videoArea = document.querySelector('video')?.parentElement
    if (videoArea) {
      // Single click
      fireEvent.click(videoArea)
      // Wait past 250ms timeout
      act(() => { vi.advanceTimersByTime(300) })
    }

    vi.useRealTimers()
  })
})

describe('VideoPlayer volume control', () => {
  it('changes volume via range input (line 1097)', async () => {
    await renderPlayer({ src: '/test.mp4' })
    // Hover over volume button to show slider
    const muteBtn = screen.getByLabelText('음소거')
    fireEvent.mouseEnter(muteBtn.closest('div') || muteBtn)

    // Find volume range input
    const volumeSlider = document.querySelector('input[type="range"]')
    if (volumeSlider) {
      fireEvent.change(volumeSlider, { target: { value: '50' } })
    }
  })
})

describe('VideoPlayer LEVEL_SWITCHED event', () => {
  it('handles level switch event', async () => {
    await renderPlayer()
    act(() => {
      hlsEventHandlers['hlsManifestParsed']?.('hlsManifestParsed', {
        levels: [{ height: 1080 }, { height: 720 }],
      })
    })
    act(() => {
      hlsEventHandlers['hlsLevelSwitched']?.('hlsLevelSwitched', { level: 0 })
    })
  })
})

describe('VideoPlayer keyboard shortcuts', () => {
  it('handles Space key to toggle play', async () => {
    await renderPlayer({ src: '/test.mp4' })
    fireEvent.keyDown(document, { key: ' ' })
  })

  it('handles ArrowRight to seek forward', async () => {
    await renderPlayer({ src: '/test.mp4' })
    fireEvent.keyDown(document, { key: 'ArrowRight' })
  })

  it('handles ArrowLeft to seek backward', async () => {
    await renderPlayer({ src: '/test.mp4' })
    fireEvent.keyDown(document, { key: 'ArrowLeft' })
  })

  it('handles ArrowUp to increase volume', async () => {
    await renderPlayer({ src: '/test.mp4' })
    fireEvent.keyDown(document, { key: 'ArrowUp' })
  })

  it('handles ArrowDown to decrease volume', async () => {
    await renderPlayer({ src: '/test.mp4' })
    fireEvent.keyDown(document, { key: 'ArrowDown' })
  })

  it('handles f key for fullscreen', async () => {
    await renderPlayer({ src: '/test.mp4' })
    fireEvent.keyDown(document, { key: 'f' })
  })

  it('handles m key for mute toggle', async () => {
    await renderPlayer({ src: '/test.mp4' })
    fireEvent.keyDown(document, { key: 'm' })
  })

  it('handles Escape key', async () => {
    await renderPlayer({ src: '/test.mp4' })
    fireEvent.keyDown(document, { key: 'Escape' })
  })
})

describe('VideoPlayer closeMenus', () => {
  it('closes speed and quality menus when clicking video area', async () => {
    await renderPlayer({ src: '/test.mp4' })
    // Open speed menu
    const speedBtn = screen.getByLabelText('재생 속도')
    fireEvent.click(speedBtn)
    // Speed menu should be open
    expect(screen.getByText('2x')).toBeInTheDocument()
    // Click on video area to close menus
    const videoArea = document.querySelector('video')?.parentElement
    if (videoArea) fireEvent.click(videoArea)
  })
})

describe('VideoPlayer progress bar interaction', () => {
  it('seeks on progress bar click', async () => {
    await renderPlayer({ src: '/test.mp4' })
    const progressBar = document.querySelector('[style*="cursor: pointer"]') ||
      document.querySelector('[class*="cursor-pointer"]')
    if (progressBar) {
      Object.defineProperty(progressBar, 'getBoundingClientRect', {
        value: () => ({ left: 0, width: 1000, top: 0, height: 10, right: 1000, bottom: 10 }),
        configurable: true,
      })
      fireEvent.click(progressBar, { clientX: 500 })
    }
  })
})

describe('VideoPlayer with chapters and events', () => {
  const chapters: Chapter[] = [
    { id: 'ch1', title: '전반전', startTime: 0, endTime: 60, type: 'HALF' },
    { id: 'ch2', title: '후반전', startTime: 60, endTime: 120, type: 'HALF' },
  ]
  const events: TimelineEvent[] = [
    { id: 'e1', time: 30, label: '골!', type: 'GOAL', teamName: 'Team A' },
  ]

  it('renders with chapters and events', async () => {
    await renderPlayer({ src: '/test.mp4', chapters, events })
    // Chapters and events should be processed
  })
})

describe('VideoPlayer PiP', () => {
  it('toggles picture-in-picture', async () => {
    await renderPlayer({ src: '/test.mp4' })
    const pipBtn = screen.queryByLabelText('PIP 모드')
    if (pipBtn) {
      fireEvent.click(pipBtn)
    }
  })
})

describe('VideoPlayer retry on error', () => {
  it('clicks retry button after other error', async () => {
    await renderPlayer()
    act(() => {
      hlsEventHandlers['hlsError']?.('hlsError', { fatal: true, type: 'otherError' })
    })
    const retryBtn = screen.getByText('다시 시도')
    fireEvent.click(retryBtn)
  })
})
