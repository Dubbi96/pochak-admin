import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { useSearchSuggestions } from '@/hooks/useApi';
import {
  LuMenu,
  LuSearch,
  LuVideo,
  LuBell,
  LuLayoutGrid,
  LuSettings,
  LuLogOut,
  LuPencil,
  LuChevronRight,
  LuShoppingCart,
  LuHistory,
  LuFilm,
  LuCalendarCheck,
  LuStar,
  LuUsers,
  LuHeart,
  LuMessageSquare,
  LuTrophy,
  LuBuilding2,
  LuMapPin,
  LuMegaphone,
  LuHeadphones,
  LuPlay,
} from 'react-icons/lu';
import { useSidebar } from '@/contexts/SidebarContext';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const profileMenuSections = [
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
      { label: '내 촬영', path: '/my/recordings', icon: LuVideo },
      { label: '내 예약', path: '/my/reservations', icon: LuCalendarCheck },
      { label: '시설예약', path: '/city', icon: LuBuilding2 },
      { label: '자주가는 시설', path: '/city', icon: LuMapPin },
    ],
  },
  {
    items: [
      { label: '설정', path: '/settings', icon: LuSettings },
      { label: '공지사항', path: '/notices', icon: LuMegaphone },
      { label: '고객센터', path: '/support', icon: LuHeadphones },
    ],
  },
];

