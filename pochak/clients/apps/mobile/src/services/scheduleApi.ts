// Mock data and types for Schedule & Video screens

export type Sport = '전체' | '축구' | '야구' | '배구' | '농구' | '핸드볼' | '테니스' | '탁구';

export const SPORTS: Sport[] = [
  '전체',
  '축구',
  '야구',
  '배구',
  '농구',
  '핸드볼',
  '테니스',
  '탁구',
];

export type MatchType = 'TEAM_VS_TEAM' | 'PLAYER_VS_PLAYER' | 'RANKING';

export type MatchStatus = 'COMPLETED' | 'LIVE' | 'SCHEDULED';

export interface Competition {
  id: string;
  name: string;
  sport: Sport;
  imageUrl: string;
  startDate: string;
  endDate: string;
  isFree: boolean;
  hasCommentary?: boolean; // 해설 여부
  tags?: string[];
}

export interface Team {
  name: string;
  logo: string;
  score?: number;
}

export interface RankingEntry {
  rank: number;
  country: string;
  record: string;
}

export interface Match {
  id: string;
  competitionId: string;
  competitionName: string;
  sport: Sport;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  round: string;
  status: MatchStatus;
  matchType: MatchType;
  home: Team;
  away: Team;
  thumbnailUrl: string;
  vodUrl?: string;
  rankings?: RankingEntry[]; // for RANKING type
  result?: string; // e.g. '승' or '패' for PLAYER_VS_PLAYER
}

export interface VideoItem {
  id: string;
  type: 'LIVE' | 'VOD' | 'CLIP';
  title: string;
  thumbnailUrl: string;
  home?: Team;
  away?: Team;
  competitionName: string;
  date: string;
  tags: string[];
  duration?: string; // for VOD
  viewCount?: number; // for CLIP
  sport: Sport;
  status: 'SCHEDULED' | 'LIVE' | 'VOD';
}

// --------------- Mock Competitions ---------------

export const mockCompetitions: Competition[] = [
  {
    id: 'comp-1',
    name: '2026 K리그1',
    sport: '축구',
    imageUrl: 'https://placehold.co/80x80/1E1E1E/00C853?text=K1',
    startDate: '2026-03-01',
    endDate: '2026-11-30',
    isFree: false,
    hasCommentary: true,
    tags: ['축구', '유료', '해설'],
  },
  {
    id: 'comp-2',
    name: '2026 KBO 리그',
    sport: '야구',
    imageUrl: 'https://placehold.co/80x80/1E1E1E/00C853?text=KBO',
    startDate: '2026-03-15',
    endDate: '2026-10-31',
    isFree: true,
    hasCommentary: true,
    tags: ['야구', '무료', '해설'],
  },
  {
    id: 'comp-3',
    name: 'V-리그 2025-26',
    sport: '배구',
    imageUrl: 'https://placehold.co/80x80/1E1E1E/00C853?text=VL',
    startDate: '2025-10-12',
    endDate: '2026-04-30',
    isFree: false,
    tags: ['배구', '유료'],
  },
  {
    id: 'comp-4',
    name: 'KBL 2025-26',
    sport: '농구',
    imageUrl: 'https://placehold.co/80x80/1E1E1E/00C853?text=KBL',
    startDate: '2025-10-18',
    endDate: '2026-03-31',
    isFree: true,
    tags: ['농구', '무료'],
  },
  {
    id: 'comp-5',
    name: '핸드볼 슈퍼리그',
    sport: '핸드볼',
    imageUrl: 'https://placehold.co/80x80/1E1E1E/00C853?text=HB',
    startDate: '2026-01-10',
    endDate: '2026-06-30',
    isFree: true,
    tags: ['핸드볼', '무료'],
  },
];

// --------------- Mock Matches ---------------

