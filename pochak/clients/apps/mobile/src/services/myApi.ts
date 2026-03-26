// Mock data for My sub-screens

export interface WatchHistoryItem {
  id: string;
  thumbnailUrl: string;
  duration: string;
  title: string;
  subtitle: string;
  competitionIcon?: string;
  meta: string;
  watchedDate: string;
}

export interface MyClipItem {
  id: string;
  thumbnailUrl: string;
  title: string;
  viewCount: number;
  date: string;
  competitionInfo: string;
}

export interface WatchReservationItem {
  id: string;
  matchName: string;
  time: string;
  stadium: string;
  sport: string;
  date: string;
  dDay: string;
  status: '예정' | '진행중';
}

export interface FavoriteTeam {
  id: string;
  name: string;
  logoUrl: string;
  logoInitial: string;
  sportCategory?: string;
}

export interface FavoriteCompetition {
  id: string;
  imageUrl: string;
  name: string;
  dates: string;
  sport: string;
  isPaid: boolean;
  hasCommentary: boolean;
}

// --- Mock Data ---

export const mockWatchHistoryVideos: WatchHistoryItem[] = [
  {
    id: 'wh-1',
    thumbnailUrl: 'https://via.placeholder.com/120x68/1E1E1E/FFFFFF?text=경기1',
    duration: '01:30:00',
    title: '동대문구 리틀야구 vs 군포시 리틀야구',
    subtitle: '6회 MLB컵 리틀야구 U10 | 준결승',
    competitionIcon: 'emoji-events',
    meta: '야구 | 유료 | 해설 | 2026.01.01',
    watchedDate: '2026.01.01',
  },
  {
    id: 'wh-2',
    thumbnailUrl: 'https://via.placeholder.com/120x68/1E1E1E/FFFFFF?text=경기2',
    duration: '02:15:00',
    title: '서울 FC U12 vs 인천 유나이티드 U12',
    subtitle: '2026 전국 유소년 축구대회 | 8강',
    competitionIcon: 'emoji-events',
    meta: '축구 | 유료 | 해설 | 2026.01.03',
    watchedDate: '2026.01.03',
  },
  {
    id: 'wh-3',
    thumbnailUrl: 'https://via.placeholder.com/120x68/1E1E1E/FFFFFF?text=경기3',
    duration: '01:45:00',
    title: '강남구 리틀야구 vs 성남시 리틀야구',
    subtitle: '6회 MLB컵 리틀야구 U10 | 결승',
    competitionIcon: 'emoji-events',
    meta: '야구 | 무료 | 2026.01.05',
    watchedDate: '2026.01.05',
  },
  {
    id: 'wh-4',
    thumbnailUrl: 'https://via.placeholder.com/120x68/1E1E1E/FFFFFF?text=경기4',
    duration: '01:20:00',
    title: '부산 농구클럽 vs 대구 농구클럽',
    subtitle: '제3회 포착컵 농구대회 | 4강',
    competitionIcon: 'emoji-events',
    meta: '농구 | 유료 | 해설 | 2026.01.07',
    watchedDate: '2026.01.07',
  },
  {
    id: 'wh-5',
    thumbnailUrl: 'https://via.placeholder.com/120x68/1E1E1E/FFFFFF?text=경기5',
    duration: '02:00:00',
    title: '수원 삼성 U15 vs 전북 현대 U15',
    subtitle: '2026 K리그 주니어 리그 | 3라운드',
    competitionIcon: 'emoji-events',
    meta: '축구 | 유료 | 해설 | 2026.01.10',
    watchedDate: '2026.01.10',
  },
];

export const mockWatchHistoryClips: MyClipItem[] = [
  {
    id: 'whc-1',
    thumbnailUrl: 'https://via.placeholder.com/160x200/1E1E1E/FFFFFF?text=클립1',
    title: '역전 홈런 명장면',
    viewCount: 15200,
    date: '2026.01.01',
    competitionInfo: '6회 MLB컵 리틀야구 U10',
  },
  {
    id: 'whc-2',
    thumbnailUrl: 'https://via.placeholder.com/160x200/1E1E1E/FFFFFF?text=클립2',
    title: '환상적인 더블플레이',
    viewCount: 8700,
    date: '2026.01.02',
    competitionInfo: '6회 MLB컵 리틀야구 U10',
  },
  {
    id: 'whc-3',
    thumbnailUrl: 'https://via.placeholder.com/160x200/1E1E1E/FFFFFF?text=클립3',
    title: '감동의 승리 세리머니',
    viewCount: 23100,
    date: '2026.01.03',
    competitionInfo: '전국 유소년 축구대회',
  },
  {
    id: 'whc-4',
    thumbnailUrl: 'https://via.placeholder.com/160x200/1E1E1E/FFFFFF?text=클립4',
    title: '골키퍼 슈퍼 세이브',
    viewCount: 31500,
    date: '2026.01.05',
    competitionInfo: '전국 유소년 축구대회',
  },
];

