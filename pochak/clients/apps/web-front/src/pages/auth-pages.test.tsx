import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@/test/test-utils'
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

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

beforeEach(() => {
  vi.clearAllMocks()
  vi.useFakeTimers({ shouldAdvanceTime: true })
})

describe('LoginPage', () => {
  async function renderLogin() {
    const { default: LoginPage } = await import('./LoginPage')
    return render(<LoginPage />)
  }

  it('renders login form with all elements', async () => {
    await renderLogin()
    expect(screen.getByRole('heading', { name: '로그인' })).toBeInTheDocument()
    expect(screen.getByLabelText('아이디')).toBeInTheDocument()
    expect(screen.getByLabelText('비밀번호')).toBeInTheDocument()
    expect(screen.getByText('로그인 상태 유지')).toBeInTheDocument()
    expect(screen.getByText('아이디 찾기')).toBeInTheDocument()
    expect(screen.getByText('비밀번호 찾기')).toBeInTheDocument()
    expect(screen.getByText('회원가입')).toBeInTheDocument()
  })

  it('renders POCHAK logo link', async () => {
    await renderLogin()
    expect(screen.getByLabelText('POCHAK 홈')).toBeInTheDocument()
    expect(screen.getByAltText('POCHAK')).toBeInTheDocument()
  })

  it('renders social login buttons', async () => {
    await renderLogin()
    expect(screen.getByLabelText('카카오 로그인')).toBeInTheDocument()
    expect(screen.getByLabelText('네이버 로그인')).toBeInTheDocument()
    expect(screen.getByLabelText('구글 로그인')).toBeInTheDocument()
    expect(screen.getByLabelText('애플 로그인')).toBeInTheDocument()
    expect(screen.getByText('간편 로그인')).toBeInTheDocument()
  })

  it('shows error when submitting empty form', async () => {
    await renderLogin()
    const submitBtn = screen.getByRole('button', { name: '로그인' })
    fireEvent.click(submitBtn)
    expect(screen.getByText('아이디와 비밀번호를 입력해주세요.')).toBeInTheDocument()
  })

  it('shows error when only userId is filled', async () => {
    await renderLogin()
    const userInput = screen.getByLabelText('아이디')
    fireEvent.change(userInput, { target: { value: 'testuser' } })
    const submitBtn = screen.getByRole('button', { name: '로그인' })
    fireEvent.click(submitBtn)
    expect(screen.getByText('아이디와 비밀번호를 입력해주세요.')).toBeInTheDocument()
  })

  it('toggles password visibility', async () => {
    await renderLogin()
    const pwInput = screen.getByLabelText('비밀번호')
    expect(pwInput).toHaveAttribute('type', 'password')

    const toggleBtn = screen.getByLabelText('비밀번호 보기')
    fireEvent.click(toggleBtn)
    expect(pwInput).toHaveAttribute('type', 'text')

    const hideBtn = screen.getByLabelText('비밀번호 숨기기')
    fireEvent.click(hideBtn)
    expect(pwInput).toHaveAttribute('type', 'password')
  })

  it('toggles keep-logged-in state', async () => {
    await renderLogin()
    const toggle = screen.getByRole('button', { pressed: false })
    fireEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-pressed', 'true')
    fireEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-pressed', 'false')
  })

  it('submits form and navigates on valid credentials', async () => {
    await renderLogin()
    const userInput = screen.getByLabelText('아이디')
    const pwInput = screen.getByLabelText('비밀번호')
    fireEvent.change(userInput, { target: { value: 'admin' } })
    fireEvent.change(pwInput, { target: { value: 'password123' } })

    const submitBtn = screen.getByRole('button', { name: '로그인' })
    fireEvent.click(submitBtn)

    // Should show loading state
    expect(screen.getByText('로그인 중')).toBeInTheDocument()

    // Advance timer past the 800ms setTimeout
    act(() => { vi.advanceTimersByTime(1000) })

    expect(mockNavigate).toHaveBeenCalledWith('/home')
  })

  it('renders left panel content', async () => {
    await renderLogin()
    expect(screen.getByText('Admin access')).toBeInTheDocument()
    expect(screen.getByText('Minimal UI')).toBeInTheDocument()
    expect(screen.getByText('Dense Layout')).toBeInTheDocument()
    expect(screen.getByText('Brand Accent')).toBeInTheDocument()
  })

  it('renders Web Admin badge', async () => {
    await renderLogin()
    expect(screen.getByText('Web Admin')).toBeInTheDocument()
  })

  it('renders copyright text', async () => {
    await renderLogin()
    expect(screen.getByText(/2026 Hogak Co/)).toBeInTheDocument()
  })

  it('applies mounted animation after timer', async () => {
    await renderLogin()
    act(() => { vi.advanceTimersByTime(100) })
    // The component should have updated mounted state
    expect(screen.getByRole('heading', { name: '로그인' })).toBeInTheDocument()
  })
})

