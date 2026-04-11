import { useState } from 'react';
import { LuBell, LuVideo, LuCalendar, LuMegaphone, LuCheck, LuX, LuTrophy, LuUsers } from 'react-icons/lu';
import FilterChip from '@/components/FilterChip';

const categories = ['전체', '라이브', '대회', '팀', '클럽', '시스템'] as const;

const iconMap: Record<string, typeof LuBell> = {
  '라이브': LuVideo, '대회': LuTrophy, '팀': LuCalendar, '클럽': LuUsers, '시스템': LuBell,
};

interface Notification {
  id: string;
  category: string;
  title: string;
  description?: string;
  time: string;
  read: boolean;
  date: string;
}

const initialNotifications: Notification[] = [
  { id: '1', category: '라이브', title: '수원 FC vs 강남 유나이티드 라이브 시작', description: '6회 MLB컵 리틀야구 U10 | 준결승전이 곧 시작됩니다.', time: '5분 전', read: false, date: '오늘' },
  { id: '2', category: '대회', title: '2025 화랑대기 유소년축구대회 일정 업데이트', description: '새로운 경기 일정이 등록되었습니다. 확인해보세요.', time: '30분 전', read: false, date: '오늘' },
  { id: '3', category: '라이브', title: '동대문구 리틀야구 vs 군포시 리틀야구 30분 후 시작', description: '시청 예약하신 경기가 곧 시작됩니다.', time: '1시간 전', read: false, date: '오늘' },
  { id: '4', category: '팀', title: '서울 블루스가 새 영상을 업로드했습니다', description: '2025 시즌 하이라이트 영상이 등록되었습니다.', time: '3시간 전', read: true, date: '오늘' },
  { id: '5', category: '클럽', title: '도곡 스포츠 아카데미 클럽에서 새 공지', description: '이번 주 토요일 연습 일정이 변경되었습니다.', time: '5시간 전', read: true, date: '오늘' },
  { id: '6', category: '시스템', title: '구독 결제가 완료되었습니다', description: '대가족 무제한 시청권 월 구독이 갱신되었습니다.', time: '1일 전', read: true, date: '어제' },
  { id: '7', category: '라이브', title: '부산 FC vs 대구 어태커즈 라이브 종료', description: '경기 결과: 3:1 (부산 FC 승) | 다시보기가 등록되었습니다.', time: '1일 전', read: true, date: '어제' },
  { id: '8', category: '대회', title: '106회 전국체육대회 참가 접수 시작', description: '배구 부문 참가 접수가 시작되었습니다. 마감일: 2026.02.15', time: '2일 전', read: true, date: '어제' },
  { id: '9', category: '시스템', title: '클립 생성이 완료되었습니다', description: '"동대문구 리틀야구 하이라이트" 클립이 저장되었습니다.', time: '2일 전', read: true, date: '이전' },
  { id: '10', category: '팀', title: '동대문구 리틀야구 팀 일정 업데이트', description: '다음 경기: 2026.01.15 vs 군포시 리틀야구', time: '3일 전', read: true, date: '이전' },
  { id: '11', category: '클럽', title: '강남 농구클럽 새 멤버가 가입했습니다', description: '김포착 님이 클럽에 가입했습니다.', time: '4일 전', read: true, date: '이전' },
  { id: '12', category: '시스템', title: '내 클립에 좋아요 10개 달성', description: '"리틀야구 하이라이트" 클립이 좋아요 10개를 달성했습니다.', time: '5일 전', read: true, date: '이전' },
];

export default function NotificationsPage() {
  const [activeCategory, setActiveCategory] = useState<string>('전체');
  const [notifications, setNotifications] = useState(initialNotifications);

  const filtered = activeCategory === '전체'
    ? notifications
    : notifications.filter((n) => n.category === activeCategory);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Group by date
  const grouped = filtered.reduce<Record<string, Notification[]>>((acc, n) => {
    (acc[n.date] = acc[n.date] || []).push(n);
    return acc;
  }, {});

  return (
    <div className="py-6 max-w-[800px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-[22px] font-bold text-foreground">알림</h1>
          {unreadCount > 0 && (
            <span className="bg-primary/20 text-primary text-[13px] font-bold px-2 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <button
          onClick={markAllRead}
          className="flex items-center gap-1.5 text-[14px] text-muted-foreground hover:text-primary transition-colors"
        >
          <LuCheck className="w-4 h-4" /> 모두 읽음
        </button>
      </div>

      {/* Category filter */}
      <div className="flex gap-0 mb-8 border-b border-white/[0.06]">
        {categories.map((c) => {
          const count = c === '전체' ? notifications.length : notifications.filter((n) => n.category === c).length;
          return (
            <FilterChip
              key={c}
              label={`${c}${count > 0 ? ` ${count}` : ''}`}
              selected={activeCategory === c}
              onClick={() => setActiveCategory(c)}
            />
          );
        })}
      </div>

      {/* Grouped notifications */}
      {Object.keys(grouped).length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24">
          <LuBell className="w-12 h-12 text-pochak-text-muted mb-4" />
          <p className="text-[16px] font-semibold text-foreground">알림이 없습니다</p>
          <p className="text-[14px] text-muted-foreground mt-1">새로운 알림이 도착하면 여기에 표시됩니다.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {Object.entries(grouped).map(([date, items]) => (
            <div key={date}>
              <h3 className="text-[14px] font-semibold text-muted-foreground mb-3">{date}</h3>
              <div className="flex flex-col gap-1">
                {items.map((n) => {
                  const Icon = iconMap[n.category] ?? LuBell;
                  return (
                    <div
                      key={n.id}
                      onClick={() => markAsRead(n.id)}
                      className={`flex items-start gap-4 p-4 rounded-lg transition-colors cursor-pointer group ${
                        n.read ? 'hover:bg-white/[0.02]' : 'bg-primary/[0.03] hover:bg-primary/[0.06]'
                      }`}
                    >
                      {/* Icon */}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        n.read ? 'bg-white/[0.04]' : 'bg-primary/10'
                      }`}>
                        <Icon className={`w-5 h-5 ${n.read ? 'text-pochak-text-muted' : 'text-primary'}`} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className={`text-[15px] leading-snug ${n.read ? 'text-muted-foreground' : 'text-foreground font-medium'}`}>
                          {n.title}
                        </p>
                        {n.description && (
                          <p className="text-[14px] text-pochak-text-tertiary mt-1 line-clamp-2">{n.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-[13px] text-pochak-text-muted">{n.time}</span>
                          <span className="text-[13px] text-pochak-text-muted">|</span>
                          <span className="text-[13px] text-pochak-text-muted">{n.category}</span>
                        </div>
                      </div>

                      {/* Right side: unread dot + delete */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {!n.read && <span className="w-2.5 h-2.5 rounded-full bg-primary" />}
                        <button
                          onClick={(e) => { e.stopPropagation(); removeNotification(n.id); }}
                          className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-md flex items-center justify-center text-pochak-text-muted hover:text-foreground hover:bg-white/[0.06] transition-all"
                        >
                          <LuX className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
