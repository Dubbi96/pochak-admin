// Mock data for City (포착시티) screens

export interface CityBanner {
  id: string;
  imageUrl: string;
  title: string;
  subtitle?: string;
}

export interface CityCompetitionNews {
  id: string;
  imageUrl: string;
  title: string;
  date: string;
  sport: string;
  status: '진행중' | '접수중' | '예정' | '종료';
}

export interface CityFacility {
  id: string;
  imageUrl: string;
  name: string;
  address: string;
  distance: string;
  sportType: string;
  isVerified: boolean;
  region: string;
}

export interface CitySportsCenter {
  id: string;
  imageUrl: string;
  name: string;
  address: string;
  sports: string[];
  rating: number;
}

export interface Competition {
  id: string;
  logoUrl: string;
  name: string;
  date: string;
  sport: string;
  isFavorite: boolean;
}

export interface VenueDetail {
  id: string;
  name: string;
  address: string;
  phone: string;
  sportType: string;
  imageUrl: string;
  cameras: VenueCamera[];
  matches: VenueMatch[];
  description: string;
  operatingHours: string;
}

export interface VenueCamera {
  id: string;
  name: string;
  location: string;
  isLive: boolean;
}

export interface VenueMatch {
  id: string;
  title: string;
  date: string;
  teams: string;
  status: string;
}

// --- Mock Data ---

export const mockCityBanners: CityBanner[] = [
  {
    id: 'cb1',
    imageUrl: 'https://via.placeholder.com/400x200/1E1E1E/00C853?text=포착시티',
    title: '우리 동네 스포츠 시설 찾기',
    subtitle: '가까운 체육시설을 한눈에!',
  },
  {
    id: 'cb2',
    imageUrl: 'https://via.placeholder.com/400x200/1E1E1E/00C853?text=대회+안내',
    title: '2025 시민 체육대회',
    subtitle: '지금 참가 신청하세요',
  },
  {
    id: 'cb3',
    imageUrl: 'https://via.placeholder.com/400x200/1E1E1E/00C853?text=시설+예약',
    title: '실시간 시설 예약',
    subtitle: '빈 시간대를 확인하고 바로 예약',
  },
];

export const mockCompetitionNews: CityCompetitionNews[] = [
  {
    id: 'cn1',
    imageUrl: 'https://via.placeholder.com/160x100/1E1E1E/00C853?text=축구대회',
    title: '2025 시장배 축구대회',
    date: '11.15 ~ 11.20',
    sport: '축구',
    status: '접수중',
  },
  {
    id: 'cn2',
    imageUrl: 'https://via.placeholder.com/160x100/1E1E1E/00C853?text=야구대회',
    title: '전국 동호인 야구대회',
    date: '11.22 ~ 11.25',
    sport: '야구',
    status: '예정',
  },
  {
    id: 'cn3',
    imageUrl: 'https://via.placeholder.com/160x100/1E1E1E/00C853?text=농구대회',
    title: '구민 3on3 농구대회',
    date: '11.10 ~ 11.12',
    sport: '농구',
    status: '진행중',
  },
  {
    id: 'cn4',
    imageUrl: 'https://via.placeholder.com/160x100/1E1E1E/00C853?text=배구대회',
    title: '직장인 배구 리그',
    date: '12.01 ~ 12.15',
    sport: '배구',
    status: '예정',
  },
];

export const mockFacilities: CityFacility[] = [
  {
    id: 'f1',
    imageUrl: 'https://via.placeholder.com/160x100/1E1E1E/FFFFFF?text=축구장',
    name: '잠실종합운동장 축구장',
    address: '서울 송파구 올림픽로 25',
    distance: '1.2km',
    sportType: '축구',
    isVerified: true,
    region: '서울',
  },
  {
    id: 'f2',
    imageUrl: 'https://via.placeholder.com/160x100/1E1E1E/FFFFFF?text=야구장',
    name: '잠실야구장',
    address: '서울 송파구 올림픽로 19-2',
    distance: '1.5km',
    sportType: '야구',
    isVerified: true,
    region: '서울',
  },
  {
    id: 'f3',
    imageUrl: 'https://via.placeholder.com/160x100/1E1E1E/FFFFFF?text=체육관',
    name: '송파구민체육센터',
    address: '서울 송파구 백제고분로 135',
    distance: '0.8km',
    sportType: '실내체육',
    isVerified: false,
    region: '서울',
  },
  {
    id: 'f4',
    imageUrl: 'https://via.placeholder.com/160x100/1E1E1E/FFFFFF?text=테니스장',
    name: '올림픽공원 테니스장',
    address: '서울 송파구 올림픽로 424',
    distance: '2.1km',
    sportType: '테니스',
    isVerified: true,
    region: '서울',
  },
  {
    id: 'f5',
    imageUrl: 'https://via.placeholder.com/160x100/1E1E1E/FFFFFF?text=수영장',
    name: '분당스포츠센터 수영장',
    address: '경기 성남시 분당구 정자동 123',
    distance: '15.3km',
    sportType: '수영',
    isVerified: true,
    region: '경기',
  },
];

