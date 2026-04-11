/**
 * Coverage tests for ShareModal.tsx
 * Targets all uncovered lines: open state, copy link, social share buttons,
 * copied toast, QR code rendering
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@/test/test-utils'

vi.mock('@/services/api-client', () => ({
  pochakApi: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
  GATEWAY_URL: 'http://localhost:8080',
}))

vi.mock('@/hooks/useApi', () => ({
  useTeams: () => ({ data: [], loading: false, error: null }),
  useSearchSuggestions: () => ({ data: { contents: [], teams: [], competitions: [] }, loading: false, error: null }),
  useTrendingSearches: () => ({ data: [], loading: false, error: null }),
}))

beforeEach(() => {
  vi.clearAllMocks()
  // Mock clipboard API
  Object.assign(navigator, {
    clipboard: {
      writeText: vi.fn().mockResolvedValue(undefined),
    },
  })
  // Mock window.open
  window.open = vi.fn()
})

describe('ShareModal rendering', () => {
  it('does not render when open is false', async () => {
    const { default: ShareModal } = await import('./ShareModal')
    render(<ShareModal open={false} onClose={vi.fn()} />)
    expect(screen.queryByText('공유')).not.toBeInTheDocument()
  })

  it('renders when open is true', async () => {
    const { default: ShareModal } = await import('./ShareModal')
    render(<ShareModal open={true} onClose={vi.fn()} url="https://example.com" title="테스트" />)
    expect(screen.getByText('공유')).toBeInTheDocument()
    expect(screen.getByText('링크 복사')).toBeInTheDocument()
    expect(screen.getByText('카카오톡')).toBeInTheDocument()
    expect(screen.getByText('X')).toBeInTheDocument()
    expect(screen.getByText('Facebook')).toBeInTheDocument()
  })

  it('displays the URL', async () => {
    const { default: ShareModal } = await import('./ShareModal')
    render(<ShareModal open={true} onClose={vi.fn()} url="https://pochak.com/test" />)
    expect(screen.getByText('https://pochak.com/test')).toBeInTheDocument()
  })
})

describe('ShareModal copy link', () => {
  it('copies link to clipboard and shows copied state', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const { default: ShareModal } = await import('./ShareModal')
    render(<ShareModal open={true} onClose={vi.fn()} url="https://pochak.com" />)

    fireEvent.click(screen.getByText('링크 복사'))
    // Wait for async clipboard.writeText
    await act(async () => {
      await Promise.resolve()
    })

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('https://pochak.com')
    expect(screen.getByText('복사됨')).toBeInTheDocument()
    expect(screen.getByText('복사되었습니다')).toBeInTheDocument()

    // Toast should disappear after TOAST_DURATION (2000ms)
    act(() => { vi.advanceTimersByTime(2100) })
    expect(screen.queryByText('복사됨')).not.toBeInTheDocument()

    vi.useRealTimers()
  })

  it('falls back to textarea copy when clipboard API fails', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockRejectedValue(new Error('fail')) },
    })
    document.execCommand = vi.fn().mockReturnValue(true)

    const { default: ShareModal } = await import('./ShareModal')
    render(<ShareModal open={true} onClose={vi.fn()} url="https://pochak.com" />)

    fireEvent.click(screen.getByText('링크 복사'))
    await act(async () => { await Promise.resolve() })

    expect(document.execCommand).toHaveBeenCalledWith('copy')
    expect(screen.getByText('복사됨')).toBeInTheDocument()

    act(() => { vi.advanceTimersByTime(2100) })
    vi.useRealTimers()
  })
})

describe('ShareModal social share buttons', () => {
  it('opens Kakao share window', async () => {
    const { default: ShareModal } = await import('./ShareModal')
    render(<ShareModal open={true} onClose={vi.fn()} url="https://pochak.com" />)
    fireEvent.click(screen.getByText('카카오톡'))
    expect(window.open).toHaveBeenCalledWith(
      expect.stringContaining('story.kakao.com/share'),
      '_blank',
      expect.any(String)
    )
  })

  it('opens Twitter share window', async () => {
    const { default: ShareModal } = await import('./ShareModal')
    render(<ShareModal open={true} onClose={vi.fn()} url="https://pochak.com" title="테스트" />)
    fireEvent.click(screen.getByText('X'))
    expect(window.open).toHaveBeenCalledWith(
      expect.stringContaining('twitter.com/intent/tweet'),
      '_blank',
      expect.any(String)
    )
  })

  it('opens Facebook share window', async () => {
    const { default: ShareModal } = await import('./ShareModal')
    render(<ShareModal open={true} onClose={vi.fn()} url="https://pochak.com" />)
    fireEvent.click(screen.getByText('Facebook'))
    expect(window.open).toHaveBeenCalledWith(
      expect.stringContaining('facebook.com/sharer'),
      '_blank',
      expect.any(String)
    )
  })
})

describe('ShareModal close', () => {
  it('calls onClose when close button clicked', async () => {
    const onClose = vi.fn()
    const { default: ShareModal } = await import('./ShareModal')
    render(<ShareModal open={true} onClose={onClose} />)
    const closeBtn = screen.getByLabelText('닫기')
    fireEvent.click(closeBtn)
    expect(onClose).toHaveBeenCalled()
  })

  it('calls onClose when backdrop clicked', async () => {
    const onClose = vi.fn()
    const { default: ShareModal } = await import('./ShareModal')
    render(<ShareModal open={true} onClose={onClose} />)
    const backdrop = document.querySelector('[aria-hidden="true"]')
    if (backdrop) fireEvent.click(backdrop)
    expect(onClose).toHaveBeenCalled()
  })
})

describe('ShareModal defaults', () => {
  it('uses window.location.href when no url provided', async () => {
    const { default: ShareModal } = await import('./ShareModal')
    render(<ShareModal open={true} onClose={vi.fn()} />)
    // Should use window.location.href as default
    expect(screen.getByText(window.location.href)).toBeInTheDocument()
  })

  it('uses default title when no title provided', async () => {
    const { default: ShareModal } = await import('./ShareModal')
    render(<ShareModal open={true} onClose={vi.fn()} />)
    // Default title is '포착에서 공유합니다' - used in Twitter share
    fireEvent.click(screen.getByText('X'))
    expect(window.open).toHaveBeenCalledWith(
      expect.stringContaining(encodeURIComponent('포착에서 공유합니다')),
      '_blank',
      expect.any(String)
    )
  })
})
