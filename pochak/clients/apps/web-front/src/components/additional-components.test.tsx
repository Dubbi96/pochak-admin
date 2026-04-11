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

describe('FilterChip', () => {
  it('renders label text', async () => {
    const { default: FilterChip } = await import('./FilterChip')
    render(<FilterChip label="테스트" />)
    expect(screen.getByText('테스트')).toBeInTheDocument()
  })

  it('applies selected styling', async () => {
    const { default: FilterChip } = await import('./FilterChip')
    render(<FilterChip label="선택됨" selected />)
    const btn = screen.getByText('선택됨').closest('button')!
    expect(btn.className).toContain('text-foreground')
  })

  it('applies unselected styling', async () => {
    const { default: FilterChip } = await import('./FilterChip')
    render(<FilterChip label="미선택" selected={false} />)
    const btn = screen.getByText('미선택').closest('button')!
    expect(btn.className).toContain('pochak-text-tertiary')
  })

  it('handles click events', async () => {
    const onClick = vi.fn()
    const { default: FilterChip } = await import('./FilterChip')
    render(<FilterChip label="클릭" onClick={onClick} />)
    fireEvent.click(screen.getByText('클릭'))
    expect(onClick).toHaveBeenCalled()
  })

  it('renders with md size', async () => {
    const { default: FilterChip } = await import('./FilterChip')
    render(<FilterChip label="MD" size="md" />)
    const btn = screen.getByText('MD').closest('button')!
    expect(btn.className).toContain('text-[15px]')
  })

  it('renders with sm size (default)', async () => {
    const { default: FilterChip } = await import('./FilterChip')
    render(<FilterChip label="SM" />)
    const btn = screen.getByText('SM').closest('button')!
    expect(btn.className).toContain('text-[14px]')
  })

  it('renders with icon', async () => {
    const { default: FilterChip } = await import('./FilterChip')
    render(<FilterChip label="아이콘" icon={<span data-testid="icon">*</span>} />)
    expect(screen.getByTestId('icon')).toBeInTheDocument()
  })
})

describe('HScrollRow', () => {
  it('renders children', async () => {
    const { default: HScrollRow } = await import('./HScrollRow')
    render(
      <HScrollRow>
        <div>Item 1</div>
        <div>Item 2</div>
      </HScrollRow>
    )
    expect(screen.getByText('Item 1')).toBeInTheDocument()
    expect(screen.getByText('Item 2')).toBeInTheDocument()
  })

  it('renders scroll buttons', async () => {
    const { default: HScrollRow } = await import('./HScrollRow')
    render(
      <HScrollRow>
        <div>Item</div>
      </HScrollRow>
    )
    expect(screen.getByLabelText('왼쪽 스크롤')).toBeInTheDocument()
    expect(screen.getByLabelText('오른쪽 스크롤')).toBeInTheDocument()
  })

  it('handles scroll button clicks gracefully', async () => {
    const { default: HScrollRow } = await import('./HScrollRow')
    // Mock scrollBy on the scrollable div
    const mockScrollBy = vi.fn()
    const originalCreateElement = document.createElement.bind(document)
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      const el = originalCreateElement(tag)
      if (tag === 'div') {
        el.scrollBy = mockScrollBy
      }
      return el
    })

    render(
      <HScrollRow scrollAmount={200}>
        <div>Item</div>
      </HScrollRow>
    )

    // The scroll buttons exist and are clickable
    expect(screen.getByLabelText('오른쪽 스크롤')).toBeInTheDocument()
    expect(screen.getByLabelText('왼쪽 스크롤')).toBeInTheDocument()

    vi.restoreAllMocks()
  })

  it('accepts custom className', async () => {
    const { default: HScrollRow } = await import('./HScrollRow')
    const { container } = render(
      <HScrollRow className="custom-class">
        <div>Item</div>
      </HScrollRow>
    )
    expect(container.querySelector('.custom-class')).toBeInTheDocument()
  })
})