export const mockSportsCenters: CitySportsCenter[] = [
  {
    id: 'sc1',
    imageUrl: 'https://via.placeholder.com/200x120/1E1E1E/00C853?text=스포츠센터',
    name: '송파스포츠센터',
    address: '서울 송파구 송파대로 345',
    sports: ['축구', '농구', '배드민턴'],
    rating: 4.5,
  },
  {
    id: 'sc2',
    imageUrl: 'https://via.placeholder.com/200x120/1E1E1E/00C853?text=체육센터',
    name: '강남구민체육센터',
    address: '서울 강남구 삼성로 123',
    sports: ['수영', '헬스', '요가'],
    rating: 4.2,
  },
  {
    id: 'sc3',
    imageUrl: 'https://via.placeholder.com/200x120/1E1E1E/00C853?text=운동센터',
    name: '올림픽스포츠센터',
    address: '서울 송파구 올림픽로 424',
    sports: ['테니스', '탁구', '배구'],
    rating: 4.7,
  },
];

export const competitionTabs = [
  '오늘의 대회',
  '축구',
  '야구',
  '배구',
  '핸드볼',
  '농구',
  '기타',
];

export const competitionMonths = [
  { label: '7월', value: 7 },
  { label: '8월', value: 8 },
  { label: '9월', value: 9 },
  { label: '10월', value: 10 },
  { label: '11월', value: 11 },
  { label: '12월', value: 12 },
];

export const mockCompetitions: Record<string, Competition[]> = {
  축구: [
    {
      id: 'comp1',
      logoUrl: 'https://via.placeholder.com/80x80/1E1E1E/00C853?text=LOGO',
      name: '시장배 축구대회',
      date: '11.15 ~ 11.20',
      sport: '축구',
      isFavorite: false,
    },
    {
      id: 'comp2',
      logoUrl: 'https://via.placeholder.com/80x80/1E1E1E/00C853?text=LOGO',
      name: '전국체전 축구',
      date: '11.22 ~ 11.25',
      sport: '축구',
      isFavorite: true,
    },
    {
      id: 'comp3',
      logoUrl: 'https://via.placeholder.com/80x80/1E1E1E/00C853?text=LOGO',
      name: '구민 풋살리그',
      date: '11.28 ~ 12.05',
      sport: '축구',
      isFavorite: false,
    },
    {
      id: 'comp4',
      logoUrl: 'https://via.placeholder.com/80x80/1E1E1E/00C853?text=LOGO',
      name: '송파컵 축구대회',
      date: '12.10 ~ 12.15',
      sport: '축구',
      isFavorite: false,
    },
  ],
  야구: [
    {
      id: 'comp5',
      logoUrl: 'https://via.placeholder.com/80x80/1E1E1E/00C853?text=LOGO',
      name: '동호인 야구리그',
      date: '11.10 ~ 11.30',
      sport: '야구',
      isFavorite: true,
    },
    {
      id: 'comp6',
      logoUrl: 'https://via.placeholder.com/80x80/1E1E1E/00C853?text=LOGO',
      name: '전국 사회인 야구',
      date: '12.01 ~ 12.10',
      sport: '야구',
      isFavorite: false,
    },
  ],
  배구: [
    {
      id: 'comp7',
      logoUrl: 'https://via.placeholder.com/80x80/1E1E1E/00C853?text=LOGO',
      name: '직장인 배구리그',
      date: '12.01 ~ 12.15',
      sport: '배구',
      isFavorite: false,
    },
  ],
  농구: [
    {
      id: 'comp8',
      logoUrl: 'https://via.placeholder.com/80x80/1E1E1E/00C853?text=LOGO',
      name: '3on3 농구대회',
      date: '11.10 ~ 11.12',
      sport: '농구',
      isFavorite: false,
    },
  ],
  핸드볼: [],
  기타: [],
};

export const mockVenueDetail: VenueDetail = {
  id: 'v1',
  name: '잠실종합운동장 축구장',
  address: '서울 송파구 올림픽로 25',
  phone: '02-2240-8800',
  sportType: '축구',
  imageUrl: 'https://via.placeholder.com/400x200/1E1E1E/00C853?text=잠실축구장',
  description:
    '잠실종합운동장 내 위치한 축구 전용 경기장입니다. 천연잔디 구장으로 주말 동호회 리그 및 각종 대회가 진행됩니다.',
  operatingHours: '06:00 ~ 22:00',
  cameras: [
    { id: 'cam1', name: '메인 카메라', location: 'A구장 중앙', isLive: true },
    { id: 'cam2', name: '보조 카메라 1', location: 'A구장 좌측', isLive: true },
    { id: 'cam3', name: '보조 카메라 2', location: 'B구장 중앙', isLive: false },
  ],
  matches: [
    {
      id: 'm1',
      title: '송파FC vs 강남유나이티드',
      date: '11.15 (토) 14:00',
      teams: '송파FC vs 강남유나이티드',
      status: '예정',
    },
    {
      id: 'm2',
      title: '잠실이글스 vs 올림픽FC',
      date: '11.16 (일) 10:00',
      teams: '잠실이글스 vs 올림픽FC',
      status: '예정',
    },
    {
      id: 'm3',
      title: '송파리그 4라운드',
      date: '11.17 (월) 19:00',
      teams: '리그전',
      status: '접수중',
    },
  ],
};

export const regions = [
  '서울',
  '경기',
  '인천',
  '부산',
  '대구',
  '대전',
  '광주',
  '울산',
  '세종',
  '강원',
  '충북',
  '충남',
  '전북',
  '전남',
  '경북',
  '경남',
  '제주',
];
