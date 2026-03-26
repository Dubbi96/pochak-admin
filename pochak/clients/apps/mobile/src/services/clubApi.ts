// Mock data for Club (포착클럽) screens

export interface Club {
  id: string;
  logoUrl: string;
  name: string;
  sport: string;
  memberCount: number;
  description: string;
  isFavorite: boolean;
  region: string;
}

export type JoinPolicy = 'OPEN' | 'APPROVAL' | 'INVITE_ONLY';
export type ContentVisibility = 'PUBLIC' | 'MEMBERS_ONLY';

export interface ClubDetail {
  id: string;
  bannerUrl: string;
  logoUrl: string;
  name: string;
  sport: string;
  memberCount: number;
  description: string;
  region: string;
  joinStatus: 'none' | 'pending' | 'joined';
  joinPolicy: JoinPolicy;
  isCUG: boolean;
  members: ClubMember[];
  videos: ClubVideo[];
  clips: ClubClip[];
}

export interface ClubMember {
  id: string;
  name: string;
  avatarUrl: string;
  role: '회장' | '부회장' | '운영진' | '회원';
  position?: string;
}

export interface ClubVideo {
  id: string;
  thumbnailUrl: string;
  title: string;
  date: string;
  viewCount: number;
  duration: string;
  visibility: ContentVisibility;
}

export interface ClubClip {
  id: string;
  thumbnailUrl: string;
  title: string;
  viewCount: number;
  duration: string;
  visibility: ContentVisibility;
}

export interface TeamCard {
  id: string;
  logoUrl: string;
  name: string;
  isFavorite: boolean;
}

export const clubSearchTabs = [
  '전체',
  '팀',
  '클럽',
  '라이브',
  '대회',
  '동영상',
  '클립',
];

// --- Mock Data ---

export const mockNearbyClubs: Club[] = [
  {
    id: 'nc1',
    logoUrl: 'https://via.placeholder.com/80x80/1E1E1E/00C853?text=FC',
    name: '송파FC',
    sport: '축구',
    memberCount: 32,
    description: '송파구 동호회 축구팀',
    isFavorite: false,
    region: '서울 송파구',
  },
  {
    id: 'nc2',
    logoUrl: 'https://via.placeholder.com/80x80/1E1E1E/00C853?text=BB',
    name: '잠실바스켓',
    sport: '농구',
    memberCount: 18,
    description: '잠실 동호회 농구팀',
    isFavorite: true,
    region: '서울 송파구',
  },
  {
    id: 'nc3',
    logoUrl: 'https://via.placeholder.com/80x80/1E1E1E/00C853?text=VB',
    name: '올림픽배구회',
    sport: '배구',
    memberCount: 24,
    description: '올림픽공원 주변 배구 동호회',
    isFavorite: false,
    region: '서울 송파구',
  },
  {
    id: 'nc4',
    logoUrl: 'https://via.placeholder.com/80x80/1E1E1E/00C853?text=TN',
    name: '강남테니스클럽',
    sport: '테니스',
    memberCount: 15,
    description: '강남 지역 테니스 동호회',
    isFavorite: false,
    region: '서울 강남구',
  },
];

export const mockPopularClubs: Club[] = [
  {
    id: 'pc1',
    logoUrl: 'https://via.placeholder.com/80x80/1E1E1E/00C853?text=KFC',
    name: '한강FC',
    sport: '축구',
    memberCount: 85,
    description: '서울 대표 동호회 축구팀. 매주 토요일 한강공원에서 활동합니다.',
    isFavorite: true,
    region: '서울 마포구',
  },
  {
    id: 'pc2',
    logoUrl: 'https://via.placeholder.com/80x80/1E1E1E/00C853?text=SB',
    name: '서울배드민턴',
    sport: '배드민턴',
    memberCount: 62,
    description: '서울 최대 배드민턴 동호회',
    isFavorite: false,
    region: '서울 강서구',
  },
  {
    id: 'pc3',
    logoUrl: 'https://via.placeholder.com/80x80/1E1E1E/00C853?text=RN',
    name: '런닝크루서울',
    sport: '런닝',
    memberCount: 120,
    description: '함께 달리는 즐거움, 런닝크루서울',
    isFavorite: false,
    region: '서울 용산구',
  },
  {
    id: 'pc4',
    logoUrl: 'https://via.placeholder.com/80x80/1E1E1E/00C853?text=YG',
    name: '모닝요가클럽',
    sport: '요가',
    memberCount: 45,
    description: '아침을 여는 요가 모임',
    isFavorite: false,
    region: '서울 서초구',
  },
];

