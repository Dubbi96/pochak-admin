/**
 * Community API service
 * Currently returns mock data. Will be replaced with real API calls.
 */

// ── Types ──────────────────────────────────────────────────────────

export type CommunityCategory = '전체' | '자유게시판' | '경기후기' | '질문/답변' | '팁/공략';

export type PostType = '소식' | '구인' | '모집' | '자유';

export const COMMUNITY_CATEGORIES: CommunityCategory[] = [
  '전체',
  '자유게시판',
  '경기후기',
  '질문/답변',
  '팁/공략',
];

export const POST_TYPES: PostType[] = ['소식', '구인', '모집', '자유'];

export const COMMUNITY_REGIONS = [
  '전체',
  '서울 송파구',
  '서울 강남구',
  '서울 마포구',
  '서울 용산구',
  '경기 성남시',
  '경기 수원시',
  '부산 해운대구',
];

export interface PostItem {
  id: string;
  category: CommunityCategory;
  postType: PostType;
  region: string;
  title: string;
  content: string;
  authorName: string;
  authorInitials: string;
  createdAt: string;
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
}

// ── Helpers ────────────────────────────────────────────────────────

function delay(ms = 300): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function formatRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return '방금 전';
  if (diffMin < 60) return `${diffMin}분 전`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}시간 전`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 7) return `${diffDay}일 전`;
  return dateStr.slice(0, 10);
}

// ── Mock Data ──────────────────────────────────────────────────────

export const mockPosts: PostItem[] = [
  {
    id: '1',
    category: '자유게시판',
    postType: '자유',
    region: '서울 송파구',
    title: '오늘 서울 vs 부산 경기 보신 분?',
    content: '마지막 골 장면이 정말 대단했어요. 역시 에이스 선수의 실력은 다르네요. 다음 경기도 기대됩니다.',
    authorName: '축구매니아',
    authorInitials: '축매',
    createdAt: '2026-03-19T14:30:00',
    likeCount: 24,
    commentCount: 8,
    isLiked: false,
  },
  {
    id: '2',
    category: '경기후기',
    postType: '소식',
    region: '서울 강남구',
    title: '인천 vs 대전 농구 경기 후기',
    content: '3쿼터 역전 장면이 압권이었습니다. 올해 최고의 경기라고 해도 과언이 아닐 듯합니다.',
    authorName: '바스켓볼러',
    authorInitials: '바볼',
    createdAt: '2026-03-19T12:15:00',
    likeCount: 42,
    commentCount: 15,
    isLiked: true,
  },
  {
    id: '3',
    category: '질문/답변',
    postType: '자유',
    region: '서울 마포구',
    title: '시즌권 환불은 어떻게 하나요?',
    content: '시즌권을 구매했는데 환불이 가능한지 궁금합니다. 아직 경기를 한 번도 안 봤거든요.',
    authorName: '뉴비유저',
    authorInitials: '뉴유',
    createdAt: '2026-03-19T10:00:00',
    likeCount: 5,
    commentCount: 3,
    isLiked: false,
  },
  {
    id: '4',
    category: '팁/공략',
    postType: '소식',
    region: '서울 송파구',
    title: '포착 앱으로 최적의 클립 만드는 방법',
    content: '클립 편집 기능을 활용하면 하이라이트 장면을 깔끔하게 만들 수 있어요. 먼저 타임라인에서 원하는 구간을 선택하고...',
    authorName: '클립마스터',
    authorInitials: '클마',
    createdAt: '2026-03-18T22:45:00',
    likeCount: 67,
    commentCount: 21,
    isLiked: true,
  },
  {
    id: '5',
    category: '자유게시판',
    postType: '모집',
    region: '경기 수원시',
    title: '이번 주말 경기 같이 볼 사람!',
    content: '토요일 수원 vs 울산 경기 같이 시청하실 분 계신가요? 온라인 시청 모임 만들어볼까 합니다.',
    authorName: '같이보자',
    authorInitials: '같보',
    createdAt: '2026-03-18T18:30:00',
    likeCount: 12,
    commentCount: 6,
    isLiked: false,
  },
  {
    id: '6',
    category: '경기후기',
    postType: '소식',
    region: '서울 용산구',
    title: '전주 vs 광주 야구 경기 리뷰',
    content: '9회말 역전 홈런은 정말 소름이었습니다. 올시즌 베스트 경기 후보감이네요.',
    authorName: '야구덕후',
    authorInitials: '야덕',
    createdAt: '2026-03-18T15:20:00',
    likeCount: 35,
    commentCount: 11,
    isLiked: false,
  },
  {
    id: '7',
    category: '질문/답변',
    postType: '구인',
    region: '서울 강남구',
    title: '축구팀 골키퍼 구합니다',
    content: '매주 토요일 오전 강남구에서 활동하는 축구팀입니다. 골키퍼 포지션 한 분 급구합니다.',
    authorName: '강남FC운영',
    authorInitials: '강운',
    createdAt: '2026-03-18T09:10:00',
    likeCount: 8,
    commentCount: 4,
    isLiked: false,
  },
  {
    id: '8',
    category: '팁/공략',
    postType: '자유',
    region: '부산 해운대구',
    title: '시즌권 가성비 비교 정리',
    content: '3일권, 7일권, 30일권, 365일권 가성비를 비교해봤습니다. 결론부터 말하면 30일권이 가장 가성비가 좋습니다.',
    authorName: '절약왕',
    authorInitials: '절왕',
    createdAt: '2026-03-17T20:00:00',
    likeCount: 89,
    commentCount: 32,
    isLiked: true,
  },
  {
    id: '9',
    category: '자유게시판',
    postType: '구인',
    region: '서울 송파구',
    title: '배드민턴 코치 구합니다',
    content: '송파구에서 주 2회 배드민턴 레슨 가능하신 코치 분을 찾습니다. 초중급 대상.',
    authorName: '송파배드민턴',
    authorInitials: '송배',
    createdAt: '2026-03-17T14:00:00',
    likeCount: 15,
    commentCount: 7,
    isLiked: false,
  },
  {
    id: '10',
    category: '자유게시판',
    postType: '모집',
    region: '서울 마포구',
    title: '한강 러닝크루 신규 멤버 모집',
    content: '매주 수요일, 토요일 한강에서 함께 달릴 멤버를 모집합니다. 실력 무관, 즐거움이 목표!',
    authorName: '한강러닝',
    authorInitials: '한러',
    createdAt: '2026-03-17T10:00:00',
    likeCount: 31,
    commentCount: 12,
    isLiked: false,
  },
];

// ── API Functions ──────────────────────────────────────────────────

export async function getCommunityPosts(
  category: CommunityCategory = '전체',
  postType?: PostType,
  region?: string,
): Promise<PostItem[]> {
  await delay();
  let result = mockPosts;
  if (category !== '전체') {
    result = result.filter(p => p.category === category);
  }
  if (postType) {
    result = result.filter(p => p.postType === postType);
  }
  if (region && region !== '전체') {
    result = result.filter(p => p.region === region);
  }
  return result;
}

export async function togglePostLike(postId: string): Promise<{isLiked: boolean; likeCount: number}> {
  await delay(100);
  const post = mockPosts.find(p => p.id === postId);
  if (!post) throw new Error('Post not found');
  post.isLiked = !post.isLiked;
  post.likeCount += post.isLiked ? 1 : -1;
  return {isLiked: post.isLiked, likeCount: post.likeCount};
}
