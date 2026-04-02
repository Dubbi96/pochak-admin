// Mock data for Clip screens

export interface ClipItem {
  id: string;
  thumbnailUrl: string;
  videoUrl: string;
  title: string;
  description: string;
  creatorName: string;
  creatorAvatar: string;
  competitionName: string;
  createdAt: string;
  likeCount: number;
  viewCount: number;
  shareCount: number;
  tags: string[];
  isLiked: boolean;
  sourceMatch: string;
}

export interface PopularClipItem {
  id: string;
  thumbnailUrl: string;
  title: string;
  description: string;
  viewCount: number;
  duration: string;
  creatorName: string;
}

export interface ClipEditData {
  id: string;
  title: string;
  description: string;
  source: string;
  tags: string[];
  thumbnails: string[];
  selectedThumbnailIndex: number;
  visibility: 'public' | 'club' | 'private';
  createdAt: string;
  likeCount: number;
}

// --- Mock Data ---

export const mockRecommendedClips: ClipItem[] = [
  {
    id: 'rc-1',
    thumbnailUrl: 'https://via.placeholder.com/400x700/1E1E1E/FFFFFF?text=클립1',
    videoUrl: '',
    title: '역전 홈런 명장면',
    description: '9회말 투아웃에서 터진 극적인 역전 홈런! 경기장이 눈물바다가 되었습니다.',
    creatorName: '포착TV',
    creatorAvatar: 'P',
    competitionName: '6회 MLB컵 리틀야구 U10',
    createdAt: '2026.01.15 14:32:00',
    likeCount: 1523,
    viewCount: 45200,
    shareCount: 234,
    tags: ['야구', 'MLB컵', '홈런', '역전'],
    isLiked: false,
    sourceMatch: '화랑대기 유소년 축구대회 결승 포착 vs 호각',
  },
  {
    id: 'rc-2',
    thumbnailUrl: 'https://via.placeholder.com/400x700/1E1E1E/FFFFFF?text=클립2',
    videoUrl: '',
    title: '환상적인 프리킥 골',
    description: '25m 거리에서 날아간 환상적인 프리킥! 골키퍼도 손도 못 댔습니다.',
    creatorName: '축구맘TV',
    creatorAvatar: '축',
    competitionName: '2026 전국 유소년 축구대회',
    createdAt: '2026.02.10 09:15:00',
    likeCount: 2341,
    viewCount: 67800,
    shareCount: 456,
    tags: ['축구', '프리킥', '골', '유소년'],
    isLiked: true,
    sourceMatch: '전국 유소년 축구대회 4강 서울FC vs 인천UTD',
  },
  {
    id: 'rc-3',
    thumbnailUrl: 'https://via.placeholder.com/400x700/1E1E1E/FFFFFF?text=클립3',
    videoUrl: '',
    title: '감동의 우승 세리머니',
    description: '결승전 승리 후 선수들과 학부모들이 함께한 감동의 순간',
    creatorName: '농구아빠',
    creatorAvatar: '농',
    competitionName: '제3회 포착컵 농구대회',
    createdAt: '2026.03.05 16:45:00',
    likeCount: 987,
    viewCount: 23100,
    shareCount: 123,
    tags: ['농구', '포착컵', '우승', '세리머니'],
    isLiked: false,
    sourceMatch: '포착컵 농구대회 결승 부산BC vs 대구BC',
  },
  {
    id: 'rc-4',
    thumbnailUrl: 'https://via.placeholder.com/400x700/1E1E1E/FFFFFF?text=클립4',
    videoUrl: '',
    title: '슈퍼 세이브 TOP3',
    description: '이번 주 가장 놀라운 골키퍼 세이브 모음',
    creatorName: '포착 에디터',
    creatorAvatar: '에',
    competitionName: '2026 K리그 주니어',
    createdAt: '2026.03.12 11:20:00',
    likeCount: 1876,
    viewCount: 51400,
    shareCount: 345,
    tags: ['축구', '세이브', '골키퍼', 'TOP3'],
    isLiked: false,
    sourceMatch: 'K리그 주니어 3라운드 수원 vs 전북',
  },
  {
    id: 'rc-5',
    thumbnailUrl: 'https://via.placeholder.com/400x700/1E1E1E/FFFFFF?text=클립5',
    videoUrl: '',
    title: '삼진 아웃 머신',
    description: '5이닝 연속 삼진을 기록한 에이스 투수의 압도적인 피칭',
    creatorName: '야구해설위원',
    creatorAvatar: '야',
    competitionName: '7회 MLB컵 리틀야구 U10',
    createdAt: '2026.03.18 15:00:00',
    likeCount: 654,
    viewCount: 18900,
    shareCount: 89,
    tags: ['야구', 'MLB컵', '삼진', '투수'],
    isLiked: true,
    sourceMatch: 'MLB컵 리틀야구 예선 동대문 vs 성남',
  },
];

