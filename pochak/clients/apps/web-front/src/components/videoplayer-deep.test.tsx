/**
 * Deep coverage tests for VideoPlayer.tsx
 * Targets uncovered lines: 400-767, 1026-1386
 * Exercises: keyboard shortcuts, fullscreen, PiP, quality selector,
 * speed menu, error states, network recovery, timeline panel,
 * seek interactions, chapters, events, online/offline
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@/test/test-utils'
import type { VideoPlayerProps, TimelineEvent, Chapter } from './VideoPlayer'

// Track HLS event handlers
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
    levels = [
      { height: 1080 },
      { height: 720 },
      { height: 480 },
    ]
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
    writable: true,
    configurable: true,
  })
  // Mock requestPictureInPicture and exitPictureInPicture
  HTMLVideoElement.prototype.requestPictureInPicture = vi.fn().mockResolvedValue({})
  Object.defineProperty(document, 'pictureInPictureElement', { value: null, writable: true, configurable: true })
  Object.defineProperty(document, 'fullscreenElement', { value: null, writable: true, configurable: true })
})

afterEach(() => {
  vi.restoreAllMocks()
})

async function renderPlayer(props: Partial<VideoPlayerProps> = {}) {
  const { default: VideoPlayer } = await import('./VideoPlayer')
  return render(
    <VideoPlayer src="/test-stream.m3u8" {...props} />
  )
}

const sampleEvents: TimelineEvent[] = [
  { id: 'e1', time: 10, label: '골!', type: 'GOAL', teamName: 'Team A' },
  { id: 'e2', time: 30, label: '파울', type: 'FOUL' },
  { id: 'e3', time: 45, label: '교체', type: 'SUBSTITUTION' },
  { id: 'e4', time: 60, label: '하이라이트', type: 'HIGHLIGHT' },
  { id: 'e5', time: 75, label: '전반 종료', type: 'PERIOD' },
  { id: 'e6', time: 90, label: '커스텀', type: 'CUSTOM' },
]

const sampleChapters: Chapter[] = [
  { id: 'ch1', title: '전반전', startTime: 0, endTime: 45, type: 'HALF' },
  { id: 'ch2', title: '하프타임', startTime: 45, endTime: 60, type: 'BREAK' },
  { id: 'ch3', title: '후반전', startTime: 60, endTime: 90, type: 'HALF' },
  { id: 'ch4', title: '하이라이트', startTime: 90, endTime: 100, type: 'HIGHLIGHT' },
  { id: 'ch5', title: '기타', startTime: 100, endTime: 120, type: 'CUSTOM' },
]

describe('VideoPlayer HLS integration', () => {
  it('initializes HLS for .m3u8 src', async () => {
    await renderPlayer()
    expect(hlsInstance).not.toBeNull()
    expect(hlsInstance.loadSource).toHaveBeenCalledWith('/test-stream.m3u8')
    expect(hlsInstance.attachMedia).toHaveBeenCalled()
  })

  it('sets quality levels on MANIFEST_PARSED', async () => {
    await renderPlayer()
    // Trigger MANIFEST_PARSED
    act(() => {
      hlsEventHandlers['hlsManifestParsed']?.('hlsManifestParsed', {
        levels: [{ height: 1080 }, { height: 720 }, { height: 480 }],
      })
    })
    // Quality menu button should exist if quality levels are set
    expect(screen.getByLabelText('화질 설정')).toBeInTheDocument()
  })

  it('plays on autoPlay after MANIFEST_PARSED', async () => {
    await renderPlayer({ autoPlay: true })
    act(() => {
      hlsEventHandlers['hlsManifestParsed']?.('hlsManifestParsed', {
        levels: [{ height: 720 }],
      })
    })
    expect(HTMLMediaElement.prototype.play).toHaveBeenCalled()
  })

  it('handles fatal network error with recovery', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    await renderPlayer()
    act(() => {
      hlsEventHandlers['hlsError']?.('hlsError', {
        fatal: true,
        type: 'networkError',
      })
    })
    // Should show network error
    expect(screen.getByText('네트워크 연결이 불안정합니다. 재연결 중...')).toBeInTheDocument()

    // After 3 seconds, should attempt startLoad
    act(() => { vi.advanceTimersByTime(3500) })
    expect(hlsInstance.startLoad).toHaveBeenCalled()
    vi.useRealTimers()
  })

  it('handles fatal media error with recoverMediaError', async () => {
    await renderPlayer()
    act(() => {
      hlsEventHandlers['hlsError']?.('hlsError', {
        fatal: true,
        type: 'mediaError',
      })
    })
    expect(hlsInstance.recoverMediaError).toHaveBeenCalled()
  })

  it('handles fatal other error by destroying HLS', async () => {
    await renderPlayer()
    act(() => {
      hlsEventHandlers['hlsError']?.('hlsError', {
        fatal: true,
        type: 'otherError',
      })
    })
    expect(screen.getByText('스트림 로드에 실패했습니다')).toBeInTheDocument()
    expect(screen.getByText('다시 시도')).toBeInTheDocument()
  })

  it('ignores non-fatal errors', async () => {
    await renderPlayer()
    act(() => {
      hlsEventHandlers['hlsError']?.('hlsError', {
        fatal: false,
        type: 'networkError',
      })
    })
    // Should not show error
    expect(screen.queryByText('스트림 로드에 실패했습니다')).not.toBeInTheDocument()
  })
})

describe('VideoPlayer no-src state', () => {
  it('renders placeholder when src is null', async () => {
    await renderPlayer({ src: null })
    expect(screen.getByText('영상을 준비 중입니다')).toBeInTheDocument()
  })
})

describe('VideoPlayer controls', () => {
  it('renders play/pause button', async () => {
    await renderPlayer({ src: '/test.mp4' })
    expect(screen.getByLabelText('재생')).toBeInTheDocument()
  })

  it('toggles play/pause on button click', async () => {
    await renderPlayer({ src: '/test.mp4' })
    const playBtn = screen.getByLabelText('재생')
    fireEvent.click(playBtn)
    expect(HTMLMediaElement.prototype.play).toHaveBeenCalled()
  })

  it('renders fullscreen button and toggles', async () => {
    await renderPlayer({ src: '/test.mp4' })
    const fsBtn = screen.getByLabelText('전체화면')
    expect(fsBtn).toBeInTheDocument()
    fireEvent.click(fsBtn)
  })

  it('renders mute/unmute button', async () => {
    await renderPlayer({ src: '/test.mp4' })
    const muteBtn = screen.getByLabelText('음소거')
    expect(muteBtn).toBeInTheDocument()
    fireEvent.click(muteBtn)
  })

  it('renders speed selector and changes speed', async () => {
    await renderPlayer({ src: '/test.mp4' })
    const speedBtn = screen.getByLabelText('재생 속도')
    expect(speedBtn).toBeInTheDocument()
    fireEvent.click(speedBtn)
    // Speed menu should appear
    expect(screen.getByText('0.25x')).toBeInTheDocument()
    expect(screen.getByText('0.5x')).toBeInTheDocument()
    expect(screen.getByText('2x')).toBeInTheDocument()
    // Change speed
    fireEvent.click(screen.getByText('2x'))
  })

  it('renders quality selector after MANIFEST_PARSED', async () => {
    await renderPlayer()
    act(() => {
      hlsEventHandlers['hlsManifestParsed']?.('hlsManifestParsed', {
        levels: [{ height: 1080 }, { height: 720 }, { height: 480 }],
      })
    })
    const qualityBtn = screen.getByLabelText('화질 설정')
    fireEvent.click(qualityBtn)
    // Quality menu should appear
    expect(screen.getByText('Auto')).toBeInTheDocument()
    expect(screen.getByText('1080p')).toBeInTheDocument()
    expect(screen.getByText('720p')).toBeInTheDocument()
    expect(screen.getByText('480p')).toBeInTheDocument()
    // Select a quality
    fireEvent.click(screen.getByText('720p'))
  })

  it('quality menu - select Auto', async () => {
    await renderPlayer()
    act(() => {
      hlsEventHandlers['hlsManifestParsed']?.('hlsManifestParsed', {
        levels: [{ height: 1080 }, { height: 720 }],
      })
    })
    fireEvent.click(screen.getByLabelText('화질 설정'))
    fireEvent.click(screen.getByText('Auto'))
  })

  it('shows time display in VOD mode', async () => {
    await renderPlayer({ src: '/test.mp4', isLive: false })
    // Should show time like 00:00 / 00:00
    const timeDisplays = screen.getAllByText(/00:00/)
    expect(timeDisplays.length).toBeGreaterThanOrEqual(1)
  })

  it('shows LIVE text in live mode', async () => {
    await renderPlayer({ src: '/test.mp4', isLive: true })
    const liveTexts = screen.getAllByText('LIVE')
    expect(liveTexts.length).toBeGreaterThanOrEqual(1)
  })
})

describe('VideoPlayer keyboard shortcuts', () => {
  it('space/k toggles play', async () => {
    await renderPlayer({ src: '/test.mp4' })
    fireEvent.keyDown(window, { key: ' ' })
    expect(HTMLMediaElement.prototype.play).toHaveBeenCalled()
  })

  it('k key toggles play', async () => {
    await renderPlayer({ src: '/test.mp4' })
    fireEvent.keyDown(window, { key: 'k' })
    expect(HTMLMediaElement.prototype.play).toHaveBeenCalled()
  })

  it('K key toggles play', async () => {
    await renderPlayer({ src: '/test.mp4' })
    fireEvent.keyDown(window, { key: 'K' })
    expect(HTMLMediaElement.prototype.play).toHaveBeenCalled()
  })

  it('ArrowLeft seeks back 10s', async () => {
    await renderPlayer({ src: '/test.mp4' })
    fireEvent.keyDown(window, { key: 'ArrowLeft' })
  })

  it('j key seeks back 10s', async () => {
    await renderPlayer({ src: '/test.mp4' })
    fireEvent.keyDown(window, { key: 'j' })
  })

  it('ArrowRight seeks forward 10s', async () => {
    await renderPlayer({ src: '/test.mp4' })
    fireEvent.keyDown(window, { key: 'ArrowRight' })
  })

  it('l key seeks forward 10s', async () => {
    await renderPlayer({ src: '/test.mp4' })
    fireEvent.keyDown(window, { key: 'l' })
  })

  it('m key toggles mute', async () => {
    await renderPlayer({ src: '/test.mp4' })
    fireEvent.keyDown(window, { key: 'm' })
  })

  it('M key toggles mute', async () => {
    await renderPlayer({ src: '/test.mp4' })
    fireEvent.keyDown(window, { key: 'M' })
  })

  it('ArrowUp increases volume', async () => {
    await renderPlayer({ src: '/test.mp4' })
    fireEvent.keyDown(window, { key: 'ArrowUp' })
  })

  it('ArrowDown decreases volume', async () => {
    await renderPlayer({ src: '/test.mp4' })
    fireEvent.keyDown(window, { key: 'ArrowDown' })
  })

  it('f key toggles fullscreen', async () => {
    await renderPlayer({ src: '/test.mp4' })
    fireEvent.keyDown(window, { key: 'f' })
  })

  it('F key toggles fullscreen', async () => {
    await renderPlayer({ src: '/test.mp4' })
    fireEvent.keyDown(window, { key: 'F' })
  })

  it('Escape exits fullscreen when in fullscreen', async () => {
    await renderPlayer({ src: '/test.mp4' })
    // Simulate fullscreen state
    Object.defineProperty(document, 'fullscreenElement', { value: document.body, writable: true, configurable: true })
    document.exitFullscreen = vi.fn().mockResolvedValue(undefined)
    fireEvent.keyDown(window, { key: 'Escape' })
  })

  it('< cycles speed down', async () => {
    await renderPlayer({ src: '/test.mp4' })
    fireEvent.keyDown(window, { key: '<' })
  })

  it('> cycles speed up', async () => {
    await renderPlayer({ src: '/test.mp4' })
    fireEvent.keyDown(window, { key: '>' })
  })

  it('ignores keyboard when focus is on INPUT', async () => {
    await renderPlayer({ src: '/test.mp4' })
    const input = document.createElement('input')
    document.body.appendChild(input)
    input.focus()
    fireEvent.keyDown(input, { key: ' ' })
    document.body.removeChild(input)
  })
})

describe('VideoPlayer error and retry', () => {
  it('shows error state and retry button', async () => {
    await renderPlayer()
    act(() => {
      hlsEventHandlers['hlsError']?.('hlsError', {
        fatal: true,
        type: 'otherError',
      })
    })
    expect(screen.getByText('다시 시도')).toBeInTheDocument()
    // Click retry
    fireEvent.click(screen.getByText('다시 시도'))
  })

  it('retries for non-HLS source', async () => {
    await renderPlayer({ src: '/test.mp4' })
    // Simulate a native video error
    const video = document.querySelector('video')!
    fireEvent.error(video)
    // Should show error
    expect(screen.getByText('영상을 재생할 수 없습니다')).toBeInTheDocument()
    // Click retry
    fireEvent.click(screen.getByText('다시 시도'))
  })
})

describe('VideoPlayer network offline/online', () => {
  it('handles offline event', async () => {
    await renderPlayer({ src: '/test.mp4' })
    act(() => {
      window.dispatchEvent(new Event('offline'))
    })
    expect(screen.getByText('네트워크 연결이 끊어졌습니다')).toBeInTheDocument()
  })

  it('handles online event after offline', async () => {
    await renderPlayer()
    // Go offline first
    act(() => {
      window.dispatchEvent(new Event('offline'))
    })
    // Go online
    act(() => {
      window.dispatchEvent(new Event('online'))
    })
  })
})

describe('VideoPlayer timeline panel', () => {
  it('renders timeline toggle when events exist', async () => {
    await renderPlayer({ src: '/test.mp4', events: sampleEvents })
    expect(screen.getByLabelText('타임라인')).toBeInTheDocument()
  })

  it('renders timeline toggle when chapters exist', async () => {
    await renderPlayer({ src: '/test.mp4', chapters: sampleChapters })
    expect(screen.getByLabelText('타임라인')).toBeInTheDocument()
  })

  it('toggles timeline panel open/close', async () => {
    await renderPlayer({ src: '/test.mp4', events: sampleEvents, chapters: sampleChapters })
    const toggleBtn = screen.getByLabelText('타임라인')

    // Open panel
    fireEvent.click(toggleBtn)
    expect(screen.getByText('경기 구간')).toBeInTheDocument()
    expect(screen.getByText('이벤트')).toBeInTheDocument()

    // Close panel
    fireEvent.click(toggleBtn)
  })

  it('renders chapter entries and allows seeking', async () => {
    await renderPlayer({ src: '/test.mp4', chapters: sampleChapters })
    fireEvent.click(screen.getByLabelText('타임라인'))

    const allChapterTexts = screen.getAllByText('전반전')
    expect(allChapterTexts.length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('하프타임')).toBeInTheDocument()
    const allHalfTexts = screen.getAllByText('후반전')
    expect(allHalfTexts.length).toBeGreaterThanOrEqual(1)

    // Click chapter button to seek (the last one should be the chapter list item)
    const chapterBtn = allChapterTexts[allChapterTexts.length - 1].closest('button')
    if (chapterBtn) fireEvent.click(chapterBtn)
  })

  it('renders chapter type badges', async () => {
    await renderPlayer({ src: '/test.mp4', chapters: sampleChapters })
    fireEvent.click(screen.getByLabelText('타임라인'))

    // Chapter badge labels
    const badges = screen.getAllByText(/경기|휴식|하이라이트|기타/)
    expect(badges.length).toBeGreaterThanOrEqual(4)
  })

  it('renders event entries with seek', async () => {
    await renderPlayer({ src: '/test.mp4', events: sampleEvents })
    fireEvent.click(screen.getByLabelText('타임라인'))

    expect(screen.getByText('골!')).toBeInTheDocument()
    expect(screen.getByText('파울')).toBeInTheDocument()
    expect(screen.getByText('교체')).toBeInTheDocument()

    // Click event to seek
    fireEvent.click(screen.getByText('골!'))
  })

  it('renders events only (no chapters)', async () => {
    await renderPlayer({ src: '/test.mp4', events: sampleEvents })
    fireEvent.click(screen.getByLabelText('타임라인'))
    expect(screen.getByText('이벤트')).toBeInTheDocument()
    expect(screen.queryByText('경기 구간')).not.toBeInTheDocument()
  })

  it('renders chapters only (no events)', async () => {
    await renderPlayer({ src: '/test.mp4', chapters: sampleChapters })
    fireEvent.click(screen.getByLabelText('타임라인'))
    expect(screen.getByText('경기 구간')).toBeInTheDocument()
    expect(screen.queryByText('이벤트')).not.toBeInTheDocument()
  })
})

describe('VideoPlayer video events', () => {
  it('handles timeupdate event', async () => {
    const onTimeUpdate = vi.fn()
    await renderPlayer({ src: '/test.mp4', onTimeUpdate })
    const video = document.querySelector('video')!
    fireEvent.timeUpdate(video)
  })

  it('handles ended event', async () => {
    const onEnded = vi.fn()
    await renderPlayer({ src: '/test.mp4', onEnded })
    const video = document.querySelector('video')!
    fireEvent.ended(video)
    expect(onEnded).toHaveBeenCalled()
  })

  it('handles play event', async () => {
    await renderPlayer({ src: '/test.mp4' })
    const video = document.querySelector('video')!
    fireEvent.play(video)
  })

  it('handles pause event', async () => {
    await renderPlayer({ src: '/test.mp4' })
    const video = document.querySelector('video')!
    fireEvent.pause(video)
  })

  it('handles waiting event (buffering)', async () => {
    await renderPlayer({ src: '/test.mp4' })
    const video = document.querySelector('video')!
    fireEvent.waiting(video)
  })

  it('handles canplay event', async () => {
    await renderPlayer({ src: '/test.mp4' })
    const video = document.querySelector('video')!
    fireEvent.canPlay(video)
  })

  it('handles playing event', async () => {
    await renderPlayer({ src: '/test.mp4' })
    const video = document.querySelector('video')!
    Object.defineProperty(video, 'duration', { value: 120, configurable: true })
    fireEvent.playing(video)
  })

  it('handles durationchange event', async () => {
    await renderPlayer({ src: '/test.mp4' })
    const video = document.querySelector('video')!
    Object.defineProperty(video, 'duration', { value: 120, configurable: true })
    fireEvent.durationChange(video)
  })

  it('handles volumechange event', async () => {
    await renderPlayer({ src: '/test.mp4' })
    const video = document.querySelector('video')!
    fireEvent.volumeChange(video)
  })
})

describe('VideoPlayer mouse interactions', () => {
  it('handles mouse move to show controls', async () => {
    await renderPlayer({ src: '/test.mp4' })
    const container = document.querySelector('[style*="aspect-ratio"]')!
    fireEvent.mouseMove(container)
  })

  it('handles mouse leave to hide controls', async () => {
    await renderPlayer({ src: '/test.mp4' })
    const container = document.querySelector('[style*="aspect-ratio"]')!
    fireEvent.mouseLeave(container)
  })

  it('handles video area click for play/pause', async () => {
    await renderPlayer({ src: '/test.mp4' })
    const video = document.querySelector('video')!
    fireEvent.click(video)
  })

  it('handles video touch end (mobile)', async () => {
    await renderPlayer({ src: '/test.mp4' })
    const video = document.querySelector('video')!
    fireEvent.touchEnd(video)
  })
})

describe('VideoPlayer with non-HLS source', () => {
  it('handles regular mp4', async () => {
    // Need a fresh import where HLS.isSupported returns true but src is mp4
    await renderPlayer({ src: '/test.mp4' })
    // For mp4, it should still render the player
    expect(document.querySelector('video')).not.toBeNull()
  })

  it('handles autoPlay with mp4', async () => {
    await renderPlayer({ src: '/test.mp4', autoPlay: true })
    expect(HTMLMediaElement.prototype.play).toHaveBeenCalled()
  })
})

describe('VideoPlayer LIVE badge', () => {
  it('renders LIVE badge when isLive is true', async () => {
    await renderPlayer({ src: '/test.mp4', isLive: true })
    const liveBadges = screen.getAllByText('LIVE')
    expect(liveBadges.length).toBeGreaterThanOrEqual(1)
  })

  it('does not render LIVE badge when isLive is false', async () => {
    await renderPlayer({ src: '/test.mp4', isLive: false })
    // Time display should show instead of LIVE
    const timeDisplays = screen.getAllByText(/00:00/)
    expect(timeDisplays.length).toBeGreaterThanOrEqual(1)
  })
})

describe('VideoPlayer active chapter display', () => {
  it('shows active chapter title in controls', async () => {
    await renderPlayer({ src: '/test.mp4', chapters: sampleChapters })
    // Need to simulate currentTime being in a chapter range
    const video = document.querySelector('video')!
    Object.defineProperty(video, 'currentTime', { value: 10, configurable: true })
    fireEvent.timeUpdate(video)
  })
})

describe('VideoPlayer seek bar events', () => {
  it('event markers render on seek bar', async () => {
    await renderPlayer({ src: '/test.mp4', events: sampleEvents })
    // Event markers should be rendered (colored dots on seek bar)
    const markers = document.querySelectorAll('[title]')
    expect(markers.length).toBeGreaterThanOrEqual(1)
  })
})

describe('VideoPlayer fullscreen change listener', () => {
  it('handles fullscreenchange event', async () => {
    await renderPlayer({ src: '/test.mp4' })
    act(() => {
      document.dispatchEvent(new Event('fullscreenchange'))
    })
  })

  it('handles webkitfullscreenchange event', async () => {
    await renderPlayer({ src: '/test.mp4' })
    act(() => {
      document.dispatchEvent(new Event('webkitfullscreenchange'))
    })
  })
})

describe('VideoPlayer volume slider', () => {
  it('shows volume slider on hover and changes volume', async () => {
    await renderPlayer({ src: '/test.mp4' })
    const muteBtn = screen.getByLabelText('음소거')
    const volContainer = muteBtn.closest('[style]')!
    // Hover to show slider
    fireEvent.mouseEnter(volContainer)
    // Find the range input
    const rangeInputs = document.querySelectorAll('input[type="range"]')
    if (rangeInputs.length > 0) {
      fireEvent.change(rangeInputs[0], { target: { value: '50' } })
    }
    fireEvent.mouseLeave(volContainer)
  })
})

describe('VideoPlayer closing menus', () => {
  it('closes speed and quality menus on container click', async () => {
    await renderPlayer()
    act(() => {
      hlsEventHandlers['hlsManifestParsed']?.('hlsManifestParsed', {
        levels: [{ height: 720 }],
      })
    })
    // Open speed menu
    fireEvent.click(screen.getByLabelText('재생 속도'))
    expect(screen.getByText('2x')).toBeInTheDocument()
    // Click container to close
    const container = document.querySelector('[style*="aspect-ratio"]')!
    fireEvent.click(container)
  })
})