export const mockNewClubs: Club[] = [
  {
    id: 'nw1',
    logoUrl: 'https://via.placeholder.com/80x80/1E1E1E/00C853?text=NEW',
    name: '풋살매니아',
    sport: '풋살',
    memberCount: 8,
    description: '새로 만든 풋살 동호회입니다. 함께해요!',
    isFavorite: false,
    region: '서울 영등포구',
  },
  {
    id: 'nw2',
    logoUrl: 'https://via.placeholder.com/80x80/1E1E1E/00C853?text=NEW',
    name: '서초탁구클럽',
    sport: '탁구',
    memberCount: 5,
    description: '서초구 탁구 동호회 멤버 모집중',
    isFavorite: false,
    region: '서울 서초구',
  },
  {
    id: 'nw3',
    logoUrl: 'https://via.placeholder.com/80x80/1E1E1E/00C853?text=NEW',
    name: '강북클라이밍',
    sport: '클라이밍',
    memberCount: 12,
    description: '클라이밍 입문자 환영합니다',
    isFavorite: false,
    region: '서울 강북구',
  },
  {
    id: 'nw4',
    logoUrl: 'https://via.placeholder.com/80x80/1E1E1E/00C853?text=NEW',
    name: '한강수영클럽',
    sport: '수영',
    memberCount: 10,
    description: '수영 좋아하시는 분 함께해요',
    isFavorite: false,
    region: '서울 마포구',
  },
];

export const mockTeamCards: TeamCard[] = [
  { id: 't1', logoUrl: 'https://via.placeholder.com/80x80/1E1E1E/00C853?text=LOGO', name: '송파FC', isFavorite: false },
  { id: 't2', logoUrl: 'https://via.placeholder.com/80x80/1E1E1E/00C853?text=LOGO', name: '한강FC', isFavorite: true },
  { id: 't3', logoUrl: 'https://via.placeholder.com/80x80/1E1E1E/00C853?text=LOGO', name: '강남유나이티드', isFavorite: false },
  { id: 't4', logoUrl: 'https://via.placeholder.com/80x80/1E1E1E/00C853?text=LOGO', name: '잠실이글스', isFavorite: false },
  { id: 't5', logoUrl: 'https://via.placeholder.com/80x80/1E1E1E/00C853?text=LOGO', name: '서초스타즈', isFavorite: true },
  { id: 't6', logoUrl: 'https://via.placeholder.com/80x80/1E1E1E/00C853?text=LOGO', name: '마포FC', isFavorite: false },
  { id: 't7', logoUrl: 'https://via.placeholder.com/80x80/1E1E1E/00C853?text=LOGO', name: '용산레인저스', isFavorite: false },
  { id: 't8', logoUrl: 'https://via.placeholder.com/80x80/1E1E1E/00C853?text=LOGO', name: '영등포FC', isFavorite: false },
];

export const mockSearchClubs: Club[] = [
  {
    id: 'sc1',
    logoUrl: 'https://via.placeholder.com/60x60/1E1E1E/00C853?text=FC',
    name: '송파FC',
    sport: '축구',
    memberCount: 32,
    description: '송파구 대표 축구 동호회. 매주 토/일 활동합니다.',
    isFavorite: false,
    region: '서울 송파구',
  },
  {
    id: 'sc2',
    logoUrl: 'https://via.placeholder.com/60x60/1E1E1E/00C853?text=FC',
    name: '한강FC',
    sport: '축구',
    memberCount: 85,
    description: '서울 최대 동호회 축구팀. 한강공원 활동.',
    isFavorite: true,
    region: '서울 마포구',
  },
  {
    id: 'sc3',
    logoUrl: 'https://via.placeholder.com/60x60/1E1E1E/00C853?text=BB',
    name: '잠실바스켓',
    sport: '농구',
    memberCount: 18,
    description: '잠실 동호회 농구팀. 초보자 환영.',
    isFavorite: false,
    region: '서울 송파구',
  },
  {
    id: 'sc4',
    logoUrl: 'https://via.placeholder.com/60x60/1E1E1E/00C853?text=VB',
    name: '올림픽배구회',
    sport: '배구',
    memberCount: 24,
    description: '올림픽공원 근처 배구 동호회.',
    isFavorite: false,
    region: '서울 송파구',
  },
  {
    id: 'sc5',
    logoUrl: 'https://via.placeholder.com/60x60/1E1E1E/00C853?text=RN',
    name: '런닝크루서울',
    sport: '런닝',
    memberCount: 120,
    description: '함께 달리는 즐거움! 매주 수/토 활동.',
    isFavorite: false,
    region: '서울 용산구',
  },
  {
    id: 'sc6',
    logoUrl: 'https://via.placeholder.com/60x60/1E1E1E/00C853?text=TN',
    name: '강남테니스클럽',
    sport: '테니스',
    memberCount: 15,
    description: '강남 지역 테니스 동호회.',
    isFavorite: false,
    region: '서울 강남구',
  },
  {
    id: 'sc7',
    logoUrl: 'https://via.placeholder.com/60x60/1E1E1E/00C853?text=BD',
    name: '서울배드민턴',
    sport: '배드민턴',
    memberCount: 62,
    description: '서울 최대 배드민턴 동호회. 실력 무관.',
    isFavorite: false,
    region: '서울 강서구',
  },
  {
    id: 'sc8',
    logoUrl: 'https://via.placeholder.com/60x60/1E1E1E/00C853?text=FS',
    name: '풋살매니아',
    sport: '풋살',
    memberCount: 8,
    description: '새로 만든 풋살 동호회. 멤버 모집중!',
    isFavorite: false,
    region: '서울 영등포구',
  },
];

