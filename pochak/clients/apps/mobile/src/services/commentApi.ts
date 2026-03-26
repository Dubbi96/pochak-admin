// Comment API service with mock data fallback

export interface Comment {
  id: string;
  userId: string;
  username: string;
  userInitial: string;
  body: string;
  createdAt: string;
  isOwn: boolean;
  children: Comment[];
}

const MOCK_COMMENTS: Comment[] = [
  {
    id: 'c1',
    userId: 'u1',
    username: '김태호',
    userInitial: '김',
    body: '이번 경기 진짜 좋았어요! 하이라이트 장면이 최고였습니다.',
    createdAt: '2시간 전',
    isOwn: false,
    children: [
      {
        id: 'c1-1',
        userId: 'u2',
        username: '이준서',
        userInitial: '이',
        body: '저도 동감이에요! 특히 후반전 골 장면이 인상적이었어요.',
        createdAt: '1시간 전',
        isOwn: false,
        children: [],
      },
      {
        id: 'c1-2',
        userId: 'me',
        username: '나',
        userInitial: '나',
        body: '맞아요 정말 명경기였습니다',
        createdAt: '30분 전',
        isOwn: true,
        children: [],
      },
    ],
  },
  {
    id: 'c2',
    userId: 'u3',
    username: '박민수',
    userInitial: '박',
    body: '선수들 컨디션이 정말 좋아 보이네요. 다음 경기도 기대됩니다!',
    createdAt: '3시간 전',
    isOwn: false,
    children: [],
  },
  {
    id: 'c3',
    userId: 'u4',
    username: '최영진',
    userInitial: '최',
    body: '카메라 앵글이 점점 좋아지는 것 같아요. 포착 최고!',
    createdAt: '4시간 전',
    isOwn: false,
    children: [
      {
        id: 'c3-1',
        userId: 'u5',
        username: '정한울',
        userInitial: '정',
        body: 'AI 카메라뷰가 특히 좋더라고요',
        createdAt: '3시간 전',
        isOwn: false,
        children: [],
      },
    ],
  },
  {
    id: 'c4',
    userId: 'me',
    username: '나',
    userInitial: '나',
    body: '풀 경기 다시 봐야겠다',
    createdAt: '5시간 전',
    isOwn: true,
    children: [],
  },
];

const API_BASE = 'https://api.pochak.app';

export async function fetchComments(
  contentType: string,
  contentId: string,
): Promise<Comment[]> {
  try {
    const res = await fetch(
      `${API_BASE}/contents/${contentType}/${contentId}/comments`,
    );
    if (!res.ok) throw new Error('API error');
    return await res.json();
  } catch {
    // Fallback to mock
    return MOCK_COMMENTS;
  }
}

export async function postComment(
  contentType: string,
  contentId: string,
  body: string,
  parentId?: string,
): Promise<Comment> {
  try {
    const res = await fetch(
      `${API_BASE}/contents/${contentType}/${contentId}/comments`,
      {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({body, parentId}),
      },
    );
    if (!res.ok) throw new Error('API error');
    return await res.json();
  } catch {
    // Mock new comment
    return {
      id: `c-${Date.now()}`,
      userId: 'me',
      username: '나',
      userInitial: '나',
      body,
      createdAt: '방금 전',
      isOwn: true,
      children: [],
    };
  }
}

export async function deleteComment(
  contentType: string,
  contentId: string,
  commentId: string,
): Promise<boolean> {
  try {
    const res = await fetch(
      `${API_BASE}/contents/${contentType}/${contentId}/comments/${commentId}`,
      {method: 'DELETE'},
    );
    if (!res.ok) throw new Error('API error');
    return true;
  } catch {
    // Mock success
    return true;
  }
}