export const mockMatches: Match[] = [
  // 2026-03-19 (today)
  {
    id: 'm-1',
    competitionId: 'comp-1',
    competitionName: '2026 K리그1',
    sport: '축구',
    date: '2026-03-19',
    time: '14:00',
    round: '6라운드',
    status: 'COMPLETED',
    matchType: 'TEAM_VS_TEAM',
    home: {name: '전북 현대', logo: '', score: 3},
    away: {name: '울산 HD', logo: '', score: 1},
    thumbnailUrl: 'https://placehold.co/320x180/1E1E1E/808080?text=VOD',
    vodUrl: 'https://example.com/vod/m-1',
  },
  {
    id: 'm-2',
    competitionId: 'comp-2',
    competitionName: '2026 KBO 리그',
    sport: '야구',
    date: '2026-03-19',
    time: '17:00',
    round: '시범경기',
    status: 'LIVE',
    matchType: 'TEAM_VS_TEAM',
    home: {name: 'LG 트윈스', logo: '', score: 4},
    away: {name: '삼성 라이온즈', logo: '', score: 2},
    thumbnailUrl: 'https://placehold.co/320x180/1E1E1E/00C853?text=LIVE',
  },
  {
    id: 'm-3',
    competitionId: 'comp-3',
    competitionName: 'V-리그 2025-26',
    sport: '배구',
    date: '2026-03-19',
    time: '19:00',
    round: '플레이오프 2차전',
    status: 'SCHEDULED',
    matchType: 'TEAM_VS_TEAM',
    home: {name: '대한항공 점보스', logo: ''},
    away: {name: '삼성화재 블루팡스', logo: ''},
    thumbnailUrl: 'https://placehold.co/320x180/1E1E1E/808080?text=SOON',
  },
  {
    id: 'm-4',
    competitionId: 'comp-1',
    competitionName: '2026 K리그1',
    sport: '축구',
    date: '2026-03-19',
    time: '19:30',
    round: '6라운드',
    status: 'SCHEDULED',
    matchType: 'TEAM_VS_TEAM',
    home: {name: '수원 FC', logo: ''},
    away: {name: 'FC 서울', logo: ''},
    thumbnailUrl: 'https://placehold.co/320x180/1E1E1E/808080?text=SOON',
  },
  // 2026-03-20
  {
    id: 'm-5',
    competitionId: 'comp-4',
    competitionName: 'KBL 2025-26',
    sport: '농구',
    date: '2026-03-20',
    time: '18:00',
    round: '정규시즌 35라운드',
    status: 'SCHEDULED',
    matchType: 'TEAM_VS_TEAM',
    home: {name: '서울 SK', logo: ''},
    away: {name: '원주 DB', logo: ''},
    thumbnailUrl: 'https://placehold.co/320x180/1E1E1E/808080?text=SOON',
  },
  {
    id: 'm-6',
    competitionId: 'comp-2',
    competitionName: '2026 KBO 리그',
    sport: '야구',
    date: '2026-03-20',
    time: '14:00',
    round: '시범경기',
    status: 'SCHEDULED',
    matchType: 'TEAM_VS_TEAM',
    home: {name: '두산 베어스', logo: ''},
    away: {name: 'KT 위즈', logo: ''},
    thumbnailUrl: 'https://placehold.co/320x180/1E1E1E/808080?text=SOON',
  },
  // 2026-03-21
  {
    id: 'm-7',
    competitionId: 'comp-5',
    competitionName: '핸드볼 슈퍼리그',
    sport: '핸드볼',
    date: '2026-03-21',
    time: '15:00',
    round: '16라운드',
    status: 'SCHEDULED',
    matchType: 'TEAM_VS_TEAM',
    home: {name: '두산', logo: ''},
    away: {name: '사천시청', logo: ''},
    thumbnailUrl: 'https://placehold.co/320x180/1E1E1E/808080?text=SOON',
  },
  // PLAYER_VS_PLAYER example (축구 개인전)
  {
    id: 'm-8',
    competitionId: 'comp-1',
    competitionName: '2026 K리그1 개인전',
    sport: '축구',
    date: '2026-03-19',
    time: '16:00',
    round: '결승',
    status: 'COMPLETED',
    matchType: 'PLAYER_VS_PLAYER',
    home: {name: '김민재', logo: '', score: 1},
    away: {name: '손흥민', logo: '', score: 0},
    result: '승',
    thumbnailUrl: 'https://placehold.co/320x180/1E1E1E/808080?text=VOD',
    vodUrl: 'https://example.com/vod/m-8',
  },
  // RANKING example (육상)
  {
    id: 'm-9',
    competitionId: 'comp-1',
    competitionName: '2026 아시안게임 육상',
    sport: '축구',
    date: '2026-03-19',
    time: '10:00',
    round: '100m 결승',
    status: 'COMPLETED',
    matchType: 'RANKING',
    home: {name: '', logo: ''},
    away: {name: '', logo: ''},
    rankings: [
      {rank: 1, country: '대한민국', record: '9.0s'},
      {rank: 2, country: '중화인민공화국', record: '9.5s'},
      {rank: 3, country: '일본', record: '10.0s'},
    ],
    thumbnailUrl: 'https://placehold.co/320x180/1E1E1E/808080?text=VOD',
    vodUrl: 'https://example.com/vod/m-9',
  },
];

