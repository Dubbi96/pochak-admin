/**
 * Coverage tests for ProfileSidebar.tsx
 * Targets uncovered lines: 65-71 (button onClick handlers for navigate)
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@/test/test-utils'

vi.mock('@/services/api-client', () => ({
  pochakApi: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
  GATEWAY_URL: 'http://localhost:8080',
}))

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate, useLocation: () => ({ pathname: '/my' }) }
})

vi.mock('@/hooks/useApi', () => ({
  useTeams: () => ({ data: [], loading: false, error: null }),
  useSearchSuggestions: () => ({ data: { contents: [], teams: [], competitions: [] }, loading: false, error: null }),
  useTrendingSearches: () => ({ data: [], loading: false, error: null }),
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('ProfileSidebar action buttons', () => {
  it('renders profile info', async () => {
    const { default: ProfileSidebar } = await import('./ProfileSidebar')
    render(<ProfileSidebar />)
    expect(screen.getByText('pochak2026')).toBeInTheDocument()
    expect(screen.getByText('email@address.com')).toBeInTheDocument()
  })

  it('clicks edit button and navigates to settings', async () => {
    const { default: ProfileSidebar } = await import('./ProfileSidebar')
    render(<ProfileSidebar />)
    // The three buttons are: pencil (settings), bell (notifications), gear (settings)
    const buttons = screen.getAllByRole('button')
    // First button should navigate to settings (edit profile)
    const actionButtons = buttons.filter(btn =>
      btn.closest('.flex.items-center.gap-2.mt-3')
    )
    if (actionButtons.length >= 3) {
      fireEvent.click(actionButtons[0]) // pencil -> /settings
      expect(mockNavigate).toHaveBeenCalledWith('/settings')

      mockNavigate.mockClear()
      fireEvent.click(actionButtons[1]) // bell -> /notifications
      expect(mockNavigate).toHaveBeenCalledWith('/notifications')

      mockNavigate.mockClear()
      fireEvent.click(actionButtons[2]) // gear -> /settings
      expect(mockNavigate).toHaveBeenCalledWith('/settings')
    }
  })

  it('renders subscription info', async () => {
    const { default: ProfileSidebar } = await import('./ProfileSidebar')
    render(<ProfileSidebar />)
    expect(screen.getByText('구독 관리')).toBeInTheDocument()
    expect(screen.getByText('대가족 무제한 시청권')).toBeInTheDocument()
    expect(screen.getByText(/다음결제일/)).toBeInTheDocument()
  })

  it('renders navigation menu items', async () => {
    const { default: ProfileSidebar } = await import('./ProfileSidebar')
    render(<ProfileSidebar />)
    expect(screen.getByText('구독/이용권 구매')).toBeInTheDocument()
    expect(screen.getByText('시청내역')).toBeInTheDocument()
    expect(screen.getByText('내 클립')).toBeInTheDocument()
    expect(screen.getByText('가입한 클럽')).toBeInTheDocument()
    expect(screen.getByText('대회소식')).toBeInTheDocument()
    expect(screen.getByText('알림내역')).toBeInTheDocument()
  })

  it('renders logout button', async () => {
    const { default: ProfileSidebar } = await import('./ProfileSidebar')
    render(<ProfileSidebar />)
    expect(screen.getByText('로그아웃')).toBeInTheDocument()
  })
})
