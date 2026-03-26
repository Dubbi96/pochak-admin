import { useState, useCallback } from 'react';
import {
  Bell,
  Calendar,
  Film,
  ShoppingBag,
  Trophy,
  Users,
  Settings,
  Check,
} from 'lucide-react';

/* ── localStorage persistence helpers ──────────────────────────────────────── */
const READ_KEY = 'pochak_notifications_read';

function getReadIds(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(READ_KEY) || '[]') as string[]);
  } catch { return new Set(); }
}

function saveReadIds(ids: Set<string>) {
  localStorage.setItem(READ_KEY, JSON.stringify([...ids]));
  window.dispatchEvent(new Event('pochak_notification_change'));
}

/* ── Notification types ──────────────────────────────────────────────────── */

type NotificationType =
  | '시청예약'
  | '클립'
  | '구독/이용권'
  | '대회소식'
  | '커뮤니티'
  | '시스템';

type FilterTab = '전체' | NotificationType;

const filterTabs: FilterTab[] = [
  '전체',
  '시청예약',
  '클립',
  '구독/이용권',
  '대회소식',
  '커뮤니티',
  '시스템',
];

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  timestamp: string;
  isRead: boolean;
  thumbnailUrl?: string;
  actionLabel?: string;
  actionUrl?: string;
}

/* ── Mock data ───────────────────────────────────────────────────────────── */