// --------------- Mock Videos ---------------

export const mockVideos: VideoItem[] = [
  {
    id: 'v-1',
    type: 'LIVE',
    title: 'LG vs 삼성 실시간',
    thumbnailUrl: 'https://placehold.co/320x180/1E1E1E/FF0000?text=LIVE',
    home: {name: 'LG 트윈스', logo: ''},
    away: {name: '삼성 라이온즈', logo: ''},
    competitionName: '2026 KBO 리그',
    date: '2026-03-19',
    tags: ['야구', 'KBO', '실시간'],
    sport: '야구',
    status: 'LIVE',
  },
  {
    id: 'v-2',
    type: 'VOD',
    title: '전북 vs 울산 하이라이트',
    thumbnailUrl: 'https://placehold.co/320x180/1E1E1E/4488FF?text=VOD',
    home: {name: '전북 현대', logo: '', score: 3},
    away: {name: '울산 HD', logo: '', score: 1},
    competitionName: '2026 K리그1',
    date: '2026-03-19',
    tags: ['축구', 'K리그', '하이라이트'],
    duration: '12:34',
    sport: '축구',
    status: 'VOD',
  },
  {
    id: 'v-3',
    type: 'VOD',
    title: '대한항공 vs 삼성화재 풀경기',
    thumbnailUrl: 'https://placehold.co/320x180/1E1E1E/4488FF?text=VOD',
    home: {name: '대한항공 점보스', logo: '', score: 3},
    away: {name: '삼성화재 블루팡스', logo: '', score: 2},
    competitionName: 'V-리그 2025-26',
    date: '2026-03-18',
    tags: ['배구', 'V-리그', '풀경기'],
    duration: '1:48:22',
    sport: '배구',
    status: 'VOD',
  },
  {
    id: 'v-4',
    type: 'LIVE',
    title: '수원 FC vs FC 서울',
    thumbnailUrl: 'https://placehold.co/320x180/1E1E1E/FF0000?text=LIVE',
    home: {name: '수원 FC', logo: ''},
    away: {name: 'FC 서울', logo: ''},
    competitionName: '2026 K리그1',
    date: '2026-03-19',
    tags: ['축구', 'K리그'],
    sport: '축구',
    status: 'SCHEDULED',
  },
  {
    id: 'v-5',
    type: 'VOD',
    title: '서울 SK vs 원주 DB 하이라이트',
    thumbnailUrl: 'https://placehold.co/320x180/1E1E1E/4488FF?text=VOD',
    home: {name: '서울 SK', logo: '', score: 88},
    away: {name: '원주 DB', logo: '', score: 76},
    competitionName: 'KBL 2025-26',
    date: '2026-03-17',
    tags: ['농구', 'KBL', '하이라이트'],
    duration: '8:45',
    sport: '농구',
    status: 'VOD',
  },
  {
    id: 'v-6',
    type: 'VOD',
    title: '두산 vs 사천시청',
    thumbnailUrl: 'https://placehold.co/320x180/1E1E1E/4488FF?text=VOD',
    home: {name: '두산', logo: '', score: 32},
    away: {name: '사천시청', logo: '', score: 28},
    competitionName: '핸드볼 슈퍼리그',
    date: '2026-03-16',
    tags: ['핸드볼', '슈퍼리그'],
    duration: '1:22:10',
    sport: '핸드볼',
    status: 'VOD',
  },
];

