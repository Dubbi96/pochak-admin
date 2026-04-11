/**
 * Deep coverage tests for api-client.ts
 * Targets uncovered lines: 18-45, 75, 85, 95
 * Exercises: token provider, put/delete methods, envelope unwrapping
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

describe('api-client token provider and methods', () => {
  const mockAxiosGet = vi.fn()
  const mockAxiosPost = vi.fn()
  const mockAxiosPut = vi.fn()
  const mockAxiosDelete = vi.fn()
  let capturedTokenProvider: any = null
  let pochakApi: any

  beforeEach(async () => {
    vi.clearAllMocks()
    capturedTokenProvider = null

    // Reset module registry to force re-evaluation
    vi.resetModules()

    vi.doMock('@pochak/api-client', () => ({
      createApiClient: () => ({
        get: mockAxiosGet,
        post: mockAxiosPost,
        put: mockAxiosPut,
        delete: mockAxiosDelete,
      }),
      setTokenProvider: (provider: any) => {
        capturedTokenProvider = provider
      },
    }))

    const mod = await import('./api-client')
    pochakApi = mod.pochakApi
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Token provider - getAccessToken', () => {
    it('returns token from valid localStorage data', () => {
      const authData = { state: { token: 'access-123', refreshToken: 'refresh-456' } }
      ;(window.localStorage.getItem as any).mockReturnValueOnce(JSON.stringify(authData))
      expect(capturedTokenProvider.getAccessToken()).toBe('access-123')
    })

    it('returns null when localStorage is empty', () => {
      ;(window.localStorage.getItem as any).mockReturnValueOnce(null)
      expect(capturedTokenProvider.getAccessToken()).toBeNull()
    })

    it('returns null on JSON parse error', () => {
      ;(window.localStorage.getItem as any).mockReturnValueOnce('{bad json')
      expect(capturedTokenProvider.getAccessToken()).toBeNull()
    })

    it('returns null when state has no token', () => {
      ;(window.localStorage.getItem as any).mockReturnValueOnce(JSON.stringify({ state: {} }))
      expect(capturedTokenProvider.getAccessToken()).toBeNull()
    })
  })

  describe('Token provider - getRefreshToken', () => {
    it('returns refresh token from valid data', () => {
      const authData = { state: { token: 'a', refreshToken: 'refresh-789' } }
      ;(window.localStorage.getItem as any).mockReturnValueOnce(JSON.stringify(authData))
      expect(capturedTokenProvider.getRefreshToken()).toBe('refresh-789')
    })

    it('returns null when localStorage is empty', () => {
      ;(window.localStorage.getItem as any).mockReturnValueOnce(null)
      expect(capturedTokenProvider.getRefreshToken()).toBeNull()
    })

    it('returns null on parse error', () => {
      ;(window.localStorage.getItem as any).mockReturnValueOnce('invalid')
      expect(capturedTokenProvider.getRefreshToken()).toBeNull()
    })
  })

  describe('Token provider - onTokenRefreshed', () => {
    it('updates tokens in localStorage', () => {
      const existing = { state: { token: 'old', refreshToken: 'old-refresh' } }
      ;(window.localStorage.getItem as any).mockReturnValueOnce(JSON.stringify(existing))
      capturedTokenProvider.onTokenRefreshed('new-access', 'new-refresh')
      expect(window.localStorage.setItem).toHaveBeenCalled()
      const call = (window.localStorage.setItem as any).mock.calls.find(
        (c: string[]) => c[0] === 'pochak-auth'
      )
      if (call) {
        const savedData = JSON.parse(call[1])
        expect(savedData.state.token).toBe('new-access')
        expect(savedData.state.refreshToken).toBe('new-refresh')
      }
    })

    it('handles missing state gracefully', () => {
      ;(window.localStorage.getItem as any).mockReturnValueOnce('{}')
      expect(() => capturedTokenProvider.onTokenRefreshed('a', 'b')).not.toThrow()
    })

    it('handles parse error gracefully', () => {
      ;(window.localStorage.getItem as any).mockReturnValueOnce('bad')
      expect(() => capturedTokenProvider.onTokenRefreshed('a', 'b')).not.toThrow()
    })
  })

  describe('Token provider - onAuthError', () => {
    it('removes auth data from localStorage', () => {
      capturedTokenProvider.onAuthError()
      expect(window.localStorage.removeItem).toHaveBeenCalledWith('pochak-auth')
    })
  })

  describe('pochakApi.put', () => {
    it('unwraps data envelope', async () => {
      mockAxiosPut.mockResolvedValueOnce({ data: { data: { updated: true } } })
      const result = await pochakApi.put('/test', { x: 1 })
      expect(result).toEqual({ updated: true })
    })

    it('returns raw data when no envelope', async () => {
      mockAxiosPut.mockResolvedValueOnce({ data: { status: 'ok' } })
      const result = await pochakApi.put('/test')
      expect(result).toEqual({ status: 'ok' })
    })

    it('returns null on error', async () => {
      mockAxiosPut.mockRejectedValueOnce(new Error('fail'))
      const result = await pochakApi.put('/test', {})
      expect(result).toBeNull()
    })
  })

  describe('pochakApi.delete', () => {
    it('unwraps data envelope', async () => {
      mockAxiosDelete.mockResolvedValueOnce({ data: { data: null } })
      const result = await pochakApi.delete('/test')
      expect(result).toBeNull()
    })

    it('returns raw data when no envelope', async () => {
      mockAxiosDelete.mockResolvedValueOnce({ data: { deleted: true } })
      const result = await pochakApi.delete('/test')
      expect(result).toEqual({ deleted: true })
    })

    it('returns null on error', async () => {
      mockAxiosDelete.mockRejectedValueOnce(new Error('fail'))
      const result = await pochakApi.delete('/test')
      expect(result).toBeNull()
    })
  })

  describe('pochakApi.get edge cases', () => {
    it('handles null response data', async () => {
      mockAxiosGet.mockResolvedValueOnce({ data: null })
      const result = await pochakApi.get('/test')
      expect(result).toBeNull()
    })

    it('handles primitive response', async () => {
      mockAxiosGet.mockResolvedValueOnce({ data: 42 })
      const result = await pochakApi.get('/test')
      expect(result).toBe(42)
    })
  })

  describe('pochakApi.post edge cases', () => {
    it('handles null body', async () => {
      mockAxiosPost.mockResolvedValueOnce({ data: { data: 'ok' } })
      const result = await pochakApi.post('/test')
      expect(result).toBe('ok')
    })
  })
})
