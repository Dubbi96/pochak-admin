import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@/test/test-utils'

vi.mock('@/services/api-client', () => ({
  pochakApi: { get: vi.fn(), post: vi.fn() },
  GATEWAY_URL: 'http://localhost:8080',
}))

vi.mock('@/hooks/useApi', () => ({
  useTeams: () => ({ data: [], loading: false, error: null }),
  useSearchSuggestions: () => ({ data: { contents: [], teams: [], competitions: [] }, loading: false, error: null }),
  useTrendingSearches: () => ({ data: [], loading: false, error: null }),
}))

describe('Custom Button component', () => {
  it('renders primary button by default', async () => {
    const { default: Button } = await import('./Button')
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
    expect(screen.getByRole('button')).toHaveClass('bg-primary')
  })

  it('renders secondary variant', async () => {
    const { default: Button } = await import('./Button')
    render(<Button variant="secondary">Secondary</Button>)
    expect(screen.getByText('Secondary')).toBeInTheDocument()
    expect(screen.getByRole('button')).toHaveClass('bg-card')
  })

  it('renders ghost variant', async () => {
    const { default: Button } = await import('./Button')
    render(<Button variant="ghost">Ghost</Button>)
    expect(screen.getByRole('button')).toHaveClass('bg-transparent')
  })

  it('renders outline variant', async () => {
    const { default: Button } = await import('./Button')
    render(<Button variant="outline">Outline</Button>)
    expect(screen.getByRole('button')).toHaveClass('border-primary')
  })

  it('renders small size', async () => {
    const { default: Button } = await import('./Button')
    render(<Button size="sm">Small</Button>)
    expect(screen.getByRole('button')).toHaveClass('px-3')
  })

  it('renders large size', async () => {
    const { default: Button } = await import('./Button')
    render(<Button size="lg">Large</Button>)
    expect(screen.getByRole('button')).toHaveClass('px-8')
  })

  it('can be disabled', async () => {
    const { default: Button } = await import('./Button')
    render(<Button disabled>Disabled</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('accepts custom className', async () => {
    const { default: Button } = await import('./Button')
    render(<Button className="custom">Custom</Button>)
    expect(screen.getByRole('button')).toHaveClass('custom')
  })
})

describe('Custom Input component', () => {
  it('renders input without label', async () => {
    const { default: Input } = await import('./Input')
    render(<Input placeholder="Enter text" />)
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument()
  })

  it('renders input with label', async () => {
    const { default: Input } = await import('./Input')
    render(<Input label="Email" placeholder="Enter email" />)
    expect(screen.getByText('Email')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter email')).toBeInTheDocument()
  })

  it('renders error state', async () => {
    const { default: Input } = await import('./Input')
    render(<Input error="Required field" placeholder="Input" />)
    expect(screen.getByText('Required field')).toBeInTheDocument()
  })

  it('renders without error when not provided', async () => {
    const { default: Input } = await import('./Input')
    render(<Input placeholder="No error" />)
    expect(screen.queryByText('Required field')).not.toBeInTheDocument()
  })
})

describe('Card components extended', () => {
  it('VideoCard renders with all props', async () => {
    const { VideoCard } = await import('./Card')
    render(
      <VideoCard
        id="1" title="Full Card" competition="League" type="LIVE"
        tags={['축구', '무료']} duration="1:30:00" date="2026-01-01"
        viewCount={15000} isLive thumbnailUrl="/thumb.jpg" isFree
      />
    )
    expect(screen.getByText('Full Card')).toBeInTheDocument()
    expect(screen.getByText('League')).toBeInTheDocument()
  })

  it('VideoCard renders VOD type', async () => {
    const { VideoCard } = await import('./Card')
    render(
      <VideoCard
        id="2" title="VOD Card" competition="League" type="VOD"
        tags={[]} date="2026-01-01" viewCount={500}
      />
    )
    expect(screen.getByText('VOD Card')).toBeInTheDocument()
  })

  it('CompetitionBannerCard renders', async () => {
    const { CompetitionBannerCard } = await import('./Card')
    render(
      <CompetitionBannerCard
        id="c1" name="대회 이름" dateRange="2026.01~02"
        logoColor="#ff0000" logoText="A" subtitle="야구"
        isAd={false} imageUrl="/comp.jpg"
      />
    )
    expect(screen.getByText('대회 이름')).toBeInTheDocument()
    expect(screen.getByText('2026.01~02')).toBeInTheDocument()
  })

  it('CompetitionBannerCard renders with AD badge', async () => {
    const { CompetitionBannerCard } = await import('./Card')
    render(
      <CompetitionBannerCard
        id="c2" name="광고대회" dateRange="2026.03~04"
        logoColor="#0000ff" logoText="B" subtitle="축구"
        isAd imageUrl=""
      />
    )
    expect(screen.getByText('광고대회')).toBeInTheDocument()
  })
})

describe('Layout component', () => {
  it('renders layout with header and sidebar', async () => {
    const { default: Layout } = await import('@/layouts/Layout')
    render(<Layout />)
    // Header should be present
    expect(screen.getByRole('banner')).toBeInTheDocument()
  })
})

describe('UI primitives coverage', () => {
  it('renders ui/card components', async () => {
    const { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } = await import('./ui/card')
    render(
      <Card>
        <CardHeader>
          <CardTitle>Title</CardTitle>
          <CardDescription>Desc</CardDescription>
        </CardHeader>
        <CardContent>Content</CardContent>
        <CardFooter>Footer</CardFooter>
      </Card>
    )
    expect(screen.getByText('Title')).toBeInTheDocument()
    expect(screen.getByText('Desc')).toBeInTheDocument()
    expect(screen.getByText('Content')).toBeInTheDocument()
    expect(screen.getByText('Footer')).toBeInTheDocument()
  })

  it('renders separator', async () => {
    const { Separator } = await import('./ui/separator')
    const { container } = render(<Separator />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('renders skeleton', async () => {
    const { Skeleton } = await import('./ui/skeleton')
    const { container } = render(<Skeleton className="w-full h-4" />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('renders avatar components', async () => {
    const { Avatar, AvatarImage, AvatarFallback } = await import('./ui/avatar')
    render(
      <Avatar>
        <AvatarImage src="/test.jpg" alt="Test" />
        <AvatarFallback>TT</AvatarFallback>
      </Avatar>
    )
    expect(screen.getByText('TT')).toBeInTheDocument()
  })
})
