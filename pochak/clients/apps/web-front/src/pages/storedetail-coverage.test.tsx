/**
 * Coverage tests for StoreDetailPage.tsx
 * Targets uncovered lines: 113, 128-193 (product rendering, features, related products)
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@/test/test-utils'

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

// We'll set the id via a variable that can change per test
let mockId = '1'
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useParams: () => ({ id: mockId }),
  }
})

beforeEach(() => {
  vi.clearAllMocks()
  Element.prototype.scrollTo = vi.fn() as any
  mockId = '1'
})

describe('StoreDetailPage product rendering', () => {
  it('renders product name and description for id=1', async () => {
    mockId = '1'
    const { default: StoreDetailPage } = await import('./StoreDetailPage')
    render(<StoreDetailPage />)
    expect(screen.getByText('포착 프리미엄 월간 이용권')).toBeInTheDocument()
    expect(screen.getByText(/모든 라이브 경기와 VOD/)).toBeInTheDocument()
  })

  it('renders monthly price', async () => {
    mockId = '1'
    const { default: StoreDetailPage } = await import('./StoreDetailPage')
    render(<StoreDetailPage />)
    expect(screen.getByText('9,900원')).toBeInTheDocument()
  })

  it('renders yearly price and discount for products with discount', async () => {
    mockId = '1'
    const { default: StoreDetailPage } = await import('./StoreDetailPage')
    render(<StoreDetailPage />)
    expect(screen.getByText('99,000원')).toBeInTheDocument()
    expect(screen.getByText('17% 할인')).toBeInTheDocument()
  })

  it('renders features list', async () => {
    mockId = '1'
    const { default: StoreDetailPage } = await import('./StoreDetailPage')
    render(<StoreDetailPage />)
    expect(screen.getByText('모든 라이브 경기 무제한 시청')).toBeInTheDocument()
    expect(screen.getByText('최대 4K 고화질 스트리밍')).toBeInTheDocument()
    expect(screen.getByText('광고 없는 시청 환경')).toBeInTheDocument()
  })

  it('renders CTA button', async () => {
    mockId = '1'
    const { default: StoreDetailPage } = await import('./StoreDetailPage')
    render(<StoreDetailPage />)
    expect(screen.getByText('구매하기')).toBeInTheDocument()
  })

  it('renders related products section', async () => {
    mockId = '1'
    const { default: StoreDetailPage } = await import('./StoreDetailPage')
    render(<StoreDetailPage />)
    expect(screen.getByText('다른 상품')).toBeInTheDocument()
    // Related products should NOT include the current product (id=1)
    expect(screen.getByText('포착 연간 이용권')).toBeInTheDocument()
    expect(screen.getByText('응원 기프트 카드 5만원권')).toBeInTheDocument()
  })

  it('renders product without yearly discount (gift card)', async () => {
    mockId = '3'
    const { default: StoreDetailPage } = await import('./StoreDetailPage')
    render(<StoreDetailPage />)
    expect(screen.getByText('응원 기프트 카드 5만원권')).toBeInTheDocument()
    expect(screen.getByText('50,000원')).toBeInTheDocument()
    // Should NOT show discount text since yearlyDiscount is 0
    expect(screen.queryByText(/할인/)).not.toBeInTheDocument()
  })

  it('shows not found for invalid product id', async () => {
    mockId = '999'
    const { default: StoreDetailPage } = await import('./StoreDetailPage')
    render(<StoreDetailPage />)
    expect(screen.getByText('상품을 찾을 수 없습니다.')).toBeInTheDocument()
  })

  it('renders product image', async () => {
    mockId = '1'
    const { default: StoreDetailPage } = await import('./StoreDetailPage')
    render(<StoreDetailPage />)
    const img = screen.getByAltText('포착 프리미엄 월간 이용권')
    expect(img).toBeInTheDocument()
  })

  it('renders product id=4 (merchandise)', async () => {
    mockId = '4'
    const { default: StoreDetailPage } = await import('./StoreDetailPage')
    render(<StoreDetailPage />)
    expect(screen.getByText('포착 로고 머플러 타월')).toBeInTheDocument()
    expect(screen.getByText('25,000원')).toBeInTheDocument()
    expect(screen.getByText('고급 면 100% 소재')).toBeInTheDocument()
  })

  it('renders product id=5 (uniform)', async () => {
    mockId = '5'
    const { default: StoreDetailPage } = await import('./StoreDetailPage')
    render(<StoreDetailPage />)
    expect(screen.getByText('포착 한정판 유니폼')).toBeInTheDocument()
  })

  it('renders product id=2 (annual plan)', async () => {
    mockId = '2'
    const { default: StoreDetailPage } = await import('./StoreDetailPage')
    render(<StoreDetailPage />)
    expect(screen.getByText('포착 연간 이용권')).toBeInTheDocument()
    expect(screen.getByText(/12개월 프리미엄/)).toBeInTheDocument()
  })
})
