// Mock data for Search screen

export interface SearchTeamItem {
  id: string;
  name: string;
  logoInitial: string;
  sport: string;
}

export interface SearchClubItem {
  id: string;
  name: string;
  logoInitial: string;
  description: string;
  isFavorite: boolean;
  memberCount: number;
}

export interface SearchLiveItem {
  id: string;
  thumbnailUrl: string;
  teamHome: string;
  teamAway: string;
  league: string;
  time: string;
  viewerCount: number;
}

export interface SearchScheduleItem {
  id: string;
  thumbnailUrl: string;
  teamHome: string;
  teamAway: string;
  league: string;
  date: string;
  time: string;
  status: string;
}

export interface SearchCompetitionItem {
  id: string;
  thumbnailUrl: string;
  title: string;
  date: string;
  sport: string;
  status: string;
}

export interface SearchVideoItem {
  id: string;
  thumbnailUrl: string;
  title: string;
  description: string;
  duration: string;
  date: string;
}

export interface SearchClipItem {
  id: string;
  thumbnailUrl: string;
  title: string;
  description: string;
  viewCount: number;
  duration: string;
}

export interface SearchResults {
  teams: SearchTeamItem[];
  clubs: SearchClubItem[];
  lives: SearchLiveItem[];
  schedules: SearchScheduleItem[];
  competitions: SearchCompetitionItem[];
  videos: SearchVideoItem[];
  clips: SearchClipItem[];
}

// --- Mock Data ---

export const mockSearchTeams: SearchTeamItem[] = [
  {id: 'st-1', name: '동대문 리틀야구', logoInitial: '동', sport: '야구'},
  {id: 'st-2', name: '서울 FC U12', logoInitial: '서', sport: '축구'},
  {id: 'st-3', name: '부산 농구클럽', logoInitial: '부', sport: '농구'},
  {id: 'st-4', name: '강남 리틀야구', logoInitial: '강', sport: '야구'},
  {id: 'st-5', name: '인천 유나이티드 U12', logoInitial: '인', sport: '축구'},
  {id: 'st-6', name: '수원 삼성 U15', logoInitial: '수', sport: '축구'},
  {id: 'st-7', name: '대구 FC 유스', logoInitial: '대', sport: '축구'},
  {id: 'st-8', name: '전북 현대 U15', logoInitial: '전', sport: '축구'},
];

export const mockSearchClubs: SearchClubItem[] = [
  {
    id: 'sc-1',
    name: '동대문 리틀야구 팬클럽',
    logoInitial: '동',
    description: '동대문 리틀야구를 응원하는 학부모 커뮤니티',
    isFavorite: true,
    memberCount: 245,
  },
  {
    id: 'sc-2',
    name: '서울 FC U12 서포터즈',
    logoInitial: '서',
    description: '서울 FC 유소년 축구팀 서포터즈',
    isFavorite: false,
    memberCount: 189,
  },
  {
    id: 'sc-3',
    name: '포착 야구 커뮤니티',
    logoInitial: '포',
    description: '유소년 야구를 사랑하는 사람들의 모임',
    isFavorite: true,
    memberCount: 1023,
  },
];

export const mockSearchLives: SearchLiveItem[] = [
  {
    id: 'sl-1',
    thumbnailUrl: 'https://via.placeholder.com/200x120/1E1E1E/FF0000?text=LIVE',
    teamHome: '동대문 리틀야구',
    teamAway: '강남 리틀야구',
    league: 'MLB컵 U10',
    time: '3회초',
    viewerCount: 523,
  },
  {
    id: 'sl-2',
    thumbnailUrl: 'https://via.placeholder.com/200x120/1E1E1E/FF0000?text=LIVE',
    teamHome: '서울 FC U12',
    teamAway: '인천 유나이티드 U12',
    league: '유소년 축구대회',
    time: '전반 25분',
    viewerCount: 1247,
  },
];

export const mockSearchSchedules: SearchScheduleItem[] = [
  {
    id: 'ss-1',
    thumbnailUrl: 'https://via.placeholder.com/200x120/1E1E1E/00C853?text=경기',
    teamHome: '수원 삼성 U15',
    teamAway: '전북 현대 U15',
    league: 'K리그 주니어',
    date: '2026.03.22',
    time: '14:00',
    status: '예정',
  },
  {
    id: 'ss-2',
    thumbnailUrl: 'https://via.placeholder.com/200x120/1E1E1E/00C853?text=경기',
    teamHome: '부산 농구클럽',
    teamAway: '대구 농구클럽',
    league: '포착컵 농구',
    date: '2026.03.23',
    time: '16:00',
    status: '예정',
  },
];

