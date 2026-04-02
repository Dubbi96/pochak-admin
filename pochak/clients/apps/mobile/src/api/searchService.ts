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
  async search(query: string): Promise<SearchResults> {
    // TODO: Phase 5+ — return apiClient.get('/search', { params: { q: query } }).then(r => r.data);
    const lowerQuery = query.toLowerCase().trim();
    return {
      teams: mockSearchTeams.filter(t => t.name.toLowerCase().includes(lowerQuery)),
      clubs: mockSearchClubs.filter(c => c.name.toLowerCase().includes(lowerQuery)),
      lives: mockSearchLives,
      schedules: mockSearchSchedules,
      competitions: mockSearchCompetitions.filter(c => c.title.toLowerCase().includes(lowerQuery)),
      videos: mockSearchVideos.filter(v => v.title.toLowerCase().includes(lowerQuery)),
      clips: mockSearchClips.filter(c => c.title.toLowerCase().includes(lowerQuery)),
    };
  }

  async getSuggestions(query: string): Promise<SearchSuggestionItem[]> {
    // TODO: Phase 5+ — return apiClient.get('/search/suggest', { params: { q: query } }).then(r => r.data);
    return getMockSuggestions(query);
  }

  async getTrending(): Promise<TrendingSearchTerm[]> {
    // TODO: Phase 5+ — return apiClient.get('/search/trending').then(r => r.data);
    return mockTrendingSearches;
  }
}

export const searchService: ISearchService = new SearchService();
