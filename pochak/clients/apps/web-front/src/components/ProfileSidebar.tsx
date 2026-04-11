import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LuPencil, LuBell, LuSettings, LuChevronRight,
  LuShoppingCart, LuHistory, LuFilm, LuCalendarCheck, LuStar,
  LuUsers, LuHeart, LuMessageSquare,
  LuTrophy, LuBuilding2, LuMapPin, LuMegaphone, LuHeadphones, LuLogOut,
} from 'react-icons/lu';
import { Button } from '@/components/ui/button';

const menuSections = [
  {
    items: [
      { label: '구독/이용권 구매', path: '/subscription', icon: LuShoppingCart },
      { label: '시청내역', path: '/my', icon: LuHistory },
      { label: '내 클립', path: '/my', icon: LuFilm },
      { label: '시청예약', path: '/my', icon: LuCalendarCheck },
      { label: '즐겨찾기', path: '/my', icon: LuStar },
    ],
  },
  {
    items: [
      { label: '가입한 클럽', path: '/club', icon: LuUsers },
      { label: '관심클럽', path: '/club', icon: LuHeart },
      { label: '커뮤니티', path: '#', icon: LuMessageSquare },
    ],
  },
  {
    items: [
      { label: '대회소식', path: '/schedule', icon: LuTrophy },
      { label: '시설예약', path: '/city', icon: LuBuilding2 },
      { label: '자주가는 시설', path: '/city', icon: LuMapPin },
    ],
  },
  {
    items: [
      { label: '알림내역', path: '/notifications', icon: LuBell },
      { label: '설정', path: '/settings', icon: LuSettings },
      { label: '공지사항', path: '/notices', icon: LuMegaphone },
      { label: '고객센터', path: '/support', icon: LuHeadphones },
    ],
  },
];

const subscriptionInfo = [
  { label: '구독 관리', value: '대가족 무제한 시청권', sub: '다음결제일: 2026.01.01' },
  { label: '볼/기프트볼 관리', value: '10,000P / 1,000P' },
  { label: '이용권 관리', value: '10개' },
  { label: '선물함', value: '10개' },
];

export default function ProfileSidebar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <aside className="w-[200px] min-w-[200px] flex-shrink-0 flex-col hidden lg:flex">
      {/* Profile section */}
      <div className="flex flex-col items-center pb-4 border-b border-white/[0.06]">
        <div className="size-16 rounded-full bg-white/[0.06] flex items-center justify-center border border-white/[0.08] transition-transform duration-200 hover:scale-105">
          <img src="/pochak-icon.svg" alt="프로필" className="w-7 h-7" />
        </div>
        <p className="mt-2.5 text-[15px] font-semibold text-pochak-text">pochak2026</p>
        <p className="text-[14px] text-pochak-text-secondary mt-0.5">email@address.com</p>
        <div className="flex items-center gap-2 mt-3 w-full">
          <Button variant="primary" size="sm" className="flex-1 h-8" onClick={() => navigate('/settings')}>
            <LuPencil className="w-3 h-3" />
          </Button>
          <Button variant="secondary" size="sm" className="flex-1 h-8" onClick={() => navigate('/notifications')}>
            <LuBell className="w-3 h-3" />
          </Button>
          <Button variant="secondary" size="sm" className="flex-1 h-8" onClick={() => navigate('/settings')}>
            <LuSettings className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Subscription info */}
      <div className="py-3 border-b border-white/[0.06] flex flex-col gap-2">
        {subscriptionInfo.map((item) => (
          <div key={item.label} className="cursor-pointer hover:text-pochak-text transition-colors group">
            <p className="text-[13px] text-pochak-text-secondary flex items-center gap-0.5">
              {item.label} <LuChevronRight className="w-2.5 h-2.5 group-hover:translate-x-0.5 transition-transform duration-200" />
            </p>
            <p className="text-[14px] text-pochak-text font-semibold">{item.value}</p>
            {item.sub && <p className="text-[12px] text-pochak-text-tertiary">{item.sub}</p>}
          </div>
        ))}
      </div>

      {/* Navigation menu */}
      <nav className="flex-1 overflow-y-auto scrollbar-hide py-2">
        {menuSections.map((section, sIdx) => (
          <div key={sIdx}>
            {sIdx > 0 && <div className="border-t border-white/[0.06] my-1" />}
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.label}
                  to={item.path}
                  className={`flex items-center gap-2.5 px-2 h-9 rounded-xl text-[14px] transition-all duration-200 active:scale-[0.97] active:transition-none ${
                    isActive
                      ? 'text-primary bg-primary/10 font-medium'
                      : 'text-pochak-text-secondary hover:text-pochak-text hover:bg-white/[0.05]'
                  }`}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <span className="flex-1 truncate">{item.label}</span>
                  <LuChevronRight className="w-3 h-3 text-pochak-text-muted flex-shrink-0" />
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Logout */}
      <div className="pt-3 border-t border-white/[0.06]">
        <Button variant="secondary" size="sm" className="w-full justify-center gap-2">
          <LuLogOut className="h-3.5 w-3.5" /> 로그아웃
        </Button>
      </div>
    </aside>
  );
}