export const mockClubDetail: ClubDetail = {
  id: 'cd1',
  bannerUrl: 'https://via.placeholder.com/400x200/1E1E1E/00C853?text=송파FC+배너',
  logoUrl: 'https://via.placeholder.com/100x100/1E1E1E/00C853?text=송파FC',
  name: '송파FC',
  sport: '축구',
  memberCount: 32,
  description:
    '송파구 대표 축구 동호회입니다. 매주 토요일, 일요일 잠실종합운동장에서 활동하며, 초보자부터 경험자까지 모두 환영합니다. 정기 리그전과 친선경기를 통해 실력을 키워나가고 있습니다.',
  region: '서울 송파구',
  joinStatus: 'none',
  joinPolicy: 'APPROVAL',
  isCUG: true,
  members: [
    { id: 'mb1', name: '김태호', avatarUrl: 'https://via.placeholder.com/50x50/333/FFF?text=김', role: '회장', position: 'GK' },
    { id: 'mb2', name: '이준서', avatarUrl: 'https://via.placeholder.com/50x50/333/FFF?text=이', role: '부회장', position: 'MF' },
    { id: 'mb3', name: '박민수', avatarUrl: 'https://via.placeholder.com/50x50/333/FFF?text=박', role: '운영진', position: 'FW' },
    { id: 'mb4', name: '최영진', avatarUrl: 'https://via.placeholder.com/50x50/333/FFF?text=최', role: '회원', position: 'DF' },
    { id: 'mb5', name: '정한울', avatarUrl: 'https://via.placeholder.com/50x50/333/FFF?text=정', role: '회원', position: 'MF' },
    { id: 'mb6', name: '강서윤', avatarUrl: 'https://via.placeholder.com/50x50/333/FFF?text=강', role: '회원', position: 'FW' },
  ],
  videos: [
    {
      id: 'cv1',
      thumbnailUrl: 'https://via.placeholder.com/200x120/1E1E1E/FFFFFF?text=경기영상1',
      title: '송파FC vs 강남유나이티드 풀영상',
      date: '2025.11.08',
      viewCount: 1250,
      duration: '45:30',
      visibility: 'MEMBERS_ONLY',
    },
    {
      id: 'cv2',
      thumbnailUrl: 'https://via.placeholder.com/200x120/1E1E1E/FFFFFF?text=경기영상2',
      title: '송파리그 3라운드 하이라이트',
      date: '2025.11.01',
      viewCount: 890,
      duration: '12:15',
      visibility: 'PUBLIC',
    },
    {
      id: 'cv3',
      thumbnailUrl: 'https://via.placeholder.com/200x120/1E1E1E/FFFFFF?text=경기영상3',
      title: '11월 훈련 영상',
      date: '2025.10.28',
      viewCount: 430,
      duration: '8:42',
      visibility: 'MEMBERS_ONLY',
    },
  ],
  clips: [
    {
      id: 'cc1',
      thumbnailUrl: 'https://via.placeholder.com/130x170/1E1E1E/FFFFFF?text=클립1',
      title: '김태호 슈퍼세이브',
      viewCount: 3200,
      duration: '0:25',
      visibility: 'PUBLIC',
    },
    {
      id: 'cc2',
      thumbnailUrl: 'https://via.placeholder.com/130x170/1E1E1E/FFFFFF?text=클립2',
      title: '박민수 환상 골',
      viewCount: 5100,
      duration: '0:18',
      visibility: 'MEMBERS_ONLY',
    },
    {
      id: 'cc3',
      thumbnailUrl: 'https://via.placeholder.com/130x170/1E1E1E/FFFFFF?text=클립3',
      title: '이준서 어시스트',
      viewCount: 2800,
      duration: '0:32',
      visibility: 'PUBLIC',
    },
  ],
};
