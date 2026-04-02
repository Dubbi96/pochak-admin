import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'

const mockGet = vi.fn()

vi.mock('@/services/api-client', () => ({
  pochakApi: {
    get: (...args: unknown[]) => mockGet(...args),
    post: vi.fn(),
  },
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useHome', () => {
  it('should return API data when available', async () => {
    mockGet.mockResolvedValueOnce({
      banners: [{ id: 'api-b1', title: 'API Banner' }],
      liveNow: [],
      recommended: [],
    })

    const { useHome } = await import('./useApi')
    const { result } = renderHook(() => useHome())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.data.banners).toHaveLength(1)
    expect(result.current.data.banners[0].title).toBe('API Banner')
  })

  it('should return empty arrays when API fails', async () => {
    mockGet.mockResolvedValueOnce(null)

    const { useHome } = await import('./useApi')
    const { result } = renderHook(() => useHome())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.data).not.toBeNull()
    expect(result.current.data.banners).toHaveLength(0)
    expect(result.current.data.liveNow).toHaveLength(0)
    expect(result.current.data.recommended).toHaveLength(0)
  })
})

describe('useContents', () => {
  it('should fetch contents with filters', async () => {
    mockGet.mockResolvedValueOnce([
      { id: 'api-1', title: 'API Content', type: 'LIVE' },
    ])

    const { useContents } = await import('./useApi')
    const { result } = renderHook(() => useContents('LIVE', '축구', '최신순'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(mockGet).toHaveBeenCalledWith(
      '/api/v1/contents/live',
      expect.objectContaining({ sport: '축구', sort: '최신순' }),
    )
  })

  it('should return empty array when API fails', async () => {
    mockGet.mockResolvedValueOnce(null)

    const { useContents } = await import('./useApi')
    const { result } = renderHook(() => useContents('LIVE'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.data).toEqual([])
  })
})

describe('useSearch', () => {
  it('should not fetch with empty query', async () => {
    const { useSearch } = await import('./useApi')
    const { result } = renderHook(() => useSearch(''))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(mockGet).not.toHaveBeenCalled()
    expect(result.current.data).toEqual([])
  })

  it('should search via API with query', async () => {
    mockGet.mockResolvedValueOnce([{ id: '1', title: 'Search Result' }])

    const { useSearch } = await import('./useApi')
    const { result } = renderHook(() => useSearch('축구'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(mockGet).toHaveBeenCalledWith(
      '/api/v1/search',
      expect.objectContaining({ q: '축구' }),
    )
  })
})

describe('useTeams', () => {
  it('should return empty array when API fails', async () => {
    mockGet.mockResolvedValueOnce(null)

    const { useTeams } = await import('./useApi')
    const { result } = renderHook(() => useTeams())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.data).toEqual([])
  })
})
