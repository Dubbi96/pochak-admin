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

describe('useBanners', () => {
  it('should return banners from API', async () => {
    mockGet.mockResolvedValueOnce([{ id: 'b1', title: 'Banner 1' }])
    const { useBanners } = await import('./useApi')
    const { result } = renderHook(() => useBanners())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.data).toHaveLength(1)
    expect(result.current.data[0].title).toBe('Banner 1')
  })

  it('should return empty array on failure', async () => {
    mockGet.mockResolvedValueOnce(null)
    const { useBanners } = await import('./useApi')
    const { result } = renderHook(() => useBanners())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.data).toEqual([])
  })
})

describe('useContentDetail', () => {
  it('should fetch content by type and id', async () => {
    mockGet.mockResolvedValueOnce({ id: 'v1', title: 'Video 1', type: 'VOD' })
    const { useContentDetail } = await import('./useApi')
    const { result } = renderHook(() => useContentDetail('vod', 'v1'))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(mockGet).toHaveBeenCalledWith('/api/v1/contents/vod/v1')
    expect(result.current.data?.title).toBe('Video 1')
  })

  it('should return null on failure', async () => {
    mockGet.mockResolvedValueOnce(null)
    const { useContentDetail } = await import('./useApi')
    const { result } = renderHook(() => useContentDetail('vod', 'bad'))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.data).toBeNull()
  })
})

describe('useTeamDetail', () => {
  it('should fetch team detail', async () => {
    mockGet.mockResolvedValueOnce({ id: 't1', name: 'Team 1', color: '#ff0000', initial: 'T', subtitle: '야구', followers: 50 })
    const { useTeamDetail } = await import('./useApi')
    const { result } = renderHook(() => useTeamDetail('t1'))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.data?.name).toBe('Team 1')
  })
})

describe('useCompetitions', () => {
  it('should fetch competitions list', async () => {
    mockGet.mockResolvedValueOnce([{ id: 'c1', name: 'Comp 1' }])
    const { useCompetitions } = await import('./useApi')
    const { result } = renderHook(() => useCompetitions())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.data).toHaveLength(1)
  })

  it('should return empty array on failure', async () => {
    mockGet.mockResolvedValueOnce(null)
    const { useCompetitions } = await import('./useApi')
    const { result } = renderHook(() => useCompetitions())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.data).toEqual([])
  })
})

describe('useCompetitionDetail', () => {
  it('should fetch competition detail', async () => {
    mockGet.mockResolvedValueOnce({ id: 'c1', name: 'Comp Detail' })
    const { useCompetitionDetail } = await import('./useApi')
    const { result } = renderHook(() => useCompetitionDetail('c1'))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.data?.name).toBe('Comp Detail')
  })
})

describe('useSchedule', () => {
  it('should fetch schedule data', async () => {
    mockGet.mockResolvedValueOnce([{ id: 's1', date: '2026-01-01' }])
    const { useSchedule } = await import('./useApi')
    const { result } = renderHook(() => useSchedule('축구', 2026, 0))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(mockGet).toHaveBeenCalledWith('/api/v1/schedule', expect.objectContaining({ sport: '축구', year: '2026', month: '1' }))
  })

  it('should handle no params', async () => {
    mockGet.mockResolvedValueOnce([])
    const { useSchedule } = await import('./useApi')
    const { result } = renderHook(() => useSchedule())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.data).toEqual([])
  })

  it('should skip sport param when 전체', async () => {
    mockGet.mockResolvedValueOnce([])
    const { useSchedule } = await import('./useApi')
    renderHook(() => useSchedule('전체'))
    await waitFor(() => expect(mockGet).toHaveBeenCalled())
  })
})

describe('useMyPage', () => {
  it('should fetch my page data', async () => {
    mockGet.mockResolvedValueOnce({ user: { nickname: 'test' } })
    const { useMyPage } = await import('./useApi')
    const { result } = renderHook(() => useMyPage())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.data).not.toBeNull()
  })

  it('should return null on failure', async () => {
    mockGet.mockResolvedValueOnce(null)
    const { useMyPage } = await import('./useApi')
    const { result } = renderHook(() => useMyPage())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.data).toBeNull()
  })
})

describe('useNotifications', () => {
  it('should fetch notifications', async () => {
    mockGet.mockResolvedValueOnce([{ id: 'n1', message: 'Notif' }])
    const { useNotifications } = await import('./useApi')
    const { result } = renderHook(() => useNotifications())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.data).toHaveLength(1)
  })
})