describe('SignupPage', () => {
  async function renderSignup() {
    const { default: SignupPage } = await import('./SignupPage')
    return render(<SignupPage />)
  }

  it('renders step 1: terms agreement', async () => {
    await renderSignup()
    expect(screen.getByText('회원가입')).toBeInTheDocument()
    expect(screen.getByText('전체 동의')).toBeInTheDocument()
    expect(screen.getByText('이용약관 동의')).toBeInTheDocument()
    expect(screen.getByText('개인정보 처리방침')).toBeInTheDocument()
    expect(screen.getByText('마케팅 수신 동의')).toBeInTheDocument()
  })

  it('renders step indicators', async () => {
    await renderSignup()
    expect(screen.getByText('약관동의')).toBeInTheDocument()
    expect(screen.getByText('정보입력')).toBeInTheDocument()
    expect(screen.getByText('관심 종목')).toBeInTheDocument()
    expect(screen.getByText('완료')).toBeInTheDocument()
  })

  it('next button is disabled until required terms are checked', async () => {
    await renderSignup()
    const nextBtn = screen.getByRole('button', { name: '다음' })
    expect(nextBtn).toBeDisabled()
  })

  it('toggle all checks all terms', async () => {
    await renderSignup()
    const allCheckLabel = screen.getByText('전체 동의')
    fireEvent.click(allCheckLabel)
    const nextBtn = screen.getByRole('button', { name: '다음' })
    expect(nextBtn).not.toBeDisabled()
  })

  it('toggle individual terms enables next when required checked', async () => {
    await renderSignup()
    fireEvent.click(screen.getByText('이용약관 동의'))
    fireEvent.click(screen.getByText('개인정보 처리방침'))
    const nextBtn = screen.getByRole('button', { name: '다음' })
    expect(nextBtn).not.toBeDisabled()
  })

  it('navigates to step 2 after accepting required terms', async () => {
    await renderSignup()
    fireEvent.click(screen.getByText('전체 동의'))
    fireEvent.click(screen.getByRole('button', { name: '다음' }))
    expect(screen.getByLabelText('이름')).toBeInTheDocument()
    expect(screen.getByLabelText('이메일')).toBeInTheDocument()
    expect(screen.getByLabelText('비밀번호')).toBeInTheDocument()
    expect(screen.getByLabelText('비밀번호 확인')).toBeInTheDocument()
    expect(screen.getByLabelText('휴대폰 번호')).toBeInTheDocument()
  })

  it('step 2: shows error for empty fields', async () => {
    await renderSignup()
    fireEvent.click(screen.getByText('전체 동의'))
    fireEvent.click(screen.getByRole('button', { name: '다음' }))
    // On step 2, click next without filling
    const btns = screen.getAllByRole('button', { name: '다음' })
    fireEvent.click(btns[0])
    expect(screen.getByText('모든 필수 항목을 입력해주세요.')).toBeInTheDocument()
  })

  it('step 2: shows error for password mismatch', async () => {
    await renderSignup()
    fireEvent.click(screen.getByText('전체 동의'))
    fireEvent.click(screen.getByRole('button', { name: '다음' }))

    fireEvent.change(screen.getByLabelText('이름'), { target: { value: '홍길동' } })
    fireEvent.change(screen.getByLabelText('이메일'), { target: { value: 'test@test.com' } })
    fireEvent.change(screen.getByLabelText('비밀번호'), { target: { value: 'password123' } })
    fireEvent.change(screen.getByLabelText('비밀번호 확인'), { target: { value: 'different' } })
    fireEvent.change(screen.getByLabelText('휴대폰 번호'), { target: { value: '01012345678' } })

    const btns = screen.getAllByRole('button', { name: '다음' })
    fireEvent.click(btns[0])
    expect(screen.getByText('비밀번호가 일치하지 않습니다.')).toBeInTheDocument()
  })

  it('step 2: shows error for short password', async () => {
    await renderSignup()
    fireEvent.click(screen.getByText('전체 동의'))
    fireEvent.click(screen.getByRole('button', { name: '다음' }))

    fireEvent.change(screen.getByLabelText('이름'), { target: { value: '홍길동' } })
    fireEvent.change(screen.getByLabelText('이메일'), { target: { value: 'test@test.com' } })
    fireEvent.change(screen.getByLabelText('비밀번호'), { target: { value: 'short' } })
    fireEvent.change(screen.getByLabelText('비밀번호 확인'), { target: { value: 'short' } })
    fireEvent.change(screen.getByLabelText('휴대폰 번호'), { target: { value: '01012345678' } })

    const btns = screen.getAllByRole('button', { name: '다음' })
    fireEvent.click(btns[0])
    expect(screen.getByText('비밀번호는 8자 이상이어야 합니다.')).toBeInTheDocument()
  })

  it('step 2: back button returns to step 1', async () => {
    await renderSignup()
    fireEvent.click(screen.getByText('전체 동의'))
    fireEvent.click(screen.getByRole('button', { name: '다음' }))
    fireEvent.click(screen.getByRole('button', { name: '이전' }))
    expect(screen.getByText('전체 동의')).toBeInTheDocument()
  })

  it('navigates through all 4 steps', async () => {
    await renderSignup()

    // Step 1: terms
    fireEvent.click(screen.getByText('전체 동의'))
    fireEvent.click(screen.getByRole('button', { name: '다음' }))

    // Step 2: fill form
    fireEvent.change(screen.getByLabelText('이름'), { target: { value: '홍길동' } })
    fireEvent.change(screen.getByLabelText('이메일'), { target: { value: 'test@test.com' } })
    fireEvent.change(screen.getByLabelText('비밀번호'), { target: { value: 'password123' } })
    fireEvent.change(screen.getByLabelText('비밀번호 확인'), { target: { value: 'password123' } })
    fireEvent.change(screen.getByLabelText('휴대폰 번호'), { target: { value: '01012345678' } })
    const btns = screen.getAllByRole('button', { name: '다음' })
    fireEvent.click(btns[0])

    // Step 3: interests
    expect(screen.getByText('관심 종목을 선택해주세요')).toBeInTheDocument()
    expect(screen.getByText('축구')).toBeInTheDocument()
    expect(screen.getByText('야구')).toBeInTheDocument()

    // Select a sport
    fireEvent.click(screen.getByText('축구'))
    expect(screen.getByText('1개 종목 선택됨')).toBeInTheDocument()

    // Select another
    fireEvent.click(screen.getByText('야구'))
    expect(screen.getByText('2개 종목 선택됨')).toBeInTheDocument()

    // Deselect
    fireEvent.click(screen.getByText('축구'))
    expect(screen.getByText('1개 종목 선택됨')).toBeInTheDocument()

    // Next shows "다음" when sports selected
    fireEvent.click(screen.getByRole('button', { name: '다음' }))

    // Step 4: complete
    expect(screen.getByText('회원가입이 완료되었습니다')).toBeInTheDocument()
    expect(screen.getByText('POCHAK의 다양한 콘텐츠를 즐겨보세요.')).toBeInTheDocument()

    // Click login button
    fireEvent.click(screen.getByText('로그인하러 가기'))
    expect(mockNavigate).toHaveBeenCalledWith('/login')
  })

  it('step 3: skip button when no sports selected', async () => {
    await renderSignup()
    fireEvent.click(screen.getByText('전체 동의'))
    fireEvent.click(screen.getByRole('button', { name: '다음' }))

    fireEvent.change(screen.getByLabelText('이름'), { target: { value: '홍길동' } })
    fireEvent.change(screen.getByLabelText('이메일'), { target: { value: 'test@test.com' } })
    fireEvent.change(screen.getByLabelText('비밀번호'), { target: { value: 'password123' } })
    fireEvent.change(screen.getByLabelText('비밀번호 확인'), { target: { value: 'password123' } })
    fireEvent.change(screen.getByLabelText('휴대폰 번호'), { target: { value: '01012345678' } })
    const btns = screen.getAllByRole('button', { name: '다음' })
    fireEvent.click(btns[0])

    // Step 3 with no selection shows "건너뛰기"
    expect(screen.getByText('건너뛰기')).toBeInTheDocument()
    fireEvent.click(screen.getByText('건너뛰기'))
    expect(screen.getByText('회원가입이 완료되었습니다')).toBeInTheDocument()
  })

  it('step 3: back button returns to step 2', async () => {
    await renderSignup()
    fireEvent.click(screen.getByText('전체 동의'))
    fireEvent.click(screen.getByRole('button', { name: '다음' }))

    fireEvent.change(screen.getByLabelText('이름'), { target: { value: '홍길동' } })
    fireEvent.change(screen.getByLabelText('이메일'), { target: { value: 'test@test.com' } })
    fireEvent.change(screen.getByLabelText('비밀번호'), { target: { value: 'password123' } })
    fireEvent.change(screen.getByLabelText('비밀번호 확인'), { target: { value: 'password123' } })
    fireEvent.change(screen.getByLabelText('휴대폰 번호'), { target: { value: '01012345678' } })
    const btns = screen.getAllByRole('button', { name: '다음' })
    fireEvent.click(btns[0])

    fireEvent.click(screen.getByRole('button', { name: '이전' }))
    expect(screen.getByLabelText('이름')).toBeInTheDocument()
  })

  it('renders login link at bottom', async () => {
    await renderSignup()
    expect(screen.getByText('이미 계정이 있으신가요? 로그인')).toBeInTheDocument()
  })
})