export const mockSearchCompetitions: SearchCompetitionItem[] = [
  {
    id: 'scomp-1',
    thumbnailUrl: 'https://via.placeholder.com/280x140/1E1E1E/00C853?text=MLB컵',
    title: '7회 MLB컵 리틀야구 U10',
    date: '2026.04.01 ~ 2026.04.15',
    sport: '야구',
    status: '접수중',
  },
  {
    id: 'scomp-2',
    thumbnailUrl: 'https://via.placeholder.com/280x140/1E1E1E/00C853?text=축구대회',
    title: '2026 전국 유소년 축구대회',
    date: '2026.05.01 ~ 2026.05.31',
    sport: '축구',
    status: '예정',
  },
  {
    id: 'scomp-3',
    thumbnailUrl: 'https://via.placeholder.com/280x140/1E1E1E/00C853?text=농구대회',
    title: '제4회 포착컵 농구대회',
    date: '2026.06.01 ~ 2026.06.15',
    sport: '농구',
    status: '예정',
  },
];

export const mockSearchVideos: SearchVideoItem[] = [
  {
    id: 'sv-1',
    thumbnailUrl: 'https://via.placeholder.com/280x158/1E1E1E/FFFFFF?text=동영상1',
    title: '동대문 리틀야구 vs 군포시 리틀야구 풀영상',
    description: '6회 MLB컵 리틀야구 U10 | 준결승',
    duration: '01:30:00',
    date: '2026.01.01',
  },
  {
    id: 'sv-2',
    thumbnailUrl: 'https://via.placeholder.com/280x158/1E1E1E/FFFFFF?text=동영상2',
    title: '서울 FC U12 vs 인천 유나이티드 U12 풀영상',
    description: '2026 전국 유소년 축구대회 | 8강',
    duration: '02:15:00',
    date: '2026.01.03',
  },
  {
    id: 'sv-3',
    thumbnailUrl: 'https://via.placeholder.com/280x158/1E1E1E/FFFFFF?text=동영상3',
    title: '부산 농구클럽 vs 대구 농구클럽 풀영상',
    description: '제3회 포착컵 농구대회 | 4강',
    duration: '01:20:00',
    date: '2026.01.07',
  },
];

export const mockSearchClips: SearchClipItem[] = [
  {
    id: 'scl-1',
    thumbnailUrl: 'https://via.placeholder.com/160x200/1E1E1E/FFFFFF?text=클립1',
    title: '역전 홈런 명장면',
    description: '6회 MLB컵 리틀야구 U10 | 준결승 하이라이트',
    viewCount: 15200,
    duration: '0:32',
  },
  {
    id: 'scl-2',
    thumbnailUrl: 'https://via.placeholder.com/160x200/1E1E1E/FFFFFF?text=클립2',
    title: '환상적인 골 세리머니',
    description: '전국 유소년 축구대회 | 8강 베스트 골',
    viewCount: 8700,
    duration: '0:45',
  },
  {
    id: 'scl-3',
    thumbnailUrl: 'https://via.placeholder.com/160x200/1E1E1E/FFFFFF?text=클립3',
    title: '감동의 승리 세리머니',
    description: '제3회 포착컵 농구대회 | 결승 명장면',
    viewCount: 23100,
    duration: '1:12',
  },
  {
    id: 'scl-4',
    thumbnailUrl: 'https://via.placeholder.com/160x200/1E1E1E/FFFFFF?text=클립4',
    title: '슈퍼 세이브 모음',
    description: '2026 전국 유소년 축구대회 베스트 세이브',
    viewCount: 31500,
    duration: '0:58',
  },
];

