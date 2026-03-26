// Mock data and types for Notification screen

export type NotificationType =
  | 'SYSTEM'
  | 'MARKETING'
  | 'RESERVATION'
  | 'MATCH'
  | 'PURCHASE'
  | 'GIFT';

export type NotificationTab = '전체' | '서비스' | '마케팅' | '예약' | '선물';

export const NOTIFICATION_TABS: NotificationTab[] = [
  '전체',
  '서비스',
  '마케팅',
  '예약',
  '선물',
];

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  content: string;
  createdAt: string; // ISO string
  isRead: boolean;
  navigateTo?: string;
}

// --------------- Tab → Type mapping ---------------

export function getTypesForTab(tab: NotificationTab): NotificationType[] | null {
  switch (tab) {
    case '전체':
      return null; // show all
    case '서비스':
      return ['SYSTEM', 'MATCH'];
    case '마케팅':
      return ['MARKETING'];
    case '예약':
      return ['RESERVATION'];
    case '선물':
      return ['GIFT', 'PURCHASE'];
  }
}

// --------------- Mock Notifications ---------------

export const mockNotifications: NotificationItem[] = [
  {
    id: 'n-1',
    type: 'RESERVATION',
    title: '예약이 확정되었습니다',
    content: '서울 월드컵경기장 보조구장 3/20 11:00 예약이 확정되었습니다.',
    createdAt: '2026-03-19T08:30:00',
    isRead: false,
    navigateTo: 'WatchReservation',
  },
  {
    id: 'n-2',
    type: 'MATCH',
    title: 'LG vs 삼성 경기 시작',
    content: '2026 KBO 리그 시범경기가 곧 시작됩니다. 지금 바로 시청하세요!',
    createdAt: '2026-03-19T16:50:00',
    isRead: false,
    navigateTo: 'Home',
  },
  {
    id: 'n-3',
    type: 'MARKETING',
    title: '봄맞이 특별 이벤트',
    content: '첫 촬영 예약 시 50% 할인! 3월 31일까지 진행됩니다.',
    createdAt: '2026-03-19T10:00:00',
    isRead: true,
  },
  {
    id: 'n-4',
    type: 'SYSTEM',
    title: '앱 업데이트 안내',
    content: 'POCHAK v2.1.0 업데이트가 출시되었습니다. 새로운 기능을 확인해보세요.',
    createdAt: '2026-03-18T15:00:00',
    isRead: true,
  },
  {
    id: 'n-5',
    type: 'GIFT',
    title: '선물이 도착했습니다!',
    content: 'pochak2026님이 경기패스 1개월권을 선물했습니다.',
    createdAt: '2026-03-18T12:00:00',
    isRead: false,
    navigateTo: 'Home',
  },
  {
    id: 'n-6',
    type: 'PURCHASE',
    title: '결제가 완료되었습니다',
    content: '경기패스 월간 구독 결제가 완료되었습니다. (9,900원)',
    createdAt: '2026-03-17T09:30:00',
    isRead: true,
  },
  {
    id: 'n-7',
    type: 'RESERVATION',
    title: '예약이 취소되었습니다',
    content: '고척 스카이돔 3/10 18:00 예약이 취소 처리되었습니다.',
    createdAt: '2026-03-09T14:00:00',
    isRead: true,
    navigateTo: 'WatchReservation',
  },
  {
    id: 'n-8',
    type: 'MATCH',
    title: '관심 경기 리마인더',
    content: '전북 현대 vs 울산 HD 경기가 내일 14:00에 시작됩니다.',
    createdAt: '2026-03-18T20:00:00',
    isRead: false,
    navigateTo: 'Home',
  },
  {
    id: 'n-9',
    type: 'MARKETING',
    title: '추천 구장 알림',
    content: '내 주변 새로운 촬영 가능 구장이 등록되었습니다.',
    createdAt: '2026-03-16T11:00:00',
    isRead: true,
  },
  {
    id: 'n-10',
    type: 'SYSTEM',
    title: '서비스 점검 안내',
    content: '3월 23일 02:00~06:00 서버 점검이 예정되어 있습니다.',
    createdAt: '2026-03-15T18:00:00',
    isRead: true,
  },
];

// --------------- Helpers ---------------

export function formatRelativeTime(isoString: string): string {
  const now = new Date();
  const date = new Date(isoString);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return '방금 전';
  if (diffMin < 60) return `${diffMin}분 전`;
  if (diffHour < 24) return `${diffHour}시간 전`;
  if (diffDay < 7) return `${diffDay}일 전`;
  if (diffDay < 30) return `${Math.floor(diffDay / 7)}주 전`;
  return `${Math.floor(diffDay / 30)}개월 전`;
}
