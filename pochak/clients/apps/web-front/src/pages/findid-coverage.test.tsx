/**
 * Coverage tests for FindIdPage.tsx
 * Targets uncovered lines: 27-28 (handleSendResetLink), 121 (resetLinkSent message)
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@/test/test-utils'
import userEvent from '@testing-library/user-event'

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

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => vi.fn() }
})

beforeEach(() => {
  vi.clearAllMocks()
})

describe('FindIdPage password reset tab', () => {
  it('switches to reset-pw tab and sends reset link', async () => {
    const user = userEvent.setup()
    const { default: FindIdPage } = await import('./FindIdPage')
    render(<FindIdPage />)

    // Switch to password reset tab
    const resetTab = screen.getByText('비밀번호 재설정')
    await user.click(resetTab)

    // Enter email
    const emailInput = screen.getByLabelText('이메일')
    await user.type(emailInput, 'test@example.com')

    // Click send reset link
    const sendBtn = screen.getByText('재설정 링크 발송')
    await user.click(sendBtn)

    // Verify the success message appears (line 121)
    expect(screen.getByText(/비밀번호 재설정 링크를 발송했습니다/)).toBeInTheDocument()
  })

  it('does not send reset link when email is empty', async () => {
    const user = userEvent.setup()
    const { default: FindIdPage } = await import('./FindIdPage')
    render(<FindIdPage />)

    // Switch to reset-pw tab
    await user.click(screen.getByText('비밀번호 재설정'))

    // Button should be disabled when email is empty
    const sendBtn = screen.getByText('재설정 링크 발송')
    expect(sendBtn).toBeDisabled()
  })
})

describe('FindIdPage find-id tab flow', () => {
  it('sends verification code and verifies', async () => {
    const user = userEvent.setup()
    const { default: FindIdPage } = await import('./FindIdPage')
    render(<FindIdPage />)

    // Enter phone number
    const phoneInput = screen.getByLabelText('휴대폰 번호')
    await user.type(phoneInput, '01012345678')

    // Send code
    const sendCodeBtn = screen.getByText('인증번호 발송')
    await user.click(sendCodeBtn)

    // Verification code input should appear
    const codeInput = screen.getByLabelText('인증번호')
    await user.type(codeInput, '123456')

    // Verify code
    const verifyBtn = screen.getByText('확인')
    await user.click(verifyBtn)

    // Should show found ID
    expect(screen.getByText('user***@example.com')).toBeInTheDocument()
  })

  it('does not send code when phone is empty', async () => {
    const { default: FindIdPage } = await import('./FindIdPage')
    render(<FindIdPage />)

    // Button should be disabled
    const sendBtn = screen.getByText('인증번호 발송')
    expect(sendBtn).toBeDisabled()
  })
})
