import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useAuthStore } from './authStore'

vi.mock('@/services/api-client', () => ({
  pochakApi: {
    post: vi.fn(),
    get: vi.fn(),
  },
}))

beforeEach(() => {
  useAuthStore.setState({
    token: null,
    refreshToken: null,
    user: null,
  })
})

describe('authStore', () => {
  it('should start as logged out', () => {
    const state = useAuthStore.getState()
    expect(state.isLoggedIn()).toBe(false)
    expect(state.token).toBeNull()
    expect(state.user).toBeNull()
  })

  it('should set tokens on successful login', async () => {
    const { pochakApi } = await import('@/services/api-client')
    vi.mocked(pochakApi.post).mockResolvedValueOnce({
      accessToken: 'jwt-123',
      refreshToken: 'refresh-456',
      user: { id: 1, nickname: 'pochak', email: 'test@test.com' },
    })

    const result = await useAuthStore.getState().login('user', 'pass')

    expect(result).toBe(true)
    expect(useAuthStore.getState().token).toBe('jwt-123')
    expect(useAuthStore.getState().refreshToken).toBe('refresh-456')
    expect(useAuthStore.getState().user?.nickname).toBe('pochak')
    expect(useAuthStore.getState().isLoggedIn()).toBe(true)
  })

  it('should return false on failed login', async () => {
    const { pochakApi } = await import('@/services/api-client')
    vi.mocked(pochakApi.post).mockResolvedValueOnce(null)

    const result = await useAuthStore.getState().login('bad', 'bad')

    expect(result).toBe(false)
    expect(useAuthStore.getState().isLoggedIn()).toBe(false)
  })

  it('should clear state on logout', async () => {
    useAuthStore.setState({
      token: 'jwt',
      refreshToken: 'ref',
      user: { id: 1, nickname: 'user', email: 'e@e.com' },
    })

    const { pochakApi } = await import('@/services/api-client')
    vi.mocked(pochakApi.post).mockResolvedValueOnce(null)

    await useAuthStore.getState().logout()

    expect(useAuthStore.getState().token).toBeNull()
    expect(useAuthStore.getState().user).toBeNull()
    expect(useAuthStore.getState().isLoggedIn()).toBe(false)
  })

  it('should update user profile', () => {
    useAuthStore.setState({
      user: { id: 1, nickname: 'old', email: 'old@test.com' },
    })

    useAuthStore.getState().updateUser({ nickname: 'new' })

    expect(useAuthStore.getState().user?.nickname).toBe('new')
    expect(useAuthStore.getState().user?.email).toBe('old@test.com')
  })
})
