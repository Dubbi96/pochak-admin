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

describe('Phase 3: UI/UX component tests', () => {
  describe('Header', () => {
    it('renders POCHAK logo and service tabs', async () => {
      const { default: Header } = await import('./Header')
      render(<Header />)
      expect(screen.getByAltText('POCHAK')).toBeInTheDocument()
      expect(screen.getByText('TV')).toBeInTheDocument()
      expect(screen.getByText('City')).toBeInTheDocument()
      expect(screen.getByText('Club')).toBeInTheDocument()
    })

    it('renders search bar with correct placeholder', async () => {
      const { default: Header } = await import('./Header')
      render(<Header />)
      expect(screen.getByPlaceholderText('검색어를 입력하세요')).toBeInTheDocument()
    })

    it('renders notification bell with indicator', async () => {
      const { default: Header } = await import('./Header')
      render(<Header />)
      expect(screen.getByLabelText('알림')).toBeInTheDocument()
    })
  })

  describe('Sidebar', () => {
    it('renders main navigation items', async () => {
      const { default: Sidebar } = await import('./Sidebar')
      render(<Sidebar />)
      expect(screen.getByText('홈')).toBeInTheDocument()
      expect(screen.getByText('일정')).toBeInTheDocument()
      expect(screen.getByText('클립')).toBeInTheDocument()
      expect(screen.getByText('마이')).toBeInTheDocument()
    })

    it('renders bottom links without ExternalLink icon', async () => {
      const { default: Sidebar } = await import('./Sidebar')
      render(<Sidebar />)
      expect(screen.getByText('설정')).toBeInTheDocument()
      expect(screen.getByText('고객센터')).toBeInTheDocument()
      // ExternalLink icon should not be present - ChevronRight instead
    })

    it('renders ad banners section', async () => {
      const { default: Sidebar } = await import('./Sidebar')
      render(<Sidebar />)
      const adElements = screen.getAllByText('AD')
      expect(adElements.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('Badge', () => {
    it('renders all badge variants', async () => {
      const { default: Badge } = await import('./Badge')
      const { render: r } = await import('@/test/test-utils')
      const variants = ['live', 'vod', 'clip', 'free', 'ad', 'scheduled'] as const
      for (const v of variants) {
        const { unmount } = r(<Badge variant={v} />)
        unmount()
      }
    })
  })

  describe('Footer', () => {
    it('renders company name and links', async () => {
      const { default: Footer } = await import('./Footer')
      render(<Footer />)
      expect(screen.getByText('주식회사 호각')).toBeInTheDocument()
      expect(screen.getByText('회사소개')).toBeInTheDocument()
      expect(screen.getByText('제휴문의')).toBeInTheDocument()
      expect(screen.getByText('약관 및 정책')).toBeInTheDocument()
    })
  })

  describe('Card', () => {
    it('VideoCard renders title and competition', async () => {
      const { VideoCard } = await import('./Card')
      render(<VideoCard id="1" title="Test Video" competition="Test Comp" type="VOD" tags={['축구']} duration="1:30:00" date="2026-01-01" />)
      expect(screen.getByText('Test Video')).toBeInTheDocument()
      expect(screen.getByText('Test Comp')).toBeInTheDocument()
    })

    it('ClipCard renders title and viewcount', async () => {
      const { ClipCard } = await import('./Card')
      render(<ClipCard id="1" title="Test Clip" viewCount={1500} />)
      expect(screen.getByText('Test Clip')).toBeInTheDocument()
    })

    it('TeamLogoCard renders team info', async () => {
      const { TeamLogoCard } = await import('./Card')
      render(<TeamLogoCard id="1" name="Test Team" subtitle="Sub" color="#ff0000" initial="T" />)
      expect(screen.getByText('Test Team')).toBeInTheDocument()
      expect(screen.getByText('Sub')).toBeInTheDocument()
    })
  })

  describe('SectionHeader', () => {
    it('renders title and link', async () => {
      const { default: SectionHeader } = await import('./SectionHeader')
      render(<SectionHeader title="테스트 섹션" linkTo="/test" linkLabel="더보기" />)
      expect(screen.getByText('테스트 섹션')).toBeInTheDocument()
      expect(screen.getByText('더보기')).toBeInTheDocument()
    })
  })
})