export const mockMyClips: MyClipItem[] = [
  {
    id: 'mc-1',
    thumbnailUrl: 'https://via.placeholder.com/160x200/1E1E1E/00C853?text=내클립1',
    title: '우리 아이 첫 홈런!',
    viewCount: 342,
    date: '2026.01.01',
    competitionInfo: '6회 MLB컵 리틀야구 U10',
  },
  {
    id: 'mc-2',
    thumbnailUrl: 'https://via.placeholder.com/160x200/1E1E1E/00C853?text=내클립2',
    title: '결승골 어시스트',
    viewCount: 128,
    date: '2026.01.03',
    competitionInfo: '전국 유소년 축구대회',
  },
  {
    id: 'mc-3',
    thumbnailUrl: 'https://via.placeholder.com/160x200/1E1E1E/00C853?text=내클립3',
    title: '팀 응원 모음',
    viewCount: 87,
    date: '2026.01.05',
    competitionInfo: '제3회 포착컵 농구대회',
  },
  {
    id: 'mc-4',
    thumbnailUrl: 'https://via.placeholder.com/160x200/1E1E1E/00C853?text=내클립4',
    title: '경기 후 단체 사진',
    viewCount: 215,
    date: '2026.01.07',
    competitionInfo: '6회 MLB컵 리틀야구 U10',
  },
  {
    id: 'mc-5',
    thumbnailUrl: 'https://via.placeholder.com/160x200/1E1E1E/00C853?text=내클립5',
    title: '삼진 아웃 하이라이트',
    viewCount: 156,
    date: '2026.01.10',
    competitionInfo: '6회 MLB컵 리틀야구 U10',
  },
  {
    id: 'mc-6',
    thumbnailUrl: 'https://via.placeholder.com/160x200/1E1E1E/00C853?text=내클립6',
    title: '프리킥 골!',
    viewCount: 432,
    date: '2026.01.12',
    competitionInfo: '전국 유소년 축구대회',
  },
];

export const mockReservations: WatchReservationItem[] = [
  {
    id: 'res-1',
    matchName: '동대문구 리틀야구 vs 강남구 리틀야구',
    time: '14:00',
    stadium: '목동야구장',
    sport: '야구',
    date: '2026.03.19',
    dDay: 'D-Day',
    status: '진행중',
  },
  {
    id: 'res-2',
    matchName: '서울 FC U12 vs 수원 삼성 U12',
    time: '16:00',
    stadium: '서울월드컵경기장',
    sport: '축구',
    date: '2026.03.20',
    dDay: 'D+1',
    status: '예정',
  },
  {
    id: 'res-3',
    matchName: '부산 농구클럽 vs 인천 농구클럽',
    time: '18:00',
    stadium: '부산사직체육관',
    sport: '농구',
    date: '2026.03.20',
    dDay: 'D+1',
    status: '예정',
  },
  {
    id: 'res-4',
    matchName: '대구 FC U15 vs 전북 현대 U15',
    time: '10:00',
    stadium: '대구스타디움',
    sport: '축구',
    date: '2026.03.21',
    dDay: 'D+2',
    status: '예정',
  },
  {
    id: 'res-5',
    matchName: '성남시 리틀야구 vs 군포시 리틀야구',
    time: '13:00',
    stadium: '성남종합운동장',
    sport: '야구',
    date: '2026.03.21',
    dDay: 'D+2',
    status: '예정',
  },
];

export const mockFavoriteTeams: FavoriteTeam[] = [
  {id: 'ft-1', name: '동대문 리틀야구', logoUrl: '', logoInitial: '동', sportCategory: '야구 | 유소년부'},
  {id: 'ft-2', name: '서울 FC U12', logoUrl: '', logoInitial: '서', sportCategory: '축구 | 유소년부'},
  {id: 'ft-3', name: '부산 농구클럽', logoUrl: '', logoInitial: '부', sportCategory: '농구 | 유소년부'},
  {id: 'ft-4', name: '강남 리틀야구', logoUrl: '', logoInitial: '강', sportCategory: '야구 | 유소년부'},
  {id: 'ft-5', name: '수원 삼성 U15', logoUrl: '', logoInitial: '수', sportCategory: '축구 | 유소년부'},
];

export const mockFavoriteTeamVideos: WatchHistoryItem[] = [
  {
    id: 'ftv-1',
    thumbnailUrl: 'https://via.placeholder.com/120x68/1E1E1E/FFFFFF?text=팀경기1',
    duration: '01:30:00',
    title: '동대문구 리틀야구 vs 군포시 리틀야구',
    subtitle: '6회 MLB컵 리틀야구 U10 | 준결승',
    competitionIcon: 'emoji-events',
    meta: '야구 | 유료 | 해설 | 2026.01.01',
    watchedDate: '2026.01.01',
  },
  {
    id: 'ftv-2',
    thumbnailUrl: 'https://via.placeholder.com/120x68/1E1E1E/FFFFFF?text=팀경기2',
    duration: '01:45:00',
    title: '동대문구 리틀야구 vs 강남구 리틀야구',
    subtitle: '6회 MLB컵 리틀야구 U10 | 4강',
    competitionIcon: 'emoji-events',
    meta: '야구 | 유료 | 해설 | 2026.01.05',
    watchedDate: '2026.01.05',
  },
];

export const mockFavoriteCompetitions: FavoriteCompetition[] = [
  {
    id: 'fc-1',
    imageUrl: 'https://via.placeholder.com/60x60/1E1E1E/00C853?text=MLB',
    name: '6회 MLB컵 리틀야구 U10',
    dates: '2026.01.01 ~ 2026.01.15',
    sport: '야구',
    isPaid: true,
    hasCommentary: true,
  },
  {
    id: 'fc-2',
    imageUrl: 'https://via.placeholder.com/60x60/1E1E1E/00C853?text=축구',
    name: '2026 전국 유소년 축구대회',
    dates: '2026.02.01 ~ 2026.02.28',
    sport: '축구',
    isPaid: true,
    hasCommentary: true,
  },
  {
    id: 'fc-3',
    imageUrl: 'https://via.placeholder.com/60x60/1E1E1E/00C853?text=농구',
    name: '제3회 포착컵 농구대회',
    dates: '2026.03.01 ~ 2026.03.15',
    sport: '농구',
    isPaid: false,
    hasCommentary: false,
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