export const mockRecommendedClips: SearchClipItem[] = [
  {
    id: 'rec-1',
    thumbnailUrl: 'https://via.placeholder.com/160x200/1E1E1E/00C853?text=추천1',
    title: '이번 주 베스트 골',
    description: '포착 에디터 선정 이번 주 베스트 골 모음',
    viewCount: 45200,
    duration: '1:30',
  },
  {
    id: 'rec-2',
    thumbnailUrl: 'https://via.placeholder.com/160x200/1E1E1E/00C853?text=추천2',
    title: '감독님의 열정 응원',
    description: '열정 넘치는 벤치 리액션 모음',
    viewCount: 32100,
    duration: '0:55',
  },
  {
    id: 'rec-3',
    thumbnailUrl: 'https://via.placeholder.com/160x200/1E1E1E/00C853?text=추천3',
    title: '유소년 슈퍼플레이 TOP5',
    description: '이번 달 유소년 슈퍼플레이 랭킹',
    viewCount: 28700,
    duration: '2:15',
  },
  {
    id: 'rec-4',
    thumbnailUrl: 'https://via.placeholder.com/160x200/1E1E1E/00C853?text=추천4',
    title: '하이라이트 총정리',
    description: '3월 셋째 주 하이라이트 총정리',
    viewCount: 19800,
    duration: '3:20',
  },
];

export function formatViewCount(count: number): string {
  if (count >= 10000) {
    return `${(count / 10000).toFixed(1)}만`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}천`;
  }
  return `${count}`;
}

// --- Search Suggestion Types & Mock Data ---

export interface SearchSuggestionItem {
  text: string;
  type: 'VIDEO' | 'COMPETITION' | 'TEAM' | 'CLIP';
  id: string;
}

export interface TrendingSearchTerm {
  rank: number;
  keyword: string;
  changeDirection: 'UP' | 'DOWN' | 'STABLE' | 'NEW';
}

const mockSuggestionPool: SearchSuggestionItem[] = [
  {text: '동대문 리틀야구', type: 'TEAM', id: 'st-1'},
  {text: '동대문 리틀야구 vs 강남 리틀야구', type: 'VIDEO', id: 'sv-1'},
  {text: '동영상 하이라이트', type: 'CLIP', id: 'scl-1'},
  {text: '서울 FC U12', type: 'TEAM', id: 'st-2'},
  {text: '서울 FC U12 vs 인천 유나이티드 U12 풀영상', type: 'VIDEO', id: 'sv-2'},
  {text: '7회 MLB컵 리틀야구 U10', type: 'COMPETITION', id: 'scomp-1'},
  {text: '2026 전국 유소년 축구대회', type: 'COMPETITION', id: 'scomp-2'},
  {text: '부산 농구클럽', type: 'TEAM', id: 'st-3'},
  {text: '역전 홈런 명장면', type: 'CLIP', id: 'scl-1'},
  {text: '환상적인 골 세리머니', type: 'CLIP', id: 'scl-2'},
  {text: '감동의 승리 세리머니', type: 'CLIP', id: 'scl-3'},
  {text: '슈퍼 세이브 모음', type: 'CLIP', id: 'scl-4'},
  {text: '제4회 포착컵 농구대회', type: 'COMPETITION', id: 'scomp-3'},
  {text: '강남 리틀야구', type: 'TEAM', id: 'st-4'},
  {text: '인천 유나이티드 U12', type: 'TEAM', id: 'st-5'},
];

export const mockTrendingSearches: TrendingSearchTerm[] = [
  {rank: 1, keyword: '리틀야구', changeDirection: 'UP'},
  {rank: 2, keyword: 'MLB컵', changeDirection: 'STABLE'},
  {rank: 3, keyword: '유소년 축구', changeDirection: 'UP'},
  {rank: 4, keyword: '포착컵 농구', changeDirection: 'NEW'},
  {rank: 5, keyword: '동대문 리틀야구', changeDirection: 'DOWN'},
  {rank: 6, keyword: '서울 FC U12', changeDirection: 'UP'},
  {rank: 7, keyword: '하이라이트', changeDirection: 'STABLE'},
  {rank: 8, keyword: '역전 홈런', changeDirection: 'NEW'},
  {rank: 9, keyword: '인천 유나이티드', changeDirection: 'DOWN'},
  {rank: 10, keyword: '슈퍼 세이브', changeDirection: 'STABLE'},
];

/**
 * Returns auto-complete suggestions filtered by the given query string.
 * Matches against the beginning or anywhere in the suggestion text.
 */
export function getSearchSuggestions(query: string): SearchSuggestionItem[] {
  if (!query || query.trim().length === 0) {
    return [];
  }
  const lowerQuery = query.toLowerCase().trim();
  return mockSuggestionPool
    .filter(item => item.text.toLowerCase().includes(lowerQuery))
    .slice(0, 5);
}

/**
 * Returns the top 10 trending search terms.
 */
export function getTrendingSearches(): TrendingSearchTerm[] {
  return mockTrendingSearches;
}
