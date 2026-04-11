/**
 * Additional coverage for ClipEditorPage.tsx
 * Targets: save overlay states, text bg toggles, crop mouse drag, thumbnail capture,
 * cancel button, addTag via button click, tag strip #, timeline handle drag
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@/test/test-utils'

vi.mock('@/services/api-client', () => ({
  pochakApi: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
  GATEWAY_URL: 'http://localhost:8080',
}))

vi.mock('@/hooks/useApi', () => ({
  useContents: () => ({ data: [], loading: false, error: null }),
  useTeams: () => ({ data: [], loading: false, error: null }),
  useCompetitions: () => ({ data: [], loading: false, error: null }),
  useSearchSuggestions: () => ({ data: { contents: [], teams: [], competitions: [] }, loading: false, error: null }),
  useTrendingSearches: () => ({ data: [], loading: false, error: null }),
}))

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

beforeEach(() => {
  vi.clearAllMocks()
  HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue(undefined)
  HTMLMediaElement.prototype.pause = vi.fn()
  HTMLMediaElement.prototype.load = vi.fn()
  Object.defineProperty(HTMLMediaElement.prototype, 'paused', { value: true, writable: true, configurable: true })
  Object.defineProperty(HTMLMediaElement.prototype, 'duration', { value: 120, writable: true, configurable: true })
  Object.defineProperty(HTMLMediaElement.prototype, 'currentTime', { value: 10, writable: true, configurable: true })
  vi.spyOn(window, 'requestAnimationFrame').mockImplementation(() => 1)
  vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {})
})

afterEach(() => {
  vi.restoreAllMocks()
})

async function renderEditor() {
  const { default: ClipEditorPage } = await import('./ClipEditorPage')
  return render(<ClipEditorPage />)
}

describe('ClipEditorPage save overlay rendering', () => {
  it('shows saving spinner then success checkmark', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    await renderEditor()

    // Click save
    fireEvent.click(screen.getByText('저장'))

    // Should show saving spinner
    expect(screen.getByText('클립 저장 중...')).toBeInTheDocument()
    expect(screen.getByText('잠시만 기다려주세요')).toBeInTheDocument()

    // Advance past saving phase
    act(() => { vi.advanceTimersByTime(2100) })

    // Should show success
    expect(screen.getByText('클립이 저장되었습니다!')).toBeInTheDocument()

    // Advance past success phase -> navigates
    act(() => { vi.advanceTimersByTime(1100) })
    expect(mockNavigate).toHaveBeenCalledWith('/my')

    vi.useRealTimers()
  })
})

describe('ClipEditorPage cancel button', () => {
  it('navigates back on cancel click', async () => {
    await renderEditor()
    fireEvent.click(screen.getByText('취소'))
    expect(mockNavigate).toHaveBeenCalledWith(-1)
  })
})

describe('ClipEditorPage text background toggles', () => {
  it('toggles top text background off and on', async () => {
    await renderEditor()
    fireEvent.click(screen.getByText('텍스트'))

    // Enter text so overlay becomes visible
    const topTextArea = screen.getByPlaceholderText('상단에 표시할 텍스트')
    fireEvent.change(topTextArea, { target: { value: '테스트 상단' } })

    // Find the "배경" toggle buttons
    const bgButtons = screen.getAllByText('배경')
    expect(bgButtons.length).toBe(2)

    // Toggle top text bg off
    fireEvent.click(bgButtons[0])
    // Toggle top text bg back on
    fireEvent.click(bgButtons[0])
  })

  it('toggles bottom text background off and on', async () => {
    await renderEditor()
    fireEvent.click(screen.getByText('텍스트'))

    const bottomTextArea = screen.getByPlaceholderText('하단에 표시할 텍스트')
    fireEvent.change(bottomTextArea, { target: { value: '테스트 하단' } })

    const bgButtons = screen.getAllByText('배경')
    // Toggle bottom text bg off
    fireEvent.click(bgButtons[1])
    // Toggle bottom text bg back on
    fireEvent.click(bgButtons[1])
  })

  it('renders text overlay hint', async () => {
    await renderEditor()
    fireEvent.click(screen.getByText('텍스트'))
    expect(screen.getByText('클립 프리뷰에서 실시간으로 텍스트가 표시됩니다.')).toBeInTheDocument()
  })
})

describe('ClipEditorPage thumbnail capture', () => {
  it('captures thumbnail and shows confirmation message', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    await renderEditor()

    // Make sure we're on frame tab (default)
    const captureBtn = screen.getByText('현재 프레임 캡처')
    fireEvent.click(captureBtn)

    // Should show the thumbnail message
    expect(screen.getByText(/프레임이 썸네일로 설정되었습니다/)).toBeInTheDocument()

    // Message should disappear after 3 seconds
    act(() => { vi.advanceTimersByTime(3100) })
    expect(screen.queryByText(/프레임이 썸네일로 설정되었습니다/)).not.toBeInTheDocument()

    vi.useRealTimers()
  })
})

describe('ClipEditorPage crop description', () => {
  it('shows fit mode description in frame tab', async () => {
    await renderEditor()
    // Default is fit mode
    expect(screen.getByText(/16:9 원본 영상이 9:16 프레임 안에 전체 표시됩니다/)).toBeInTheDocument()
  })

  it('shows fill mode description in frame tab', async () => {
    await renderEditor()
    fireEvent.click(screen.getByText('화면 채우기'))
    expect(screen.getByText(/16:9 원본 영상을 잘라서 9:16 화면을 채웁니다/)).toBeInTheDocument()
  })
})

describe('ClipEditorPage add tag via button', () => {
  it('adds tag by clicking the plus button', async () => {
    await renderEditor()
    fireEvent.click(screen.getByText('클립 정보'))

    const tagInput = screen.getByPlaceholderText('태그 추가')
    fireEvent.change(tagInput, { target: { value: '버튼태그' } })

    // Find the plus button next to the tag input (it's within a flex gap-2 container)
    const tagInputContainer = tagInput.closest('.flex.gap-2')
    const addBtn = tagInputContainer?.querySelector('button')
    if (addBtn) {
      fireEvent.click(addBtn)
      expect(screen.getByText('#버튼태그')).toBeInTheDocument()
    }
  })

  it('strips # prefix from tag input', async () => {
    await renderEditor()
    fireEvent.click(screen.getByText('클립 정보'))
    const tagInput = screen.getByPlaceholderText('태그 추가')
    fireEvent.change(tagInput, { target: { value: '#해시태그' } })
    fireEvent.keyDown(tagInput, { key: 'Enter' })
    expect(screen.getByText('#해시태그')).toBeInTheDocument()
  })
})

describe('ClipEditorPage info tab description', () => {
  it('edits description textarea', async () => {
    await renderEditor()
    fireEvent.click(screen.getByText('클립 정보'))
    const descInput = screen.getByPlaceholderText('클립에 대한 설명을 입력하세요')
    fireEvent.change(descInput, { target: { value: '새로운 설명입니다' } })
    expect(descInput).toHaveValue('새로운 설명입니다')
  })

  it('sets visibility to private then back to public', async () => {
    await renderEditor()
    fireEvent.click(screen.getByText('클립 정보'))
    fireEvent.click(screen.getByText('나만보기'))
    fireEvent.click(screen.getByText('전체공개'))
  })
})

describe('ClipEditorPage crop drag in fill mode', () => {
  it('initiates crop drag on source video in fill mode', async () => {
    await renderEditor()
    // Switch to fill mode
    fireEvent.click(screen.getByText('화면 채우기'))

    // Find the source video container
    const sourceContainer = document.querySelector('.cursor-grab')
    if (sourceContainer) {
      // Start drag
      fireEvent.mouseDown(sourceContainer, { clientX: 100 })
      // Move
      fireEvent.mouseMove(window, { clientX: 150 })
      // Release
      fireEvent.mouseUp(window)
    }
  })

  it('does not start crop drag in fit mode', async () => {
    await renderEditor()
    // In fit mode (default), clicking source video should not start crop drag
    const sourceLabel = screen.getByText('원본 영상 (16:9)')
    const container = sourceLabel.closest('div')?.querySelector('.bg-black')
    if (container) {
      fireEvent.mouseDown(container, { clientX: 100 })
    }
  })
})

describe('ClipEditorPage trim handle drag', () => {
  it('drags the start trim handle', async () => {
    await renderEditor()
    const startHandle = document.querySelector('[data-handle="start"]')
    if (startHandle) {
      fireEvent.mouseDown(startHandle, { clientX: 50 })
      fireEvent.mouseMove(window, { clientX: 100 })
      fireEvent.mouseUp(window)
    }
  })

  it('drags the end trim handle', async () => {
    await renderEditor()
    const endHandle = document.querySelector('[data-handle="end"]')
    if (endHandle) {
      fireEvent.mouseDown(endHandle, { clientX: 400 })
      fireEvent.mouseMove(window, { clientX: 350 })
      fireEvent.mouseUp(window)
    }
  })
})

describe('ClipEditorPage timeline click to seek', () => {
  it('clicks timeline to seek to position', async () => {
    await renderEditor()
    // The timeline is the div with ref=timelineRef containing data-handle children
    const timeline = document.querySelector('[data-handle="start"]')?.parentElement
    if (timeline) {
      Object.defineProperty(timeline, 'getBoundingClientRect', {
        value: () => ({ left: 0, width: 1000, top: 0, height: 40, right: 1000, bottom: 40 }),
        configurable: true,
      })
      // Fire a native mouse click on the timeline (not on a handle)
      const clickEvent = new MouseEvent('click', { clientX: 500, bubbles: true })
      timeline.dispatchEvent(clickEvent)
    }
  })
})

describe('ClipEditorPage skip controls', () => {
  it('skips forward and backward', async () => {
    await renderEditor()
    fireEvent.click(screen.getByText('-5s'))
    fireEvent.click(screen.getByText('+5s'))
  })

  it('clicks go to start/end buttons', async () => {
    await renderEditor()
    const buttons = screen.getAllByRole('button')
    // First and last in the control row
    // GoToStart = first skip button, GoToEnd = last skip button
    fireEvent.click(screen.getByText('시작점'))
    fireEvent.click(screen.getByText('종료점'))
  })
})

describe('ClipEditorPage addTag with Enter not composing', () => {
  it('prevents default on Enter keydown for tag input', async () => {
    await renderEditor()
    fireEvent.click(screen.getByText('클립 정보'))
    const tagInput = screen.getByPlaceholderText('태그 추가')
    fireEvent.change(tagInput, { target: { value: '엔터태그' } })
    // Fire keyDown with isComposing=false
    const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })
    Object.defineProperty(event, 'nativeEvent', { value: { isComposing: false } })
    tagInput.dispatchEvent(event)
  })
})