describe('useProducts', () => {
  it('should fetch products', async () => {
    mockGet.mockResolvedValueOnce([{ id: 'p1', name: 'Product' }])
    const { useProducts } = await import('./useApi')
    const { result } = renderHook(() => useProducts('이용권'))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(mockGet).toHaveBeenCalledWith('/api/v1/products', expect.objectContaining({ productType: '이용권', isActive: 'true' }))
  })

  it('should not include productType for 전체', async () => {
    mockGet.mockResolvedValueOnce([])
    const { useProducts } = await import('./useApi')
    renderHook(() => useProducts('전체'))
    await waitFor(() => expect(mockGet).toHaveBeenCalled())
    const callArgs = mockGet.mock.calls[0]
    expect(callArgs[1]).not.toHaveProperty('productType')
  })
})

describe('useVenues', () => {
  it('should fetch venues with keyword', async () => {
    mockGet.mockResolvedValueOnce([{ id: 'v1', name: 'Venue' }])
    const { useVenues } = await import('./useApi')
    const { result } = renderHook(() => useVenues('잠실', 's1'))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(mockGet).toHaveBeenCalledWith('/api/v1/venues/search', expect.objectContaining({ keyword: '잠실', sportId: 's1' }))
  })

  it('should fetch without params', async () => {
    mockGet.mockResolvedValueOnce([])
    const { useVenues } = await import('./useApi')
    const { result } = renderHook(() => useVenues())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.data).toEqual([])
  })
})

describe('useClubs', () => {
  it('should fetch clubs', async () => {
    mockGet.mockResolvedValueOnce([{ id: 'cl1', name: 'Club' }])
    const { useClubs } = await import('./useApi')
    const { result } = renderHook(() => useClubs())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.data).toHaveLength(1)
  })
})

describe('useSearchSuggestions', () => {
  it('should return empty suggestions for empty query', async () => {
    const { useSearchSuggestions } = await import('./useApi')
    const { result } = renderHook(() => useSearchSuggestions(''))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.data).toEqual({ contents: [], teams: [], competitions: [] })
    expect(mockGet).not.toHaveBeenCalled()
  })

  it('should fetch suggestions for non-empty query', async () => {
    mockGet.mockResolvedValueOnce({ contents: [{ id: '1' }], teams: [], competitions: [] })
    const { useSearchSuggestions } = await import('./useApi')
    const { result } = renderHook(() => useSearchSuggestions('축구'))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(mockGet).toHaveBeenCalledWith('/api/v1/search/suggestions', { q: '축구' })
  })
})

describe('useTrendingSearches', () => {
  it('should fetch trending searches', async () => {
    mockGet.mockResolvedValueOnce(['축구', '야구', '농구'])
    const { useTrendingSearches } = await import('./useApi')
    const { result } = renderHook(() => useTrendingSearches())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.data).toEqual(['축구', '야구', '농구'])
  })
})

describe('useContents with different params', () => {
  it('should use /api/v1/contents/live for no type', async () => {
    mockGet.mockResolvedValueOnce([])
    const { useContents } = await import('./useApi')
    renderHook(() => useContents())
    await waitFor(() => expect(mockGet).toHaveBeenCalled())
    expect(mockGet.mock.calls[0][0]).toBe('/api/v1/contents/live')
  })

  it('should use /api/v1/contents/vod for VOD type', async () => {
    mockGet.mockResolvedValueOnce([])
    const { useContents } = await import('./useApi')
    renderHook(() => useContents('VOD'))
    await waitFor(() => expect(mockGet).toHaveBeenCalled())
    expect(mockGet.mock.calls[0][0]).toBe('/api/v1/contents/vod')
  })

  it('should skip sport when 전체', async () => {
    mockGet.mockResolvedValueOnce([])
    const { useContents } = await import('./useApi')
    renderHook(() => useContents('VOD', '전체', '최신순'))
    await waitFor(() => expect(mockGet).toHaveBeenCalled())
    const params = mockGet.mock.calls[0][1]
    expect(params).not.toHaveProperty('sport')
    expect(params).toHaveProperty('sort', '최신순')
  })

  it('should include sport when specific', async () => {
    mockGet.mockResolvedValueOnce([])
    const { useContents } = await import('./useApi')
    renderHook(() => useContents('LIVE', '축구'))
    await waitFor(() => expect(mockGet).toHaveBeenCalled())
    const params = mockGet.mock.calls[0][1]
    expect(params).toHaveProperty('sport', '축구')
  })
})

describe('useFetch error handling', () => {
  it('should set error state on rejection', async () => {
    mockGet.mockRejectedValueOnce(new Error('Network fail'))
    const { useHome } = await import('./useApi')
    const { result } = renderHook(() => useHome())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toBe('Network fail')
    expect(result.current.data.banners).toEqual([])
  })

  it('should set "Unknown error" for non-Error rejection', async () => {
    mockGet.mockRejectedValueOnce('string error')
    const { useBanners } = await import('./useApi')
    const { result } = renderHook(() => useBanners())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toBe('Unknown error')
  })
})
