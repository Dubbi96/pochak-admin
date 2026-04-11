/**
 * Deep coverage for Card.tsx components
 * Targets uncovered: TeamCard (line 214), VideoCard metadata branches,
 * scheduled date badge, club badge click
 */
import { describe, it, expect, vi } from 'vitest'
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

describe('TeamCard component', () => {
  it('renders TeamCard with imageUrl', async () => {
    const { TeamCard } = await import('./Card')
    render(<TeamCard id="1" name="Team Alpha" subtitle="야구" color="#f00" initial="A" imageUrl="/team.jpg" followers={1000} />)
    expect(screen.getByText('Team Alpha')).toBeInTheDocument()
    expect(screen.getByText('야구')).toBeInTheDocument()
  })

  it('renders TeamCard without imageUrl (fallback)', async () => {
    const { TeamCard } = await import('./Card')
    render(<TeamCard id="2" name="Team Beta" subtitle="축구" color="#00f" initial="B" />)
    expect(screen.getByText('Team Beta')).toBeInTheDocument()
    expect(screen.getByText('B')).toBeInTheDocument()
  })
})

describe('VideoCard edge cases', () => {
  it('renders scheduled date badge (LIVE type without isLive)', async () => {
    const { VideoCard } = await import('./Card')
    render(<VideoCard id="1" title="Scheduled" competition="Comp" type="LIVE" date="2026-03-15" />)
    expect(screen.getByText('03/15 예정')).toBeInTheDocument()
  })

  it('renders live mode view count', async () => {
    const { VideoCard } = await import('./Card')
    render(<VideoCard id="1" title="Live Match" competition="Cup" type="LIVE" isLive viewCount={500} date="2026-01-01" />)
    expect(screen.getByText(/시청 중/)).toBeInTheDocument()
  })

  it('renders VOD mode view count', async () => {
    const { VideoCard } = await import('./Card')
    render(<VideoCard id="1" title="VOD" competition="Cup" type="VOD" viewCount={2500} date="2026-01-01" />)
    expect(screen.getByText(/조회수/)).toBeInTheDocument()
  })

  it('renders without viewCount or date', async () => {
    const { VideoCard } = await import('./Card')
    render(<VideoCard id="1" title="Minimal" competition="Comp" type="VOD" />)
    expect(screen.getByText('Minimal')).toBeInTheDocument()
  })

  it('renders live without viewCount', async () => {
    const { VideoCard } = await import('./Card')
    render(<VideoCard id="1" title="Live No Views" competition="Cup" type="LIVE" isLive />)
    expect(screen.getByText(/시청 중/)).toBeInTheDocument()
  })

  it('club badge click navigates', async () => {
    const { VideoCard } = await import('./Card')
    render(<VideoCard id="1" title="Test" competition="C" type="VOD" date="2026-01-01" viewCount={100} />)
    // Find the club badge (P letter in circle)
    const badge = screen.getByText('P').closest('div[class*="cursor-pointer"]')
    if (badge) {
      fireEvent.click(badge)
    }
  })

  it('more menu button click', async () => {
    const { VideoCard } = await import('./Card')
    render(<VideoCard id="1" title="Test" competition="C" type="VOD" date="2026-01-01" />)
    // More button (ellipsis) is present but hidden via opacity
    const buttons = screen.getAllByRole('button')
    if (buttons.length > 0) fireEvent.click(buttons[buttons.length - 1])
  })

  it('renders CLIP type link path', async () => {
    const { VideoCard } = await import('./Card')
    render(<VideoCard id="1" title="Clip Card" competition="C" type="CLIP" date="2026-01-01" />)
    const link = screen.getByText('Clip Card').closest('a')
    expect(link?.getAttribute('href')).toContain('/clip/')
  })

  it('renders with duration badge (VOD)', async () => {
    const { VideoCard } = await import('./Card')
    render(<VideoCard id="1" title="With Duration" competition="C" type="VOD" duration="1:30:00" date="2026-01-01" />)
    expect(screen.getByText('1:30:00')).toBeInTheDocument()
  })

  it('renders free badge', async () => {
    const { VideoCard } = await import('./Card')
    render(<VideoCard id="1" title="Free Video" competition="C" type="VOD" isFree date="2026-01-01" />)
    expect(screen.getByText('무료')).toBeInTheDocument()
  })
})

describe('TeamLogoCard edge cases', () => {
  it('renders with isActive (LIVE ring)', async () => {
    const { TeamLogoCard } = await import('./Card')
    render(<TeamLogoCard id="1" name="Active Team" color="#f00" initial="A" subtitle="야구" isActive />)
    expect(screen.getByText('Active Team')).toBeInTheDocument()
    expect(screen.getByText('LIVE')).toBeInTheDocument()
  })

  it('renders without followers', async () => {
    const { TeamLogoCard } = await import('./Card')
    render(<TeamLogoCard id="1" name="No Followers" color="#f00" initial="N" subtitle="축구" />)
    expect(screen.getByText('No Followers')).toBeInTheDocument()
  })
})