describe('FindIdPage', () => {
  async function renderFindId() {
    const { default: FindIdPage } = await import('./FindIdPage')
    return render(<FindIdPage />)
  }

  it('renders page title and tabs', async () => {
    await renderFindId()
    expect(screen.getByText('계정 찾기')).toBeInTheDocument()
    expect(screen.getByText('아이디 찾기')).toBeInTheDocument()
    expect(screen.getByText('비밀번호 재설정')).toBeInTheDocument()
  })

  it('renders phone input on find-id tab', async () => {
    await renderFindId()
    expect(screen.getByLabelText('휴대폰 번호')).toBeInTheDocument()
    expect(screen.getByText('인증번호 발송')).toBeInTheDocument()
  })

  it('send code button is disabled when phone is empty', async () => {
    await renderFindId()
    const sendBtn = screen.getByText('인증번호 발송')
    expect(sendBtn).toBeDisabled()
  })

  it('sends verification code and shows code input', async () => {
    await renderFindId()
    const phoneInput = screen.getByLabelText('휴대폰 번호')
    fireEvent.change(phoneInput, { target: { value: '01012345678' } })
    fireEvent.click(screen.getByText('인증번호 발송'))
    expect(screen.getByLabelText('인증번호')).toBeInTheDocument()
    expect(screen.getByText('확인')).toBeInTheDocument()
  })

  it('verifies code and shows found ID', async () => {
    await renderFindId()
    const phoneInput = screen.getByLabelText('휴대폰 번호')
    fireEvent.change(phoneInput, { target: { value: '01012345678' } })
    fireEvent.click(screen.getByText('인증번호 발송'))

    const codeInput = screen.getByLabelText('인증번호')
    fireEvent.change(codeInput, { target: { value: '123456' } })
    fireEvent.click(screen.getByText('확인'))

    expect(screen.getByText('조회된 아이디')).toBeInTheDocument()
    expect(screen.getByText('user***@example.com')).toBeInTheDocument()
  })

  it('confirm button disabled with empty code', async () => {
    await renderFindId()
    fireEvent.change(screen.getByLabelText('휴대폰 번호'), { target: { value: '01012345678' } })
    fireEvent.click(screen.getByText('인증번호 발송'))
    expect(screen.getByText('확인')).toBeDisabled()
  })

  it('renders reset-pw tab trigger', async () => {
    vi.useRealTimers()
    await renderFindId()
    // The tabs render with both triggers visible
    const tabs = screen.getAllByRole('tab')
    expect(tabs.length).toBe(2)
    expect(tabs[1]).toHaveTextContent('비밀번호 재설정')
  })

  it('renders login link', async () => {
    await renderFindId()
    expect(screen.getByText('로그인으로 돌아가기')).toBeInTheDocument()
  })

  it('renders POCHAK logo', async () => {
    await renderFindId()
    expect(screen.getByAltText('POCHAK')).toBeInTheDocument()
  })
})