const initialNotifications: Notification[] = [
  {
    id: '1',
    type: '시청예약',
    title: '파주시민축구단 vs 인천 유나이티드 FC',
    description: '예약하신 경기가 10분 후 시작됩니다.',
    timestamp: '10분 전',
    isRead: false,
    actionLabel: '시청하기',
    actionUrl: '/contents/live/1',
  },
  {
    id: '2',
    type: '클립',
    title: '내 클립이 생성되었습니다',
    description: '파주 vs 인천 경기에서 생성한 클립이 준비되었습니다.',
    timestamp: '30분 전',
    isRead: false,
    thumbnailUrl: 'https://picsum.photos/seed/clip1/90/160',
    actionLabel: '확인',
  },
  {
    id: '3',
    type: '구독/이용권',
    title: '구독 결제 완료',
    description: '대가족 무제한 시청권이 정상적으로 결제되었습니다. 다음 결제일: 2026.02.01',
    timestamp: '1시간 전',
    isRead: false,
  },
  {
    id: '4',
    type: '대회소식',
    title: '제6회 MLB컵 전국리틀야구대회 일정 안내',
    description: '2026년 1월 15일부터 예선 경기가 시작됩니다.',
    timestamp: '2시간 전',
    isRead: false,
    thumbnailUrl: 'https://picsum.photos/seed/comp1/160/90',
    actionLabel: '확인',
  },
  {
    id: '5',
    type: '커뮤니티',
    title: '새로운 댓글이 달렸습니다',
    description: '내 게시물에 "정말 멋진 경기였어요!" 댓글이 달렸습니다.',
    timestamp: '3시간 전',
    isRead: true,
  },
  {
    id: '6',
    type: '시스템',
    title: '서비스 점검 안내',
    description: '1월 20일 02:00~06:00 시스템 점검이 진행됩니다.',
    timestamp: '5시간 전',
    isRead: true,
  },
  {
    id: '7',
    type: '시청예약',
    title: 'KT 위즈 주니어 vs 삼성 라이온즈 주니어',
    description: '시청 예약이 확인되었습니다. 경기 시작 10분 전에 알려드릴게요.',
    timestamp: '어제',
    isRead: true,
    actionLabel: '시청하기',
  },
  {
    id: '8',
    type: '클립',
    title: '내 클립에 좋아요가 눌렸습니다',
    description: '"결승골 하이라이트" 클립에 15명이 좋아요를 눌렀습니다.',
    timestamp: '어제',
    isRead: true,
    thumbnailUrl: 'https://picsum.photos/seed/clip2/90/160',
  },
  {
    id: '9',
    type: '구독/이용권',
    title: '이용권 만료 예정',
    description: '보유하신 종목 시청권이 3일 후 만료됩니다. 갱신해 주세요.',
    timestamp: '어제',
    isRead: true,
    actionLabel: '확인',
  },
  {
    id: '10',
    type: '대회소식',
    title: '화랑대기 전국유소년축구대회 결과',
    description: '8강 대진표가 확정되었습니다. 결과를 확인하세요.',
    timestamp: '2026.01.15',
    isRead: true,
    thumbnailUrl: 'https://picsum.photos/seed/comp2/160/90',
  },
  {
    id: '11',
    type: '커뮤니티',
    title: '클럽 공지사항이 등록되었습니다',
    description: '파주FC 유소년 클럽에서 새 공지사항을 등록했습니다.',
    timestamp: '2026.01.14',
    isRead: true,
  },
  {
    id: '12',
    type: '시스템',
    title: '개인정보 처리방침 변경 안내',
    description: '2026년 2월 1일부터 변경되는 개인정보 처리방침을 확인해 주세요.',
    timestamp: '2026.01.13',
    isRead: true,
    actionLabel: '확인',
  },
  {
    id: '13',
    type: '시청예약',
    title: '파주시민축구단 vs 수원 삼성 블루윙즈',
    description: '경기가 종료되었습니다. 하이라이트를 확인해 보세요.',
    timestamp: '2026.01.12',
    isRead: true,
  },
  {
    id: '14',
    type: '클립',
    title: '추천 클립이 도착했습니다',
    description: '즐겨찾기한 팀의 주간 베스트 클립을 확인하세요.',
    timestamp: '2026.01.11',
    isRead: true,
    thumbnailUrl: 'https://picsum.photos/seed/clip3/90/160',
  },
  {
    id: '15',
    type: '구독/이용권',
    title: '선물이 도착했습니다',
    description: '포착유저님이 보낸 기프트볼 1,000P가 도착했습니다.',
    timestamp: '2026.01.10',
    isRead: true,
    actionLabel: '확인',
  },
  {
    id: '16',
    type: '대회소식',
    title: '새 대회가 등록되었습니다',
    description: '2026 전국 유소년 핸드볼 챔피언십이 등록되었습니다.',
    timestamp: '2026.01.09',
    isRead: true,
  },
  {
    id: '17',
    type: '커뮤니티',
    title: '내 게시물이 인기 게시물에 선정되었습니다',
    description: '"우리 아이 첫 골" 게시물이 주간 인기 게시물에 선정되었습니다.',
    timestamp: '2026.01.08',
    isRead: true,
  },
  {
    id: '18',
    type: '시스템',
    title: '앱 업데이트 안내',
    description: '포착 v2.1.0 업데이트가 제공됩니다. 새로운 기능을 확인하세요.',
    timestamp: '2026.01.07',
    isRead: true,
  },
];

/* ── Icon by notification type ───────────────────────────────────────────── */

