import { Link, useLocation } from 'react-router-dom';
import {
  LuHouse,
  LuCalendar,
  LuScissors,
  LuUser,
  LuBell,
  LuSettings,
  LuMegaphone,
  LuHeadphones,
  LuLogOut,
  LuUsers,
} from 'react-icons/lu';
import { useSidebar } from '@/contexts/SidebarContext';
import { useTeams } from '@/hooks/useApi';
import type { ComponentType } from 'react';

interface NavItem {
  label: string;
  icon: ComponentType<{ className?: string }>;
  path: string;
}

const mainNav: NavItem[] = [
  { label: '홈', icon: LuHouse, path: '/home' },
  { label: '일정', icon: LuCalendar, path: '/schedule' },
  { label: '클립', icon: LuScissors, path: '/contents' },
  { label: '마이', icon: LuUser, path: '/my' },
];

const utilNav: NavItem[] = [
  { label: '알림', icon: LuBell, path: '/notifications' },
  { label: '설정', icon: LuSettings, path: '/settings' },
  { label: '공지사항', icon: LuMegaphone, path: '/notices' },
  { label: '고객센터', icon: LuHeadphones, path: '/support' },
];

export default function Sidebar() {
  const location = useLocation();
  const { expanded } = useSidebar();
  const isLoginRoute = location.pathname === '/login';
  const { data: channels } = useTeams();

  const isActive = (path: string) => {
    if (isLoginRoute) return false;
    if (path === '/home') return location.pathname === '/' || location.pathname === '/home';
    return location.pathname.startsWith(path);
  };

  return (
    <aside
      className="fixed top-14 left-0 bottom-0 z-40 overflow-hidden border-r border-border-subtle bg-[#0c0c0c] transition-all duration-200"
      style={{ width: expanded ? 216 : 64 }}
    >
      <div className="flex flex-col h-full">
        {/* ── Main Navigation ── */}
        <nav className="pt-3 px-2 flex flex-col gap-1 flex-shrink-0" aria-label="메인 네비게이션">
          {mainNav.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <Link
                key={item.label}
                to={item.path}
                title={!expanded ? item.label : undefined}
                className={`
                  relative flex items-center h-10 transition-all duration-200
                  ${expanded ? 'px-3 gap-3 rounded-lg' : 'justify-center rounded-lg'}
                  ${isLoginRoute
                    ? 'text-pochak-text-muted pointer-events-none'
                    : active
                    ? 'border-l-2 border-primary bg-primary/10 text-primary'
                    : 'text-pochak-text-secondary hover:bg-white/[0.05] hover:text-foreground'
                  }
                `}
              >
                <Icon className={`size-[18px] flex-shrink-0 transition-colors duration-200 ${active ? 'text-primary' : ''}`} />
                <span
                  className={`text-[14px] font-semibold tracking-[-0.01em] truncate transition-opacity duration-200 ${
                    expanded ? 'opacity-100 delay-100' : 'opacity-0 w-0 overflow-hidden'
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* ── Divider ── */}
        <div className="mx-3 my-3 h-px bg-border-subtle flex-shrink-0" />

        {/* ── Following / 팔로잉 (expanded) ── */}
        {expanded ? (
          <div className="px-3 flex-1 overflow-y-auto scrollbar-hide min-h-0">
            {/* 가입한 클럽 */}
            <Link to="/teams" className="flex items-center justify-between mb-2 px-1 group">
              <div className="flex items-center gap-2">
                <LuUsers className="size-3.5 text-pochak-text-tertiary" />
                <span className="text-[14px] tracking-[0.04em] text-pochak-text-tertiary font-semibold">가입한 클럽 &gt;</span>
              </div>
            </Link>
            <div className="flex flex-col gap-1">
              {channels.slice(0, 4).map((ch) => (
                <Link
                  key={ch.id}
                  to={`/team/${ch.id}`}
                  className="flex items-center gap-2.5 h-9 px-2 hover:bg-white/[0.05] rounded-lg transition-all duration-200 group"
                >
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[11px] font-bold text-white border border-border-subtle"
                    style={{ backgroundColor: ch.color }}
                  >
                    {ch.initial}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] text-foreground/80 font-medium truncate group-hover:text-foreground transition-colors">
                      {ch.name}
                    </p>
                    <p className="text-[13px] text-pochak-text-muted truncate leading-tight">{ch.subtitle}</p>
                  </div>
                </Link>
              ))}
            </div>

            {/* 인기 팀/클럽 */}
            <div className="mt-4 mb-2 px-1">
              <span className="text-[14px] tracking-[0.04em] text-pochak-text-tertiary font-semibold">인기 팀/클럽 &gt;</span>
            </div>
            <div className="flex flex-col gap-1">
              {channels.slice(4, 7).map((ch) => (
                <Link
                  key={ch.id}
                  to={`/team/${ch.id}`}
                  className="flex items-center gap-2.5 h-9 px-2 hover:bg-white/[0.05] rounded-lg transition-all duration-200 group"
                >
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[11px] font-bold text-white border border-border-subtle"
                    style={{ backgroundColor: ch.color }}
                  >
                    {ch.initial}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] text-foreground/80 font-medium truncate group-hover:text-foreground transition-colors">
                      {ch.name}
                    </p>
                    <p className="text-[13px] text-pochak-text-muted truncate leading-tight">{ch.subtitle}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          /* ── Collapsed: following avatars ── */
          <div className="flex flex-col items-center gap-2 px-2 flex-1 overflow-y-auto scrollbar-hide min-h-0 py-1">
            {channels.slice(0, 5).map((ch) => (
              <Link key={ch.id} to={`/team/${ch.id}`} className="flex-shrink-0" title={ch.name}>
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold text-white border border-border-subtle hover:border-primary/40 hover:scale-110 transition-all duration-200"
                  style={{ backgroundColor: ch.color }}
                >
                  {ch.initial}
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* ── Spacer ── */}
        <div className="flex-1 min-h-0" />

        {/* ── Util nav + Ad slot (expanded bottom) ── */}
        {expanded && (
          <>
            <div className="mx-3 mb-2 h-px bg-border-subtle" />
            <nav className="px-2 flex flex-col gap-1 flex-shrink-0" aria-label="유틸리티 네비게이션">
              {utilNav.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.label}
                    to={link.path}
                    className="flex items-center gap-3 h-9 px-3 rounded-lg text-[15px] text-muted-foreground hover:bg-white/[0.05] hover:text-foreground/80 transition-all duration-200"
                  >
                    <Icon className="size-4 flex-shrink-0" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
              <button
                className="flex items-center gap-3 h-9 px-3 rounded-lg text-[14px] text-muted-foreground hover:bg-white/[0.05] hover:text-foreground/80 transition-all duration-200 w-full"
                onClick={() => {}}
              >
                <LuLogOut className="size-4 flex-shrink-0" />
                <span>로그아웃</span>
              </button>
            </nav>

            {/* Ad slot */}
            <div className="px-3 py-3 flex-shrink-0">
              <div className="rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity border border-border-subtle bg-bg-surface-1">
                <div className="h-10 flex items-center gap-2.5 px-3">
                  <div className="w-5 h-5 rounded-md bg-primary/15 flex items-center justify-center flex-shrink-0">
                    <span className="text-[10px] font-bold text-primary">P</span>
                  </div>
                  <span className="text-[14px] text-pochak-text-secondary font-medium truncate flex-1">광고카피</span>
                  <span className="text-[11px] px-1.5 py-0.5 rounded bg-primary/10 text-primary/70 font-bold flex-shrink-0">AD</span>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ── Collapsed bottom util icons ── */}
        {!expanded && (
          <>
            <div className="mx-3 mb-2 h-px bg-border-subtle flex-shrink-0" />
            <div className="flex flex-col items-center gap-px px-2 pb-3 flex-shrink-0">
              {utilNav.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.label}
                    to={link.path}
                    title={link.label}
                    className="flex items-center justify-center h-9 w-full rounded-lg text-muted-foreground hover:bg-white/[0.05] hover:text-foreground/80 transition-all duration-200"
                  >
                    <Icon className="size-[17px]" />
                  </Link>
                );
              })}
              <button
                title="로그아웃"
                className="flex items-center justify-center h-9 w-full rounded-lg text-muted-foreground hover:bg-white/[0.05] hover:text-foreground/80 transition-all duration-200"
                onClick={() => {}}
              >
                <LuLogOut className="size-[17px]" />
              </button>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}