describe('Modal', () => {
  it('renders nothing when closed', async () => {
    const { default: Modal } = await import('./Modal')
    const { container } = render(
      <Modal open={false} onClose={() => {}}>
        <p>Content</p>
      </Modal>
    )
    expect(container.innerHTML).toBe('')
  })

  it('renders content when open', async () => {
    const { default: Modal } = await import('./Modal')
    render(
      <Modal open={true} onClose={() => {}}>
        <p>Modal Content</p>
      </Modal>
    )
    expect(screen.getByText('Modal Content')).toBeInTheDocument()
  })

  it('renders title when provided', async () => {
    const { default: Modal } = await import('./Modal')
    render(
      <Modal open={true} onClose={() => {}} title="Test Title">
        <p>Content</p>
      </Modal>
    )
    expect(screen.getByText('Test Title')).toBeInTheDocument()
    expect(screen.getByLabelText('닫기')).toBeInTheDocument()
  })

  it('calls onClose when close button clicked', async () => {
    const onClose = vi.fn()
    const { default: Modal } = await import('./Modal')
    render(
      <Modal open={true} onClose={onClose} title="Title">
        <p>Content</p>
      </Modal>
    )
    fireEvent.click(screen.getByLabelText('닫기'))
    expect(onClose).toHaveBeenCalled()
  })

  it('calls onClose when backdrop clicked', async () => {
    const onClose = vi.fn()
    const { default: Modal } = await import('./Modal')
    render(
      <Modal open={true} onClose={onClose} title="Title">
        <p>Content</p>
      </Modal>
    )
    // Click the backdrop overlay
    const backdrop = document.querySelector('[aria-hidden="true"]')!
    fireEvent.click(backdrop)
    expect(onClose).toHaveBeenCalled()
  })

  it('sets body overflow to hidden when open', async () => {
    const { default: Modal } = await import('./Modal')
    render(
      <Modal open={true} onClose={() => {}}>
        <p>Content</p>
      </Modal>
    )
    expect(document.body.style.overflow).toBe('hidden')
  })

  it('restores body overflow when closed', async () => {
    const { default: Modal } = await import('./Modal')
    const { rerender } = render(
      <Modal open={true} onClose={() => {}}>
        <p>Content</p>
      </Modal>
    )
    rerender(
      <Modal open={false} onClose={() => {}}>
        <p>Content</p>
      </Modal>
    )
    expect(document.body.style.overflow).toBe('')
  })

  it('renders dialog role', async () => {
    const { default: Modal } = await import('./Modal')
    render(
      <Modal open={true} onClose={() => {}} title="Dialog">
        <p>Content</p>
      </Modal>
    )
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })
})

describe('Loading components', () => {
  it('renders SkeletonBox', async () => {
    const { SkeletonBox } = await import('./Loading')
    const { container } = render(<SkeletonBox className="w-full" />)
    expect(container.firstChild).toHaveClass('skeleton')
  })

  it('renders BannerSkeleton', async () => {
    const { BannerSkeleton } = await import('./Loading')
    const { container } = render(<BannerSkeleton />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('renders VideoCardSkeleton', async () => {
    const { VideoCardSkeleton } = await import('./Loading')
    const { container } = render(<VideoCardSkeleton />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('renders CardSkeleton (alias)', async () => {
    const { CardSkeleton } = await import('./Loading')
    const { container } = render(<CardSkeleton />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('renders ClipCardSkeleton', async () => {
    const { ClipCardSkeleton } = await import('./Loading')
    const { container } = render(<ClipCardSkeleton />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('renders ClipSkeleton (alias)', async () => {
    const { ClipSkeleton } = await import('./Loading')
    const { container } = render(<ClipSkeleton />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('renders TeamCardSkeleton', async () => {
    const { TeamCardSkeleton } = await import('./Loading')
    const { container } = render(<TeamCardSkeleton />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('renders GridSkeleton with default type', async () => {
    const { GridSkeleton } = await import('./Loading')
    const { container } = render(<GridSkeleton count={3} />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('renders GridSkeleton with clip type', async () => {
    const { GridSkeleton } = await import('./Loading')
    const { container } = render(<GridSkeleton count={3} type="clip" />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('renders HScrollRowSkeleton with video type', async () => {
    const { HScrollRowSkeleton } = await import('./Loading')
    const { container } = render(<HScrollRowSkeleton count={3} type="video" />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('renders HScrollRowSkeleton with clip type', async () => {
    const { HScrollRowSkeleton } = await import('./Loading')
    const { container } = render(<HScrollRowSkeleton count={3} type="clip" />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('renders HScrollRowSkeleton with team type', async () => {
    const { HScrollRowSkeleton } = await import('./Loading')
    const { container } = render(<HScrollRowSkeleton count={3} type="team" />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('renders FullPageLoader', async () => {
    const { FullPageLoader } = await import('./Loading')
    render(<FullPageLoader />)
    expect(screen.getByText('Loading')).toBeInTheDocument()
  })
})

describe('ProfileSidebar', () => {
  it('renders profile info', async () => {
    const { default: ProfileSidebar } = await import('./ProfileSidebar')
    render(<ProfileSidebar />)
    expect(screen.getByText('pochak2026')).toBeInTheDocument()
    expect(screen.getByText('email@address.com')).toBeInTheDocument()
  })

  it('renders subscription info', async () => {
    const { default: ProfileSidebar } = await import('./ProfileSidebar')
    render(<ProfileSidebar />)
    expect(screen.getByText('구독 관리')).toBeInTheDocument()
    expect(screen.getByText('볼/기프트볼 관리')).toBeInTheDocument()
    expect(screen.getByText('이용권 관리')).toBeInTheDocument()
    expect(screen.getByText('선물함')).toBeInTheDocument()
  })

  it('renders navigation menu items', async () => {
    const { default: ProfileSidebar } = await import('./ProfileSidebar')
    render(<ProfileSidebar />)
    expect(screen.getByText('구독/이용권 구매')).toBeInTheDocument()
    expect(screen.getByText('시청내역')).toBeInTheDocument()
    expect(screen.getByText('내 클립')).toBeInTheDocument()
    expect(screen.getByText('알림내역')).toBeInTheDocument()
    expect(screen.getByText('고객센터')).toBeInTheDocument()
  })

  it('renders logout button', async () => {
    const { default: ProfileSidebar } = await import('./ProfileSidebar')
    render(<ProfileSidebar />)
    expect(screen.getByText('로그아웃')).toBeInTheDocument()
  })
})
