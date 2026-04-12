import { useQuery } from '@tanstack/react-query';
import {
  fetchHomeBanners,
  fetchCompetitions,
  fetchPopularClips,
  fetchLiveContents,
  fetchVodContents,
  fetchPopularClubs,
  fetchPopularChannels,
  fetchTrendingSearches,
  fetchLiveMatches,
} from '@/services/webApi';

/** Extra staleness on top of queryClient defaults — reduces duplicate traffic when navigating between pages. */
const STALE_MS = 120_000;

export const publicWebQueryKeys = {
  homeBanners: ['publicWeb', 'homeBanners'] as const,
  competitions: ['publicWeb', 'competitions'] as const,
  popularClips: ['publicWeb', 'popularClips'] as const,
  contentsLive: ['publicWeb', 'contentsLive'] as const,
  contentsVod: ['publicWeb', 'contentsVod'] as const,
  clubsPopular: ['publicWeb', 'clubsPopular'] as const,
  channelsPopular: ['publicWeb', 'channelsPopular'] as const,
  trendingSearches: ['publicWeb', 'trendingSearches'] as const,
  liveMatchesBroadcasting: ['publicWeb', 'liveMatches', 'broadcasting'] as const,
};

function requiredData<T>(promise: Promise<T | null>, message: string): Promise<T> {
  return promise.then((d) => {
    if (d == null) throw new Error(message);
    return d;
  });
}

export function useHomeBannersQuery() {
  return useQuery({
    queryKey: publicWebQueryKeys.homeBanners,
    queryFn: () => requiredData(fetchHomeBanners(), 'homeBanners'),
    staleTime: STALE_MS,
  });
}

export function useCompetitionsQuery() {
  return useQuery({
    queryKey: publicWebQueryKeys.competitions,
    queryFn: () => requiredData(fetchCompetitions(), 'competitions'),
    staleTime: STALE_MS,
  });
}

export function usePopularClipsQuery() {
  return useQuery({
    queryKey: publicWebQueryKeys.popularClips,
    queryFn: () => requiredData(fetchPopularClips(), 'popularClips'),
    staleTime: STALE_MS,
  });
}

export function useLiveContentsQuery() {
  return useQuery({
    queryKey: publicWebQueryKeys.contentsLive,
    queryFn: () => fetchLiveContents().then((d) => d ?? []),
    staleTime: STALE_MS,
  });
}

export function useVodContentsQuery() {
  return useQuery({
    queryKey: publicWebQueryKeys.contentsVod,
    queryFn: () => fetchVodContents().then((d) => d ?? []),
    staleTime: STALE_MS,
  });
}

export function usePopularClubsQuery() {
  return useQuery({
    queryKey: publicWebQueryKeys.clubsPopular,
    queryFn: () => fetchPopularClubs().then((d) => d ?? []),
    staleTime: STALE_MS,
  });
}

export function usePopularChannelsQuery() {
  return useQuery({
    queryKey: publicWebQueryKeys.channelsPopular,
    queryFn: () => fetchPopularChannels().then((d) => d ?? []),
    staleTime: STALE_MS,
  });
}

export function useTrendingSearchesQuery() {
  return useQuery({
    queryKey: publicWebQueryKeys.trendingSearches,
    queryFn: () => fetchTrendingSearches().then((d) => d ?? []),
    staleTime: STALE_MS,
  });
}

export function useLiveMatchesQuery() {
  return useQuery({
    queryKey: publicWebQueryKeys.liveMatchesBroadcasting,
    queryFn: () => fetchLiveMatches().then((d) => d ?? []),
    staleTime: STALE_MS,
  });
}