export const mockClips: VideoItem[] = [
  {
    id: 'c-1',
    type: 'CLIP',
    title: '전북 이승기 환상 프리킥 골!',
    thumbnailUrl: 'https://placehold.co/320x180/1E1E1E/00C853?text=CLIP',
    competitionName: '2026 K리그1',
    date: '2026-03-19',
    tags: ['축구', '골', '프리킥'],
    viewCount: 12400,
    sport: '축구',
    status: 'VOD',
  },
  {
    id: 'c-2',
    type: 'CLIP',
    title: 'LG 오지환 역전 3점 홈런',
    thumbnailUrl: 'https://placehold.co/320x180/1E1E1E/00C853?text=CLIP',
    competitionName: '2026 KBO 리그',
    date: '2026-03-19',
    tags: ['야구', '홈런'],
    viewCount: 8700,
    sport: '야구',
    status: 'VOD',
  },
  {
    id: 'c-3',
    type: 'CLIP',
    title: '대한항공 점보스 역전 세트 포인트',
    thumbnailUrl: 'https://placehold.co/320x180/1E1E1E/00C853?text=CLIP',
    competitionName: 'V-리그 2025-26',
    date: '2026-03-18',
    tags: ['배구', '역전'],
    viewCount: 5300,
    sport: '배구',
    status: 'VOD',
  },
  {
    id: 'c-4',
    type: 'CLIP',
    title: 'SK 허웅 버저비터 3점슛',
    thumbnailUrl: 'https://placehold.co/320x180/1E1E1E/00C853?text=CLIP',
    competitionName: 'KBL 2025-26',
    date: '2026-03-17',
    tags: ['농구', '버저비터'],
    viewCount: 15200,
    sport: '농구',
    status: 'VOD',
  },
  {
    id: 'c-5',
    type: 'CLIP',
    title: '두산 핸드볼 연속 속공 득점',
    thumbnailUrl: 'https://placehold.co/320x180/1E1E1E/00C853?text=CLIP',
    competitionName: '핸드볼 슈퍼리그',
    date: '2026-03-16',
    tags: ['핸드볼', '속공'],
    viewCount: 2100,
    sport: '핸드볼',
    status: 'VOD',
  },
  {
    id: 'c-6',
    type: 'CLIP',
    title: '울산 HD 화려한 패스워크 골',
    thumbnailUrl: 'https://placehold.co/320x180/1E1E1E/00C853?text=CLIP',
    competitionName: '2026 K리그1',
    date: '2026-03-19',
    tags: ['축구', '골', '패스'],
    viewCount: 9800,
    sport: '축구',
    status: 'VOD',
  },
];

// --------------- Helper functions ---------------

export function getMatchesByDate(matches: Match[]): Record<string, Match[]> {
  const grouped: Record<string, Match[]> = {};
  for (const match of matches) {
    if (!grouped[match.date]) {
      grouped[match.date] = [];
    }
    grouped[match.date].push(match);
  }
  return grouped;
}

export function formatDateHeader(dateStr: string): string {
  const date = new Date(dateStr);
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const dayName = days[date.getDay()];
  return `${month}월 ${day}일 (${dayName})`;
}

export function formatMonthYear(year: number, month: number): string {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  return `${monthNames[month - 1]} ${year}`;
}
