// Mock data for Commerce screens

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  priceUnit: '원' | '뽈';
  category: '구독' | '대회권' | '경기 패스' | '충전';
  duration?: string;
  isSubscription?: boolean;
  subscriptionLabel?: string;
  subscriptionSubLabel?: string;
}

export interface PurchaseRecord {
  id: string;
  productId: string;
  productName: string;
  amount: number;
  priceUnit: '원' | '뽈';
  paymentMethod: string;
  purchaseDate: string;
  expiryDate?: string;
  status: '완료' | '취소' | '환불';
}

export type PaymentMethod =
  | '신용/체크카드'
  | '카카오페이'
  | '네이버페이'
  | '뽈 결제';

export const mockProducts: Product[] = [
  // 구독
  {
    id: 'sub-1',
    name: '대가족 무제한 시청권',
    description: '4인 동시 시청! 지금 구독하기',
    price: 29900,
    priceUnit: '원',
    category: '구독',
    duration: '30일',
    isSubscription: true,
    subscriptionLabel: '대가족 무제한 시청권',
    subscriptionSubLabel: '4인 동시 시청! 지금 구독하기',
  },
  {
    id: 'sub-2',
    name: '개인 무제한 시청권',
    description: '1인 무제한 시청! 나만의 스포츠 생활',
    price: 9900,
    priceUnit: '원',
    category: '구독',
    duration: '30일',
    isSubscription: true,
  },
  {
    id: 'sub-3',
    name: '커플 시청권',
    description: '2인 동시 시청 가능한 알뜰 구독',
    price: 15900,
    priceUnit: '원',
    category: '구독',
    duration: '30일',
    isSubscription: true,
  },
  // 대회권
  {
    id: 'comp-1',
    name: '6회 MLB컵 리틀야구 U10',
    description: '리틀야구 U10 전 경기 시청',
    price: 10000,
    priceUnit: '원',
    category: '대회권',
    duration: '대회기간',
  },
  {
    id: 'comp-2',
    name: '2026 전국 유소년 축구대회',
    description: '유소년 축구 전 경기 시청 가능',
    price: 15000,
    priceUnit: '원',
    category: '대회권',
    duration: '대회기간',
  },
  {
    id: 'comp-3',
    name: '제3회 포착컵 농구대회',
    description: '포착컵 농구 전 경기 시청',
    price: 100,
    priceUnit: '뽈',
    category: '대회권',
    duration: '대회기간',
  },
  // 경기 패스
  {
    id: 'pass-1',
    name: '1경기 시청권',
    description: '원하는 경기 1개를 선택하여 시청',
    price: 3000,
    priceUnit: '원',
    category: '경기 패스',
  },
  {
    id: 'pass-2',
    name: '5경기 패스',
    description: '5경기를 자유롭게 선택 시청',
    price: 12000,
    priceUnit: '원',
    category: '경기 패스',
    duration: '30일',
  },
  {
    id: 'pass-3',
    name: '10경기 패스',
    description: '10경기를 자유롭게 선택 시청',
    price: 200,
    priceUnit: '뽈',
    category: '경기 패스',
    duration: '30일',
  },
  // 충전
  {
    id: 'charge-1',
    name: '뽈 100P 충전',
    description: '100 뽈을 충전합니다',
    price: 1000,
    priceUnit: '원',
    category: '충전',
  },
  {
    id: 'charge-2',
    name: '뽈 500P 충전',
    description: '500 뽈을 충전합니다 (10% 보너스)',
    price: 5000,
    priceUnit: '원',
    category: '충전',
  },
  {
    id: 'charge-3',
    name: '뽈 1,000P 충전',
    description: '1,000 뽈을 충전합니다 (20% 보너스)',
    price: 10000,
    priceUnit: '원',
    category: '충전',
  },
];

export const mockPurchases: PurchaseRecord[] = [
  {
    id: 'pur-1',
    productId: 'sub-1',
    productName: '대가족 무제한 시청권',
    amount: 29900,
    priceUnit: '원',
    paymentMethod: '신용/체크카드',
    purchaseDate: '2026.01.01',
    expiryDate: '2026.01.31',
    status: '완료',
  },
  {
    id: 'pur-2',
    productId: 'comp-1',
    productName: '6회 MLB컵 리틀야구 U10',
    amount: 10000,
    priceUnit: '원',
    paymentMethod: '카카오페이',
    purchaseDate: '2026.01.05',
    status: '완료',
  },
  {
    id: 'pur-3',
    productId: 'charge-2',
    productName: '뽈 500P 충전',
    amount: 5000,
    priceUnit: '원',
    paymentMethod: '네이버페이',
    purchaseDate: '2026.01.10',
    status: '완료',
  },
];