function NotificationIcon({ type, thumbnailUrl }: { type: NotificationType; thumbnailUrl?: string }) {
  // If there's a thumbnail, show it
  if (thumbnailUrl) {
    const isClip = type === '클립';
    return (
      <div
        className={`flex-shrink-0 rounded-lg overflow-hidden bg-[#333] ${
          isClip ? 'w-[36px] h-[64px]' : 'w-[64px] h-[36px]'
        }`}
      >
        <img
          src={thumbnailUrl}
          alt=""
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  // Otherwise show icon
  const iconMap: Record<NotificationType, React.ReactNode> = {
    시청예약: <Calendar className="h-5 w-5" />,
    클립: <Film className="h-5 w-5" />,
    '구독/이용권': <ShoppingBag className="h-5 w-5" />,
    대회소식: <Trophy className="h-5 w-5" />,
    커뮤니티: <Users className="h-5 w-5" />,
    시스템: <Settings className="h-5 w-5" />,
  };

  const colorMap: Record<NotificationType, string> = {
    시청예약: 'bg-blue-600/20 text-blue-400',
    클립: 'bg-purple-600/20 text-purple-400',
    '구독/이용권': 'bg-amber-600/20 text-amber-400',
    대회소식: 'bg-red-600/20 text-red-400',
    커뮤니티: 'bg-cyan-600/20 text-cyan-400',
    시스템: 'bg-gray-600/20 text-gray-400',
  };

  return (
    <div
      className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${colorMap[type]}`}
    >
      {iconMap[type]}
    </div>
  );
}

/* ── Notification item row ───────────────────────────────────────────────── */

function NotificationItem({
  notification,
  onClick,
}: {
  notification: Notification;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`flex items-start gap-3 px-4 py-4 rounded-xl transition-colors cursor-pointer ${
        notification.isRead ? 'bg-[#262626]' : 'bg-[#2A2A2A]'
      }`}
    >
      {/* Left: icon or thumbnail */}
      <NotificationIcon type={notification.type} thumbnailUrl={notification.thumbnailUrl} />

      {/* Center: text content */}
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-semibold text-white truncate">
          {notification.title}
        </p>
        <p className="text-[13px] text-[#A6A6A6] mt-0.5 line-clamp-2">
          {notification.description}
        </p>
        <p className="text-[12px] text-[#666] mt-1">{notification.timestamp}</p>
      </div>

      {/* Right: unread dot + action button */}
      <div className="flex items-center gap-3 flex-shrink-0 pt-1">
        {notification.actionLabel && (
          <button className="px-3 py-1 text-[12px] font-medium rounded-full bg-[#00CC33] text-white hover:bg-[#00B82E] transition-colors">
            {notification.actionLabel}
          </button>
        )}
        {!notification.isRead && (
          <span className="w-[6px] h-[6px] rounded-full bg-[#00CC33] flex-shrink-0" />
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   NotificationPage
   ══════════════════════════════════════════════════════════════════════════════ */

export default function NotificationPage() {
  const [activeFilter, setActiveFilter] = useState<FilterTab>('전체');
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const readIds = getReadIds();
    return initialNotifications.map((n) => ({
      ...n,
      isRead: readIds.has(n.id) || n.isRead,
    }));
  });

  /* ── Derived data ─────────────────────────────────────────────────────── */
  const filteredNotifications =
    activeFilter === '전체'
      ? notifications
      : notifications.filter((n) => n.type === activeFilter);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  /* ── Mark all as read ────────────────────────────────────────────────── */
  const handleMarkAllRead = () => {
    const allIds = new Set(notifications.map((n) => n.id));
    saveReadIds(allIds);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  /* ── Mark single notification as read ─────────────────────────────────── */
  const handleNotificationClick = useCallback((id: string) => {
    const readIds = getReadIds();
    readIds.add(id);
    saveReadIds(readIds);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );
  }, []);

  return (
    <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">알림내역</h1>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 text-[12px] font-semibold rounded-full bg-[#00CC33] text-white">
                {unreadCount}
              </span>
            )}
          </div>
          <button
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0}
            className="flex items-center gap-1.5 text-[13px] text-[#A6A6A6] hover:text-white transition-colors disabled:opacity-40 disabled:cursor-default"
          >
            <Check className="h-4 w-4" />
            모두 읽음
          </button>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {filterTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeFilter === tab
                  ? 'bg-[#00CC33] text-white'
                  : 'bg-[#262626] text-[#A6A6A6] hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Notification list */}
        {filteredNotifications.length > 0 ? (
          <div className="flex flex-col gap-2">
            {filteredNotifications.map((notification) => (
              <NotificationItem key={notification.id} notification={notification} onClick={() => handleNotificationClick(notification.id)} />
            ))}
          </div>
        ) : (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Bell className="h-12 w-12 text-[#4D4D4D] mb-4" />
            <p className="text-[15px] text-[#A6A6A6]">알림이 없습니다</p>
          </div>
        )}
    </div>
  );
}