export const mockPopularClips: PopularClipItem[] = [
  {
    id: 'pc-1',
    thumbnailUrl: 'https://via.placeholder.com/180x240/1E1E1E/FFFFFF?text=인기1',
    title: '역전 홈런 명장면',
    description: '6회 MLB컵 리틀야구 U10 | 준결승',
    viewCount: 45200,
    duration: '0:32',
    creatorName: '포착TV',
  },
  {
    id: 'pc-2',
    thumbnailUrl: 'https://via.placeholder.com/180x240/1E1E1E/FFFFFF?text=인기2',
    title: '환상적인 프리킥 골',
    description: '전국 유소년 축구대회 | 4강',
    viewCount: 67800,
    duration: '0:45',
    creatorName: '축구맘TV',
  },
  {
    id: 'pc-3',
    thumbnailUrl: 'https://via.placeholder.com/180x240/1E1E1E/FFFFFF?text=인기3',
    title: '감동의 우승 세리머니',
    description: '포착컵 농구대회 | 결승',
    viewCount: 23100,
    duration: '1:12',
    creatorName: '농구아빠',
  },
  {
    id: 'pc-4',
    thumbnailUrl: 'https://via.placeholder.com/180x240/1E1E1E/FFFFFF?text=인기4',
    title: '슈퍼 세이브 TOP3',
    description: 'K리그 주니어 | 3라운드',
    viewCount: 51400,
    duration: '0:58',
    creatorName: '포착 에디터',
  },
  {
    id: 'pc-5',
    thumbnailUrl: 'https://via.placeholder.com/180x240/1E1E1E/FFFFFF?text=인기5',
    title: '삼진 아웃 머신',
    description: 'MLB컵 리틀야구 U10 | 예선',
    viewCount: 18900,
    duration: '0:40',
    creatorName: '야구해설위원',
  },
  {
    id: 'pc-6',
    thumbnailUrl: 'https://via.placeholder.com/180x240/1E1E1E/FFFFFF?text=인기6',
    title: '결승골 어시스트',
    description: '전국 유소년 축구대회 | 결승',
    viewCount: 34500,
    duration: '0:28',
    creatorName: '축구맘TV',
  },
];

export const mockClipEditData: ClipEditData = {
  id: 'edit-1',
  title: '역전 홈런 명장면',
  description:
    '9회말 투아웃에서 터진 극적인 역전 홈런! 경기장이 눈물바다가 되었습니다. 이 순간을 놓치지 마세요.',
  source: '화랑대기 유소년 축구대회 결승 포착 vs 호각',
  tags: ['야구', 'MLB컵', '홈런', '역전', '유소년'],
  thumbnails: [
    'https://via.placeholder.com/100x60/1E1E1E/FFFFFF?text=썸네일1',
    'https://via.placeholder.com/100x60/1E1E1E/FFFFFF?text=썸네일2',
    'https://via.placeholder.com/100x60/1E1E1E/FFFFFF?text=썸네일3',
    'https://via.placeholder.com/100x60/1E1E1E/FFFFFF?text=썸네일4',
    'https://via.placeholder.com/100x60/1E1E1E/FFFFFF?text=썸네일5',
    'https://via.placeholder.com/100x60/1E1E1E/FFFFFF?text=썸네일6',
    'https://via.placeholder.com/100x60/1E1E1E/FFFFFF?text=썸네일7',
  ],
  selectedThumbnailIndex: 0,
  visibility: 'public',
  createdAt: '2026.01.15 14:32:00',
  likeCount: 999,
};

export function formatViewCount(count: number): string {
  if (count >= 10000) {
    return `${(count / 10000).toFixed(1)}만`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}천`;
  }
  return `${count}`;
}
