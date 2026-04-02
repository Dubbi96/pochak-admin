"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu, ChevronDown, User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/stores/auth-store";
import { ThemeToggle } from "@/components/theme-toggle";

const pageTitleMap: Record<string, string> = {
  "/": "대시보드",
  "/operations": "운영 관리",
  "/operations/members": "멤버관리",
  "/operations/groups": "그룹관리",
  "/operations/permissions": "권한관리",
  "/operations/menus": "메뉴관리",
  "/operations/features": "세부기능관리",
  "/equipment": "장비 관리",
  "/equipment/cameras": "카메라관리",
  "/equipment/vpu-devices": "VPU장비",
  "/equipment/vpu-contracts": "VPU계약",
  "/stadiums": "구장 관리",
  "/venues": "구장 관리",
  "/venues/list": "구장 관리",
  "/reservations": "촬영예약 관리",
  "/recordings": "촬영 관리",
  "/contents": "콘텐츠 관리",
  "/contents/live": "라이브",
  "/contents/vod": "VOD",
  "/contents/clips": "클립",
  "/contents/tags": "태그",
  "/members": "회원 관리",
  "/members/list": "회원리스트",
  "/members/blacklist": "블랙리스트",
  "/teams": "팀/단체 관리",
  "/associations": "협회 관리",
  "/tournaments": "대회/리그 관리",
  "/sports": "종목 관리",
  "/sports/list": "종목 관리",
  "/commerce": "커머스 관리",
  "/commerce/point-history": "뽈 사용내역",
  "/commerce/season-pass": "시즌권 관리",
  "/commerce/ball-settings": "뽈 관리",
  "/commerce/refunds": "환불 관리",
  "/commerce/pricing": "요금관리",
  "/site": "사이트 관리",
  "/site/popups": "팝업",
  "/site/banners": "배너",
  "/site/notices": "공지사항",
  "/site/events": "이벤트",
  "/support": "고객센터",
  "/support/inquiries": "1:1문의",
  "/support/reports": "신고",
  "/support/terms": "약관",
  "/app-management": "앱 관리",
  "/statistics": "통계",
};

function usePageTitle(): string {
  const pathname = usePathname();
  if (pageTitleMap[pathname]) return pageTitleMap[pathname];
  const segments = pathname.split("/").filter(Boolean);
  while (segments.length > 0) {
    const path = "/" + segments.join("/");
    if (pageTitleMap[path]) return pageTitleMap[path];
    segments.pop();
  }
  return "대시보드";
}

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const pageTitle = usePageTitle();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const userInitial = user?.name?.charAt(0) || "A";
  const userName = user?.name || "관리자";

  return (
    <header
      className="flex h-14 shrink-0 items-center justify-between px-4 lg:px-6"
      style={{
        borderBottom: "1px solid var(--c-border)",
        backgroundColor: "var(--c-header-bg)",
      }}
    >
      {/* Left: mobile menu + page title */}
      <div className="flex items-center gap-3">
        <button
          className="rounded-md p-1.5 lg:hidden"
          style={{ color: "var(--fg-secondary)" }}
          onClick={onMenuClick}
        >
          <Menu size={20} />
        </button>
        <h1 className="text-lg font-bold" style={{ color: "var(--fg)" }}>
          {pageTitle}
        </h1>
      </div>

      {/* Right: theme toggle + user avatar */}
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm transition-colors">
              <Avatar className="h-8 w-8">
                <AvatarFallback
                  style={{
                    backgroundColor: "var(--c-primary-light)",
                    color: "var(--c-primary)",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                  }}
                >
                  {userInitial}
                </AvatarFallback>
              </Avatar>
              <span
                className="hidden font-medium md:inline"
                style={{ color: "var(--fg)" }}
              >
                {userName} 님
              </span>
              <ChevronDown
                size={14}
                className="hidden md:block"
                style={{ color: "var(--fg-tertiary)" }}
              />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 p-2">
            <div
              className="mb-2 rounded-md px-3 py-2.5"
              style={{ backgroundColor: "var(--bg-surface-variant)" }}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold" style={{ color: "var(--fg)" }}>
                  {userName}
                </span>
                <button
                  onClick={handleLogout}
                  className="rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors"
                  style={{
                    border: "1px solid var(--c-border)",
                    backgroundColor: "var(--bg-surface)",
                    color: "var(--fg-secondary)",
                  }}
                >
                  로그아웃
                </button>
              </div>
              {user?.email && (
                <p className="mt-0.5 text-xs" style={{ color: "var(--fg-tertiary)" }}>
                  {user.email}
                </p>
              )}
            </div>
            <DropdownMenuItem className="gap-2 rounded-md px-3 py-2 text-sm">
              <User size={14} />
              내 정보
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
