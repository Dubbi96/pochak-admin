import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock the shared api-client before importing
const mockAxiosGet = vi.fn()
const mockAxiosPost = vi.fn()
const mockAxiosPut = vi.fn()
const mockAxiosDelete = vi.fn()

vi.mock('@pochak/api-client', () => ({
  createApiClient: () => ({
    get: mockAxiosGet,
    post: mockAxiosPost,
    put: mockAxiosPut,
    delete: mockAxiosDelete,
  }),
  setTokenProvider: vi.fn(),
}))

let pochakApi: typeof import('./api-client').pochakApi

beforeEach(async () => {
  vi.clearAllMocks()
  const mod = await import('./api-client')
  pochakApi = mod.pochakApi
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('pochakApi', () => {
  describe('get()', () => {
    it('should make GET request and unwrap envelope', async () => {
      mockAxiosGet.mockResolvedValueOnce({
        data: { data: { id: 1, name: 'test' } },
      })

      const result = await pochakApi.get('/api/v1/home')

      expect(mockAxiosGet).toHaveBeenCalledWith('/api/v1/home', { params: undefined })
      expect(result).toEqual({ id: 1, name: 'test' })
    })

    it('should pass query params', async () => {
      mockAxiosGet.mockResolvedValueOnce({
        data: { data: [] },
      })

      await pochakApi.get('/api/v1/contents', { type: 'LIVE', page: '0' })

      expect(mockAxiosGet).toHaveBeenCalledWith('/api/v1/contents', {
        params: { type: 'LIVE', page: '0' },
      })
    })

    it('should return null on error', async () => {
      mockAxiosGet.mockRejectedValueOnce(new Error('Network error'))

      const result = await pochakApi.get('/api/v1/home')

      expect(result).toBeNull()
    })

    it('should return raw response when no data envelope', async () => {
      mockAxiosGet.mockResolvedValueOnce({
        data: { items: [1, 2] },
      })

      const result = await pochakApi.get('/api/v1/test')
      expect(result).toEqual({ items: [1, 2] })
    })
  })

  describe('post()', () => {
    it('should make POST request with JSON body and unwrap envelope', async () => {
      mockAxiosPost.mockResolvedValueOnce({
        data: { data: { accessToken: 'abc' } },
      })

      const result = await pochakApi.post('/api/v1/auth/login', {
        loginId: 'user',
        password: 'pass',
      })

      expect(mockAxiosPost).toHaveBeenCalledWith('/api/v1/auth/login', {
        loginId: 'user',
        password: 'pass',
      })
      expect(result).toEqual({ accessToken: 'abc' })
    })
  })

  describe('put()', () => {
    it('should make PUT request', async () => {
      mockAxiosPut.mockResolvedValueOnce({
        data: { data: { updated: true } },
      })

      const result = await pochakApi.put('/api/v1/users/me', { nickname: 'new' })

      expect(mockAxiosPut).toHaveBeenCalledWith('/api/v1/users/me', { nickname: 'new' })
      expect(result).toEqual({ updated: true })
    })
  })

  describe('delete()', () => {
    it('should make DELETE request', async () => {
      mockAxiosDelete.mockResolvedValueOnce({
        data: { data: null },
      })

      await pochakApi.delete('/api/v1/follows?targetId=1')

      expect(mockAxiosDelete).toHaveBeenCalledWith('/api/v1/follows?targetId=1')
    })
  })
})