export const paymentMethods: {method: PaymentMethod; icon: string; balance?: string}[] = [
  {method: '신용/체크카드', icon: 'credit-card'},
  {method: '카카오페이', icon: 'account-balance-wallet'},
  {method: '네이버페이', icon: 'payment'},
  {method: '뽈 결제', icon: 'monetization-on', balance: '10,000P'},
];

export function formatPrice(price: number, unit: '원' | '뽈'): string {
  if (unit === '뽈') {
    return `${price.toLocaleString()}뽈`;
  }
  return `${price.toLocaleString()}원`;
}

// --- Gift / Friend mock data ---

export interface Friend {
  id: string;
  name: string;
  group: string;
}

export interface FriendGroup {
  id: string;
  label: string;
  members: Friend[];
}

export const mockFriendGroups: FriendGroup[] = [
  {
    id: 'family',
    label: '가족',
    members: [
      {id: 'f-1', name: '장길산', group: 'family'},
      {id: 'f-2', name: '임꺽정', group: 'family'},
      {id: 'f-3', name: '전우치', group: 'family'},
    ],
  },
  {
    id: 'club-a',
    label: '내 클럽 A',
    members: [
      {id: 'ca-1', name: '김철수', group: 'club-a'},
      {id: 'ca-2', name: '이영희', group: 'club-a'},
      {id: 'ca-3', name: '박민수', group: 'club-a'},
    ],
  },
  {
    id: 'club-b',
    label: '내 클럽 B',
    members: [
      {id: 'cb-1', name: '최지훈', group: 'club-b'},
      {id: 'cb-2', name: '정수연', group: 'club-b'},
    ],
  },
];

// --- Product Detail tab categories (UX p111) ---

export type ProductTabCategory = '전체' | '유형A' | '유형B' | '유형C' | '제휴';

export const productTabCategories: ProductTabCategory[] = [
  '전체',
  '유형A',
  '유형B',
  '유형C',
  '제휴',
];

export interface ProductDetailCard {
  id: string;
  name: string;
  description: string;
  price: number;
  priceUnit: '원' | '뽈';
  contentInfo: string;
  tab: ProductTabCategory;
}

export const mockProductDetailCards: ProductDetailCard[] = [
  {
    id: 'pd-1',
    name: '대가족 무제한 시청권',
    description: '4인 동시 시청! 모든 대회 무제한 시청',
    price: 29900,
    priceUnit: '원',
    contentInfo: '전 대회 무제한 시청 / 4인 동시접속 / 클립 무제한 생성',
    tab: '전체',
  },
  {
    id: 'pd-2',
    name: '개인 무제한 시청권',
    description: '1인 무제한 시청! 나만의 스포츠 생활',
    price: 9900,
    priceUnit: '원',
    contentInfo: '전 대회 무제한 시청 / 1인 접속 / 클립 월 5회 생성',
    tab: '전체',
  },
  {
    id: 'pd-3',
    name: '6회 MLB컵 리틀야구 U10',
    description: '리틀야구 U10 전 경기 시청',
    price: 10000,
    priceUnit: '원',
    contentInfo: '해당 대회 전 경기 시청 / 대회기간 내 유효',
    tab: '유형A',
  },
  {
    id: 'pd-4',
    name: '5경기 패스',
    description: '5경기를 자유롭게 선택 시청',
    price: 12000,
    priceUnit: '원',
    contentInfo: '5경기 선택 시청 / 30일 유효',
    tab: '유형B',
  },
  {
    id: 'pd-5',
    name: '뽈 500P 충전',
    description: '500 뽈을 충전합니다 (10% 보너스)',
    price: 5000,
    priceUnit: '원',
    contentInfo: '500P + 보너스 50P 지급',
    tab: '유형C',
  },
  {
    id: 'pd-6',
    name: '제휴 스포츠 시설 이용권',
    description: '제휴 시설 할인 이용 가능',
    price: 20000,
    priceUnit: '원',
    contentInfo: '전국 제휴 시설 10% 할인 / 30일 유효',
    tab: '제휴',
  },
];

// --- Account / Login history mock data (UX p117-118) ---

export interface LoginRecord {
  id: string;
  date: string;
  time: string;
  platform: string;
  device: string;
}

export const mockLoginRecords: LoginRecord[] = [
  {id: 'lr-1', date: '2026.03.19', time: '09:30', platform: 'iOS', device: 'iPhone 15 Pro'},
  {id: 'lr-2', date: '2026.03.18', time: '21:15', platform: 'Android', device: 'Galaxy S24'},
  {id: 'lr-3', date: '2026.03.17', time: '14:00', platform: 'Web', device: 'Chrome 브라우저'},
  {id: 'lr-4', date: '2026.03.16', time: '08:45', platform: 'iOS', device: 'iPhone 15 Pro'},
];