const serviceTabs = [
  { label: '포착TV', path: '/home' },
  { label: '포착시티', path: '/city' },
  { label: '포착클럽', path: '/club' },
];

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toggle } = useSidebar();
  const [isLoggedIn] = useState(true);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const activeTabValue = (() => {
    if (location.pathname === '/' || location.pathname.startsWith('/home')) return '/home';
    if (location.pathname.startsWith('/city')) return '/city';
    if (location.pathname.startsWith('/club')) return '/club';
    return '/home';
  })();

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 h-14 transition-colors duration-300 ${
        scrolled ? 'bg-[#0f0f0f] border-b border-white/[0.06]' : 'bg-[#0f0f0f]/95'
      }`}
      role="banner"
    >
      <div className="flex h-full items-center justify-between px-6 gap-6">
        {/* Left: hamburger + logo + service tabs */}
        <div className="flex items-center gap-4 flex-shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggle}
            aria-label="메뉴 토글"
            className="h-9 w-9 text-muted-foreground"
          >
            <LuMenu className="h-5 w-5" />
          </Button>

          <Link to="/" className="flex items-center" aria-label="POCHAK 홈">
            <img src="/pochak-logo.png" alt="POCHAK" className="h-auto w-auto max-h-12 object-contain" />
          </Link>

          {/* Service tabs with underline style */}
          <div className="flex items-center ml-3">
            {serviceTabs.map((tab) => (
              <button
                key={tab.label}
                onClick={() => navigate(tab.path)}
                style={{ paddingLeft: 12, paddingRight: 12, marginLeft: 4, marginRight: 4 }}
                className={`pt-2 pb-3 text-[14px] font-bold tracking-[-0.02em] transition-colors duration-200 whitespace-nowrap ${
                  activeTabValue === tab.path
                    ? 'text-foreground'
                    : 'text-pochak-text-tertiary/60 hover:text-pochak-text-secondary'
                }`}

              >
                <span className="relative inline-block">
                  {tab.label}
                  <span
                    className={`absolute left-0 right-0 -bottom-[8px] h-[2.5px] rounded-full bg-primary transition-transform duration-250 origin-center ${
                      activeTabValue === tab.path ? 'scale-x-100' : 'scale-x-0'
                    }`}
                  />
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Center: search bar */}
        <GnbSearchBar />

        {/* Right: actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <Link to="/search" className="md:hidden">
            <Button variant="icon" size="icon-sm" aria-label="검색">
              <LuSearch className="size-4" />
            </Button>
          </Link>

          {isLoggedIn ? (
            <>
              <Button variant="icon" size="icon-sm" aria-label="촬영">
                <LuVideo className="size-4" />
              </Button>
              <Button variant="icon" size="icon-sm" aria-label="이벤트">
                <LuLayoutGrid className="size-4" />
              </Button>

              {/* Notifications dropdown */}
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <Button variant="icon" size="icon-sm" className="relative" aria-label="알림">
                    <LuBell className="size-4" />
                    <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-primary ring-2 ring-background animate-[pulse-live_2s_ease-in-out_infinite]" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  sideOffset={12}
                  className="w-[360px] max-h-[440px] overflow-y-auto bg-pochak-surface/95 backdrop-blur-xl border border-white/[0.1] rounded-2xl p-0 scrollbar-hide z-[60] shadow-2xl"
                >
                  <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.06]">
                    <p className="text-[15px] font-bold text-foreground">새 알림</p>
                    <Link to="/notifications" className="text-[13px] text-primary hover:underline">전체보기</Link>
                  </div>
                  <div className="flex flex-col">
                    {[
                      { title: '수원 FC vs 강남 유나이티드 라이브 시작', desc: '6회 MLB컵 준결승전이 곧 시작됩니다.', time: '5분 전', icon: LuVideo },
                      { title: '2025 화랑대기 유소년축구대회 일정 업데이트', desc: '새로운 경기 일정이 등록되었습니다.', time: '30분 전', icon: LuTrophy },
                      { title: '동대문구 리틀야구 vs 군포시 리틀야구 30분 후 시작', desc: '시청 예약하신 경기가 곧 시작됩니다.', time: '1시간 전', icon: LuVideo },
                    ].map((n, i) => (
                      <Link key={i} to="/notifications" className="flex items-start gap-4 px-5 py-3.5 hover:bg-white/[0.04] transition-colors border-b border-white/[0.06] last:border-b-0">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <n.icon className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[14px] text-foreground font-medium line-clamp-1">{n.title}</p>
                          <p className="text-[13px] text-pochak-text-secondary line-clamp-1 mt-0.5">{n.desc}</p>
                          <p className="text-[12px] text-pochak-text-tertiary mt-1">{n.time}</p>
                        </div>
                        <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                      </Link>
                    ))}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Profile dropdown */}
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <button className="ml-2 h-9 w-9 rounded-full overflow-hidden ring-2 ring-transparent hover:ring-purple-500/40 transition-all duration-200 focus:outline-none flex-shrink-0 bg-purple-500 flex items-center justify-center" aria-label="내 프로필">
                    <img src="/pochak-icon.svg" alt="프로필" className="w-5 h-5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  sideOffset={12}
                  className="w-[300px] max-h-[calc(100vh-4rem)] overflow-y-auto bg-pochak-surface/95 backdrop-blur-xl border border-white/[0.1] rounded-2xl p-0 scrollbar-hide z-[60] shadow-2xl"
                >
                  {/* Profile row */}
                  <div className="px-5 pt-5 pb-4 flex items-center gap-3 border-b border-white/[0.06]">
                    <div className="size-10 rounded-full bg-card flex items-center justify-center flex-shrink-0 border border-white/[0.06]">
                      <img src="/pochak-icon.svg" alt="프로필" className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[15px] font-semibold text-foreground truncate">pochak2026</p>
                      <p className="text-[13px] text-muted-foreground truncate">email@address.com</p>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button onClick={() => navigate('/settings')} className="h-7 w-7 rounded-md bg-white/[0.06] hover:bg-white/[0.12] flex items-center justify-center transition-colors"><LuPencil className="w-3 h-3 text-muted-foreground" /></button>
                      <button onClick={() => navigate('/notifications')} className="h-7 w-7 rounded-md bg-white/[0.06] hover:bg-white/[0.12] flex items-center justify-center transition-colors"><LuBell className="w-3 h-3 text-muted-foreground" /></button>
                    </div>
                  </div>

                  {/* Subscription info */}
                  <div className="px-5 py-4 border-b border-white/[0.06] flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[14px] text-muted-foreground">구독 관리</span>
                        <LuChevronRight className="w-2.5 h-2.5 text-pochak-text-muted" />
                      </div>
                      <span className="text-[13px] text-pochak-text-muted">다음결제일: 2026.01.01</span>
                    </div>
                    <p className="text-[15px] text-primary font-bold">대가족 무제한 시청권</p>
                    <div className="flex items-center gap-2 text-[13px] pt-1 whitespace-nowrap overflow-hidden">
                      <span className="text-foreground font-semibold">10,000P / 1,000P</span>
                      <span className="text-pochak-text-muted">|</span>
                      <span className="text-foreground">이용권 <span className="text-primary font-bold">10개</span></span>
                      <span className="text-pochak-text-muted">|</span>
                      <span className="text-foreground">선물함 <span className="text-primary font-bold">10개</span></span>
                    </div>
                  </div>

                  {/* Navigation sections */}
                  <div className="py-1">
                    {profileMenuSections.map((section, sIdx) => (
                      <div key={sIdx}>
                        {sIdx > 0 && <div className="mx-4 border-t border-white/[0.06] my-2" />}
                        {section.items.map((item) => {
                          const Icon = item.icon;
                          return (
                            <Link
                              key={item.label}
                              to={item.path}
                              className="flex items-center gap-4 px-5 py-3 text-[14px] text-muted-foreground hover:text-foreground hover:bg-white/[0.04] transition-colors"
                            >
                              <Icon className="h-4 w-4 flex-shrink-0 text-pochak-text-tertiary" />
                              <span className="flex-1">{item.label}</span>
                              <LuChevronRight className="w-3.5 h-3.5 text-pochak-text-muted" />
                            </Link>
                          );
                        })}
                      </div>
                    ))}
                  </div>

                  {/* Logout */}
                  <div className="px-5 py-4 border-t border-white/[0.06]">
                    <button
                      className="flex items-center justify-center gap-2 w-full h-9 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-[14px] text-muted-foreground hover:text-foreground transition-colors"
                      onClick={() => {/* handle logout */}}
                    >
                      <LuLogOut className="h-3.5 w-3.5" /> 로그아웃
                    </button>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button variant="outline" size="sm" asChild>
              <Link to="/login">로그인</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

/* ── GNB Search Bar with live dropdown ───────────────── */
function GnbSearchBar() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const debouncedQuery = useDebounce(query, 200);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const hasQuery = debouncedQuery.trim().length > 0;
  const { data: suggestions } = useSearchSuggestions(debouncedQuery);
  const matchedContents = suggestions.contents.slice(0, 4);
  const matchedTeams = suggestions.teams.slice(0, 3);
  const matchedComps = suggestions.competitions.slice(0, 2);

  const hasResults = matchedContents.length > 0 || matchedTeams.length > 0 || matchedComps.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setOpen(false);
      setQuery('');
    }
  };

  return (
    <div ref={containerRef} className="flex-1 max-w-[560px] mx-auto hidden md:block relative">
      <form onSubmit={handleSubmit} className="relative">
        <LuSearch className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none z-10" />
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => { if (query.trim()) setOpen(true); }}
          placeholder="검색어를 입력하세요"
          style={{ paddingLeft: 40 }}
          className="w-full h-10 rounded-full bg-[#343536] border border-white/[0.1] pr-4 text-[15px] text-foreground placeholder:text-pochak-text-muted outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 focus:bg-white/[0.08] transition-all duration-200 hover:bg-white/[0.08]"
        />
      </form>

      {/* Dropdown suggestions */}
      {open && hasQuery && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-bg-surface-2 border border-white/[0.06] rounded-xl overflow-hidden z-[60] shadow-lg">
          {!hasResults ? (
            <div className="px-4 py-8 text-center">
              <LuSearch className="w-6 h-6 text-pochak-text-muted mx-auto mb-2" />
              <p className="text-[14px] text-muted-foreground">'{debouncedQuery}'에 대한 결과가 없습니다</p>
              <button onClick={handleSubmit} className="text-[14px] text-primary mt-2 hover:underline">통합 검색으로 이동</button>
            </div>
          ) : (
            <div className="max-h-[480px] overflow-y-auto scrollbar-hide">
              {/* Teams */}
              {matchedTeams.length > 0 && (
                <div className="p-4">
                  <p className="text-[12px] text-pochak-text-tertiary uppercase tracking-wider px-2 mb-2 font-semibold">팀/클럽</p>
                  <div className="flex flex-col gap-1">
                    {matchedTeams.map(ch => (
                      <Link
                        key={ch.id}
                        to={`/team/${ch.id}`}
                        onClick={() => { setOpen(false); setQuery(''); }}
                        className="flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-white/[0.06] transition-colors"
                      >
                        {ch.imageUrl ? (
                          <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 border border-white/[0.06]">
                            <img src={ch.imageUrl} alt="" className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center text-[14px] font-bold text-white flex-shrink-0 border border-white/[0.06]" style={{ backgroundColor: ch.color }}>
                            {ch.initial}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-[14px] text-foreground font-medium truncate">{ch.name}</p>
                          <p className="text-[13px] text-pochak-text-tertiary">{ch.subtitle}</p>
                        </div>
                        <LuChevronRight className="w-3.5 h-3.5 text-pochak-text-muted flex-shrink-0" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Competitions */}
              {matchedComps.length > 0 && (
                <div className="p-4 border-t border-white/[0.06]">
                  <p className="text-[12px] text-pochak-text-tertiary uppercase tracking-wider px-2 mb-2 font-semibold">대회</p>
                  <div className="flex flex-col gap-1">
                    {matchedComps.map(c => (
                      <Link
                        key={c.id}
                        to={`/competition/${c.id}`}
                        onClick={() => { setOpen(false); setQuery(''); }}
                        className="flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-white/[0.06] transition-colors"
                      >
                        {c.imageUrl ? (
                          <div className="w-14 h-8 rounded-md overflow-hidden flex-shrink-0 border border-white/[0.06]">
                            <img src={c.imageUrl} alt="" className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-14 h-8 rounded-md flex items-center justify-center flex-shrink-0 border border-white/[0.06]" style={{ background: `linear-gradient(135deg, ${c.logoColor}60, ${c.logoColor}20)` }}>
                            <LuTrophy className="w-3.5 h-3.5 text-white/50" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-[14px] text-foreground font-medium truncate">{c.name}</p>
                          <p className="text-[13px] text-pochak-text-tertiary">{c.dateRange}</p>
                        </div>
                        <LuChevronRight className="w-3.5 h-3.5 text-pochak-text-muted flex-shrink-0" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Contents */}
              {matchedContents.length > 0 && (
                <div className="p-4 border-t border-white/[0.06]">
                  <p className="text-[12px] text-pochak-text-tertiary uppercase tracking-wider px-2 mb-2 font-semibold">영상/클립</p>
                  <div className="flex flex-col gap-1">
                    {matchedContents.map(c => (
                      <Link
                        key={c.id}
                        to={c.type === 'CLIP' ? `/clip/${c.id}` : `/contents/vod/${c.id}`}
                        onClick={() => { setOpen(false); setQuery(''); }}
                        className="flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-white/[0.06] transition-colors"
                      >
                        <div className="w-14 h-8 rounded-md overflow-hidden flex-shrink-0 bg-bg-surface-1 border border-white/[0.06]">
                          {c.thumbnailUrl ? (
                            <img src={c.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center"><LuPlay className="w-3 h-3 text-pochak-text-muted" /></div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[14px] text-foreground font-medium truncate">{c.title}</p>
                          <p className="text-[13px] text-pochak-text-tertiary">{c.competition} | {c.type}</p>
                        </div>
                        <span className={`text-[11px] px-1.5 py-0.5 rounded font-medium flex-shrink-0 ${
                          c.type === 'LIVE' ? 'bg-red-500/20 text-red-400' : c.type === 'CLIP' ? 'bg-primary/20 text-primary' : 'bg-white/[0.06] text-muted-foreground'
                        }`}>{c.type}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="px-5 py-4 border-t border-white/[0.06] bg-white/[0.02]">
                <button
                  onClick={handleSubmit}
                  className="flex items-center justify-center gap-2 w-full py-2 rounded-lg text-[14px] text-primary font-medium hover:bg-primary/10 transition-colors"
                >
                  <LuSearch className="w-4 h-4" />
                  '{debouncedQuery}' 통합 검색 결과 보기
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
