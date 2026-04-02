import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useCallback, useRef } from "react";
import { useToast } from "@/hooks/useToast";

/* ── Notification badge helpers ────────────────────────────────────────────── */
const NOTIF_READ_KEY = 'pochak_notifications_read';
/** Total mock notification count (must match initialNotifications in NotificationPage) */
const TOTAL_NOTIFICATION_COUNT = 18;
/** IDs of notifications that are read by default in mock data */
const DEFAULT_READ_IDS = new Set(['5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18']);

function getUnreadNotificationCount(): number {
  try {
    const stored = JSON.parse(localStorage.getItem(NOTIF_READ_KEY) || '[]') as string[];
    const readIds = new Set(stored);
    // Merge default read + user-read
    const allRead = new Set([...DEFAULT_READ_IDS, ...readIds]);
    return TOTAL_NOTIFICATION_COUNT - allRead.size;
  } catch {
    return TOTAL_NOTIFICATION_COUNT - DEFAULT_READ_IDS.size;
  }
}
import {
  Menu,
  X,
  Search,
  Tv,
  Video,
  ChevronDown,
  ChevronRight,
  Bell,
  Settings,
  Pencil,
  Monitor,
  Clock,
  Clapperboard,
  Calendar,
  Bookmark,
  CheckSquare,
  FileText,
  Users,
  MessageCircle,
  Building,
  MapPin,
  Megaphone,
  Headphones,
  LogOut,
  Shield,
} from "lucide-react";

function useAuth() {
  const hasToken = () =>
    typeof window !== 'undefined' && !!localStorage.getItem('pochak_token');

  const [loggedIn, setLoggedIn] = useState(hasToken);

  useEffect(() => {
    const handler = () => setLoggedIn(hasToken());
    window.addEventListener('storage', handler);
    window.addEventListener('pochak_auth_change', handler);
    return () => {
      window.removeEventListener('storage', handler);
      window.removeEventListener('pochak_auth_change', handler);
    };
  }, []);

  const getUserInitial = (): string => {
    try {
      const raw = localStorage.getItem('pochak_user');
      if (raw) {
        const user = JSON.parse(raw);
        const name = user.nickname || user.name || user.email?.charAt(0) || 'P';
        return name.charAt(0).toUpperCase();
      }
    } catch { /* ignore */ }
    return 'P';
  };

  const getNickname = (): string => {
    try {
      const raw = localStorage.getItem('pochak_user');
      if (raw) {
        const user = JSON.parse(raw);
        return user.nickname || user.name || 'pochak2026';
      }
    } catch { /* ignore */ }
    return 'pochak2026';
  };

  const logout = useCallback(async () => {
    const { logoutUser } = await import('@/services/apiClient');
    await logoutUser();
    setLoggedIn(false);
  }, []);

  const getUserRole = (): string => {
    try {
      const raw = localStorage.getItem('pochak_user');
      if (raw) {
        const user = JSON.parse(raw);
        return user.role ?? 'USER';
      }
    } catch { /* ignore */ }
    return 'USER';
  };

  return { loggedIn, logout, getUserInitial, getNickname, getUserRole };
}

const serviceTabs = [
  { label: "TV", path: "/home", enabled: true },
  { label: "시티", path: "/city", enabled: true },
  { label: "클럽", path: "/club", enabled: false },
  { label: "커뮤니티", path: "/community", enabled: true },
];

type PanelMenuItem = { label: string; icon: typeof Monitor; path: string };
type PanelDivider = { divider: true };
type PanelItem = PanelMenuItem | PanelDivider;

