import apiClient from './client';
import {
  SearchResults,
  SearchSuggestionItem,
  TrendingSearchTerm,
  mockSearchTeams,
  mockSearchClubs,
  mockSearchLives,
  mockSearchSchedules,
  mockSearchCompetitions,
  mockSearchVideos,
  mockSearchClips,
  mockTrendingSearches,
  getSearchSuggestions as getMockSuggestions,
} from '../services/searchApi';

// ─── Extensible interface ─────────────────────────────────────────
// Future migration: swap SearchService to call pochak-content search endpoint.
// Interface remains stable for all consumers.

export interface ISearchService {
  /** Full-text search across all content types */
  search(query: string): Promise<SearchResults>;
  /** Get auto-complete suggestions as user types */
  getSuggestions(query: string): Promise<SearchSuggestionItem[]>;
  /** Get trending/popular search terms */
  getTrending(): Promise<TrendingSearchTerm[]>;
}

// ─── Concrete implementation ──────────────────────────────────────

class SearchService implements ISearchService {
  async search(
    query: string,
    type?: string,
    page: number = 0,
  ): Promise<SearchResults> {
    try {
      const res = await apiClient.get('/search', {
        params: { q: query, type, page, size: 20 },
      });
      const d = res.data.data ?? res.data;
      return {
        teams: d.teams ?? [],
        clubs: d.clubs ?? [],
        lives: d.lives ?? [],
        schedules: d.schedules ?? [],
        competitions: d.competitions ?? [],
        videos: d.videos ?? [],
        clips: d.clips ?? [],
      };
    } catch {
      // Graceful fallback: return empty results on error
      return {
        teams: [],
        clubs: [],
        lives: [],
        schedules: [],
        competitions: [],
        videos: [],
        clips: [],
      };
    }
  }

  async getSuggestions(query: string): Promise<SearchSuggestionItem[]> {
    try {
      const res = await apiClient.get('/search/suggest', { params: { q: query } });
      return res.data.data ?? res.data ?? [];
    } catch {
      return getMockSuggestions(query);
    }
  }

  async getTrending(): Promise<TrendingSearchTerm[]> {
    try {
      const res = await apiClient.get('/search/trending');
      return res.data.data ?? res.data ?? [];
    } catch {
      return mockTrendingSearches;
    }
  }
}

export const searchService: ISearchService = new SearchService();
