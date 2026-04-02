import { Link, useNavigate } from 'react-router-dom';
import {
  Pencil,
  Bell,
  Settings,
  UserCog,
  ChevronRight,
  ShoppingCart,
  History,
  Film,
  CalendarCheck,
  Star,
  Users,
  Heart,
  MessageSquare,
  Trophy,
  Building2,
  MapPin,
  Megaphone,
  Headphones,
  LogOut,
} from 'lucide-react';

interface ProfileSidebarProps {
  /** Currently active menu item path — used for highlight */
  activePath?: string;
}

const subscriptionInfo = [
  { label: '구독 관리', value: '대가족 무제한 시청권', sub: '다음결제일: 2026.01.01', linkTo: '/store' },
  { label: '볼/기프트볼 관리', value: '10,000P / 1,000P', linkTo: '/my/points' },
  { label: '이용권 관리', value: '10개', linkTo: '/my/tickets' },
  { label: '선물함', value: '10개', linkTo: '/my/gifts' },
];

const menuSections = [
  {
    items: [
      { label: '계정정보', path: '/account', icon: UserCog },
      { label: '구독/이용권 구매', path: '/store', icon: ShoppingCart },
      { label: '시청내역', path: '/my/history', icon: History },
      { label: '내 클립', path: '/my/clips', icon: Film },
      { label: '시청예약', path: '/my/reservations', icon: CalendarCheck },
      { label: '즐겨찾기', path: '/my/favorites', icon: Star },
    ],
  },
  {
    items: [
      { label: '가입한 클럽', path: '/my/clubs', icon: Users },
      { label: '관심클럽', path: '/my/interest-clubs', icon: Heart },
      { label: '커뮤니티', path: '/my/community', icon: MessageSquare },
    ],
  },
  {
    items: [
      { label: '대회소식', path: '/my/competitions', icon: Trophy },
      { label: '시설예약', path: '/my/facility', icon: Building2 },
      { label: '자주가는 시설', path: '/my/favorite-facility', icon: MapPin },
    ],
  },
  {
    items: [
      { label: '알림내역', path: '/notifications', icon: Bell },
      { label: '설정', path: '/settings', icon: Settings },
      { label: '공지사항', path: '/notices', icon: Megaphone },
      { label: '고객센터', path: '/support', icon: Headphones },
    ],
  },
];

export default function ProfileSidebar({ activePath }: ProfileSidebarProps) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const { logoutUser } = await import('@/services/apiClient');
      await logoutUser();
    } catch { /* ignore */ }
    navigate('/login');
  };

  // Mock user info — will be replaced with real data
  const user = (() => {
    try {
      const raw = localStorage.getItem('pochak_user');
      if (raw) return JSON.parse(raw);
    } catch { /* ignore */ }
    return { nickname: '포착유저', email: 'user@pochak.tv' };
  })();

  const initial = (user.nickname ?? 'P').charAt(0).toUpperCase();

  return (
    <aside className="w-[220px] min-w-[220px] flex-shrink-0 flex flex-col bg-[#1A1A1A] rounded-xl border border-[#4D4D4D] overflow-hidden">
      {/* ── Profile section ── */}
      <div className="px-4 pt-5 pb-4 flex flex-col items-center border-b border-[#4D4D4D]">
        <div className="w-14 h-14 rounded-full bg-[#00CC33] flex items-center justify-center text-lg font-bold text-[#1A1A1A]">
          {initial}
        </div>
        <p className="mt-2 text-[15px] font-semibold text-white">{user.nickname ?? '포착유저'}</p>
        <p className="text-[12px] text-[#A6A6A6] mt-0.5">{user.email ?? 'user@pochak.tv'}</p>

        {/* 3 action icons */}
        <div className="flex items-center gap-4 mt-3">
          <button className="text-[#A6A6A6] hover:text-white transition-colors" title="프로필 수정" onClick={() => navigate('/account')}>
            <Pencil className="h-4 w-4" />
          </button>
          <button className="text-[#A6A6A6] hover:text-white transition-colors" title="알림" onClick={() => navigate('/notifications')}>
            <Bell className="h-4 w-4" />
          </button>
          <button className="text-[#A6A6A6] hover:text-white transition-colors" title="설정" onClick={() => navigate('/settings')}>
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ── Subscription info ── */}
      <div className="px-3 py-3 border-b border-[#4D4D4D]">
        {subscriptionInfo.map((item) => (
          <Link
            key={item.label}
            to={item.linkTo}
            className="flex items-center justify-between px-2 py-2 rounded-lg hover:bg-[#262626] transition-colors group"
          >
            <div className="min-w-0">
              <p className="text-[12px] text-[#A6A6A6] group-hover:text-white flex items-center gap-1">
                {item.label}
                <ChevronRight className="h-3 w-3" />
              </p>
              <p className="text-[13px] text-white font-medium truncate">{item.value}</p>
              {item.sub && <p className="text-[11px] text-[#A6A6A6]">{item.sub}</p>}
            </div>
          </Link>
        ))}
      </div>

      {/* ── Navigation menu ── */}
      <div className="flex-1 overflow-y-auto scrollbar-hide px-2 py-2">
        {menuSections.map((section, sIdx) => (
          <div key={sIdx}>
            {sIdx > 0 && <div className="mx-2 border-t border-[#4D4D4D] my-1" />}
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = activePath === item.path || (activePath ?? '').startsWith(item.path + '/');
              return (
                <Link
                  key={item.label}
                  to={item.path}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-colors ${
                    isActive
                      ? 'text-[#00CC33] font-semibold bg-[#262626]'
                      : 'text-[#A6A6A6] hover:text-white hover:bg-[#262626]'
                  }`}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* ── Logout ── */}
      <div className="px-3 py-3 border-t border-[#4D4D4D]">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-[13px] text-[#A6A6A6] hover:text-white hover:bg-[#262626] transition-colors"
        >
          <LogOut className="h-4 w-4" />
          로그아웃
        </button>
      </div>
    </aside>
  );
}