const panelMenuItems: PanelItem[] = [
  { label: "구독/이용권 구매", icon: Monitor, path: "/store" },
  { label: "시청내역", icon: Clock, path: "/my/history" },
  { label: "내 클립", icon: Clapperboard, path: "/my/clips" },
  { label: "시청예약", icon: Calendar, path: "/my/reservations" },
  { label: "즐겨찾기", icon: Bookmark, path: "/my/favorites" },
  { divider: true },
  { label: "가입한 클럽", icon: CheckSquare, path: "/my/clubs" },
  { label: "관심클럽", icon: FileText, path: "/my/interest-clubs" },
  { label: "커뮤니티", icon: Users, path: "/my/community" },
  { divider: true },
  { label: "대회소식", icon: MessageCircle, path: "/my/competitions" },
  { label: "시설예약", icon: Building, path: "/my/facility" },
  { label: "자주가는 시설", icon: MapPin, path: "/my/favorite-facility" },
  { divider: true },
  { label: "알림내역", icon: Bell, path: "/notifications" },
  { label: "설정", icon: Settings, path: "/settings" },
  { label: "공지사항", icon: Megaphone, path: "/notices" },
  { label: "고객센터", icon: Headphones, path: "/support" },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userPanelOpen, setUserPanelOpen] = useState(false);
  const { loggedIn, logout, getUserInitial, getNickname, getUserRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const userPanelRef = useRef<HTMLDivElement>(null);
  const [unreadCount, setUnreadCount] = useState(getUnreadNotificationCount);

  useEffect(() => {
    const updateCount = () => setUnreadCount(getUnreadNotificationCount());
    window.addEventListener('storage', updateCount);
    window.addEventListener('pochak_notification_change', updateCount);
    return () => {
      window.removeEventListener('storage', updateCount);
      window.removeEventListener('pochak_notification_change', updateCount);
    };
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userPanelRef.current && !userPanelRef.current.contains(e.target as Node)) {
        setUserPanelOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const isActiveTab = (path: string) => {
    if (path === '/home') {
      return location.pathname === '/' || location.pathname === '/home' ||
        location.pathname.startsWith('/contents/') || location.pathname.startsWith('/competition/') ||
        location.pathname.startsWith('/tv/');
    }
    if (path === '/city') {
      return location.pathname === '/city';
    }
    if (path === '/community') {
      return location.pathname === '/community';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-[70px] bg-[#1A1A1A] border-b border-[#4D4D4D]">
      <div className="flex h-full items-center justify-between px-4 lg:px-6">
        {/* Left: hamburger + logo + service dropdown */}
        <div className="flex items-center gap-4">
          <button
            className="lg:hidden text-white"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="메뉴"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <button className="hidden lg:block text-[#A6A6A6] hover:text-white" aria-label="메뉴">
            <Menu className="h-5 w-5" />
          </button>

          {/* Logo */}
          <Link to="/home" className="flex items-center">
            <img src="/pochak-logo.svg" alt="POCHAK" className="h-10 w-auto" />
          </Link>

          {/* Service Tabs (TV / 시티 / 클럽) */}
          <nav className="hidden lg:flex items-center gap-1 ml-2">
            {serviceTabs.map((tab) => (
              <Link
                key={tab.label}
                to={tab.enabled ? tab.path : '#'}
                onClick={(e) => {
                  if (!tab.enabled) {
                    e.preventDefault();
                    toast.show(`포착 ${tab.label} 서비스는 준비 중입니다.`);
                  }
                }}
                className={`px-3 py-1.5 text-[15px] font-semibold rounded transition-colors ${
                  isActiveTab(tab.path)
                    ? "text-[#00CC33]"
                    : tab.enabled
                      ? "text-[#A6A6A6] hover:text-white"
                      : "text-[#606060] cursor-default"
                }`}
              >
                {tab.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Center: search bar */}
        <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[520px] px-4">
          <Link to="/search" className="flex w-full items-center rounded-full bg-[#262626] px-4 py-2">
            <Search className="h-4 w-4 text-[#A6A6A6] mr-2 flex-shrink-0" />
            <span className="text-[15px] text-[#A6A6A6]">검색</span>
          </Link>
        </div>

        {/* Right: icons + avatar */}
        <div className="flex items-center gap-3">
          <Link to="/search" className="md:hidden text-[#A6A6A6] hover:text-white">
            <Search className="h-5 w-5" />
          </Link>

          <button className="hidden md:block text-[#A6A6A6] hover:text-white" aria-label="TV" onClick={() => navigate('/home')}>
            <Tv className="h-5 w-5" />
          </button>
          <button className="hidden md:block text-[#A6A6A6] hover:text-white" aria-label="촬영" onClick={() => navigate('/contents')}>
            <Video className="h-5 w-5" />
          </button>

          {/* Notification bell */}
          <Link to="/notifications" className="hidden md:block relative text-[#A6A6A6] hover:text-white" aria-label="알림">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 flex items-center justify-center rounded-full bg-[#00CC33] text-[10px] font-bold text-white leading-none">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </Link>

          {loggedIn ? (
            <div className="relative" ref={userPanelRef}>
              <button
                onClick={() => setUserPanelOpen(!userPanelOpen)}
                className="flex items-center gap-1"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#00CC33] text-[13px] font-bold text-[#1A1A1A]">
                  {getUserInitial()}
                </div>
                <ChevronDown className="h-3 w-3 text-[#A6A6A6]" />
              </button>

              {/* Large right-side panel */}
              {userPanelOpen && (
                <div className="absolute right-0 top-full mt-2 w-[260px] bg-[#262626] border border-[#4D4D4D] rounded-lg shadow-xl overflow-hidden z-50 max-h-[calc(100vh-90px)] overflow-y-auto scrollbar-hide">
                  {/* Profile section */}
                  <div className="px-4 pt-4 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#00CC33] text-[15px] font-bold text-[#1A1A1A] flex-shrink-0">
                        {getUserInitial()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-[15px] text-white font-semibold truncate">{getNickname()}</p>
                          <button className="text-[#A6A6A6] hover:text-white flex-shrink-0" aria-label="프로필 수정" onClick={() => { setUserPanelOpen(false); navigate('/account'); }}>
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Link to="/notifications" onClick={() => setUserPanelOpen(false)} className="relative text-[#A6A6A6] hover:text-white" aria-label="알림">
                          <Bell className="h-4.5 w-4.5" />
                          {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 min-w-[14px] h-3.5 px-0.5 flex items-center justify-center rounded-full bg-[#00CC33] text-[9px] font-bold text-white leading-none">
                              {unreadCount > 99 ? '99+' : unreadCount}
                            </span>
                          )}
                        </Link>
                        <Link to="/settings" onClick={() => setUserPanelOpen(false)} className="text-[#A6A6A6] hover:text-white" aria-label="설정">
                          <Settings className="h-4.5 w-4.5" />
                        </Link>
                      </div>
                    </div>
                  </div>

                  <div className="mx-3 border-t border-[#4D4D4D]" />

                  {/* Subscription info */}
                  <div className="px-4 py-3">
                    <Link
                      to="/store"
                      onClick={() => setUserPanelOpen(false)}
                      className="flex items-center justify-between text-[13px] text-[#A6A6A6] hover:text-white transition-colors"
                    >
                      <span className="font-semibold">구독 관리</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                    <p className="text-[12px] text-white mt-1">대가족 무제한 시청권</p>
                    <p className="text-[11px] text-[#A6A6A6] mt-0.5">다음결제일: 2026.01.01</p>
                  </div>

                  <div className="mx-3 border-t border-[#4D4D4D]" />

                  {/* Stats row */}
                  <div className="px-4 py-3 space-y-2">
                    <Link
                      to="/my/points"
                      onClick={() => setUserPanelOpen(false)}
                      className="flex items-center justify-between text-[12px] hover:text-white transition-colors"
                    >
                      <span className="text-[#A6A6A6]">볼/기프트볼 관리</span>
                      <span className="text-white font-medium">10,000P / 1,000P</span>
                    </Link>
                    <Link
                      to="/my/tickets"
                      onClick={() => setUserPanelOpen(false)}
                      className="flex items-center justify-between text-[12px] hover:text-white transition-colors"
                    >
                      <span className="text-[#A6A6A6]">이용권 관리</span>
                      <span className="text-white font-medium">10개</span>
                    </Link>
                    <Link
                      to="/my/gifts"
                      onClick={() => setUserPanelOpen(false)}
                      className="flex items-center justify-between text-[12px] hover:text-white transition-colors"
                    >
                      <span className="text-[#A6A6A6]">선물함</span>
                      <span className="text-white font-medium">10개</span>
                    </Link>
                  </div>

                  <div className="mx-3 border-t border-[#4D4D4D]" />

                  {/* Navigation menu list */}
                  <div className="py-1">
                    {panelMenuItems.map((item, idx) => {
                      if ('divider' in item) {
                        return <div key={`divider-${idx}`} className="mx-3 border-t border-[#4D4D4D] my-1" />;
                      }
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.label}
                          to={item.path}
                          onClick={() => setUserPanelOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-[13px] text-[#A6A6A6] hover:text-white hover:bg-[#333333] transition-colors"
                        >
                          <Icon className="h-4 w-4 flex-shrink-0" />
                          <span className="flex-1">{item.label}</span>
                          <ChevronRight className="h-3.5 w-3.5 flex-shrink-0" />
                        </Link>
                      );
                    })}
                  </div>

                  {(getUserRole() === 'MANAGER' || getUserRole() === 'ADMIN') && (
                    <>
                      <div className="mx-3 border-t border-[#4D4D4D]" />
                      <div className="py-1">
                        <Link
                          to="/manage"
                          onClick={() => setUserPanelOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-[13px] text-[#A6A6A6] hover:text-white hover:bg-[#333333] transition-colors"
                        >
                          <Shield className="h-4 w-4 flex-shrink-0" />
                          <span className="flex-1">관리</span>
                          <ChevronRight className="h-3.5 w-3.5 flex-shrink-0" />
                        </Link>
                      </div>
                    </>
                  )}

                  <div className="mx-3 border-t border-[#4D4D4D]" />

                  {/* Logout button */}
                  <div className="px-4 py-3">
                    <button
                      onClick={() => {
                        logout();
                        setUserPanelOpen(false);
                        navigate('/login');
                      }}
                      className="flex items-center gap-3 w-full text-[13px] text-[#A6A6A6] hover:text-white transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>로그아웃</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="px-4 py-1.5 text-[13px] text-[#A6A6A6] border border-[#4D4D4D] rounded-full hover:border-white hover:text-white transition-colors font-medium">
              로그인
            </Link>
          )}
        </div>
      </div>

      {/* Mobile nav dropdown */}
      {mobileOpen && (
        <nav className="absolute top-[70px] left-0 right-0 bg-[#1A1A1A] border-b border-[#4D4D4D] px-4 py-4 lg:hidden z-50">
          <div className="mb-3 pb-3 border-b border-[#4D4D4D]">
            {serviceTabs.map((tab) => (
              <Link
                key={tab.label}
                to={tab.enabled ? tab.path : '#'}
                onClick={(e) => {
                  if (!tab.enabled) {
                    e.preventDefault();
                    toast.show(`포착 ${tab.label} 서비스는 준비 중입니다.`);
                    return;
                  }
                  setMobileOpen(false);
                }}
                className={`block w-full text-left py-2 text-[15px] ${
                  isActiveTab(tab.path) ? "text-[#00CC33] font-semibold" : tab.enabled ? "text-[#A6A6A6]" : "text-[#606060]"
                }`}
              >
                {tab.label}{!tab.enabled && <span className="ml-2 text-[11px] text-[#606060]">준비 중</span>}
              </Link>
            ))}
          </div>
          <Link to="/home" className="block py-2 text-[15px] text-[#A6A6A6]" onClick={() => setMobileOpen(false)}>홈</Link>
          <Link to="/schedule" className="block py-2 text-[15px] text-[#A6A6A6]" onClick={() => setMobileOpen(false)}>일정</Link>
          <Link to="/contents" className="block py-2 text-[15px] text-[#A6A6A6]" onClick={() => setMobileOpen(false)}>클립</Link>
          <Link to="/my" className="block py-2 text-[15px] text-[#A6A6A6]" onClick={() => setMobileOpen(false)}>마이</Link>
          <Link to="/search" className="mt-3 flex items-center rounded-full bg-[#262626] px-4 py-2" onClick={() => setMobileOpen(false)}>
            <Search className="h-4 w-4 text-[#A6A6A6] mr-2 flex-shrink-0" />
            <span className="text-[15px] text-[#A6A6A6]">검색</span>
          </Link>
        </nav>
      )}
    </header>
  );
}
