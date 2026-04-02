"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { canAccessMenuItem } from "@/lib/permissions";
import {
  Users,
  Menu,
  Camera,
  FileText,
  MapPin,
  CalendarCheck,
  Play,
  Video,
  Scissors,
  Tag,
  UserCheck,
  UserX,
  Building2,
  Landmark,
  Trophy,
  Dumbbell,
  Coins,
  Monitor,
  Image,
  Megaphone,
  Gift,
  HelpCircle,
  MessageSquare,
  Flag,
  BookOpen,
  Smartphone,
  BarChart3,
  ChevronDown,
  X,
  Settings,
  Shield,
  Layers,
  Clapperboard,
  Activity,
  Cpu,
  Handshake,
} from "lucide-react";

interface MenuItem {
  label: string;
  href?: string;
  icon: React.ReactNode;
  children?: { label: string; href: string; icon: React.ReactNode }[];
  group?: string;
}

const menuItems: MenuItem[] = [
  { label: "종목 관리", href: "/sports/list", icon: <Dumbbell size={18} /> },
  { label: "협회 관리", href: "/teams/associations", icon: <Building2 size={18} /> },
  { label: "구장 관리", href: "/venues/list", icon: <MapPin size={18} /> },
  {
    label: "팀/단체 관리",
    icon: <Users size={18} />,
    children: [
      { label: "팀(엘리트)", href: "/teams/elite", icon: <Users size={16} /> },
      { label: "팀(동호회)", href: "/teams/club", icon: <Users size={16} /> },
      { label: "단체(폐쇄) 본점", href: "/teams/private-hq", icon: <Landmark size={16} /> },
      { label: "단체(폐쇄) 지점", href: "/teams/private-branch", icon: <Landmark size={16} /> },
      { label: "단체(개방)", href: "/teams/public-org", icon: <Users size={16} /> },
    ],
  },
  {
    label: "대회/리그 관리",
    icon: <Trophy size={18} />,
    children: [
      { label: "대회/리그", href: "/competitions/list", icon: <Trophy size={16} /> },
      { label: "대회경기일정", href: "/competitions/schedule", icon: <CalendarCheck size={16} /> },
    ],
  },
  {
    label: "VPU 관리",
    icon: <Camera size={18} />,
    children: [
      { label: "VPU 구장 연결", href: "/equipment/cameras", icon: <Camera size={16} /> },
      { label: "VPU 장비", href: "/equipment/vpu-devices", icon: <Cpu size={16} /> },
      { label: "VPU 계약", href: "/equipment/vpu-contracts", icon: <FileText size={16} /> },
    ],
  },
  {
    label: "촬영예약 관리",
    icon: <CalendarCheck size={18} />,
    children: [
      { label: "촬영예약(캘린더)", href: "/reservations", icon: <CalendarCheck size={16} /> },
      { label: "촬영예약(뽈)", href: "/reservations/booking", icon: <Coins size={16} /> },
    ],
  },
  { label: "촬영 관리", href: "/recordings", icon: <Video size={18} /> },
  { label: "스튜디오 관리", href: "/studio", icon: <Clapperboard size={18} /> },
  {
    label: "컨텐츠 관리",
    icon: <Video size={18} />,
    children: [
      { label: "라이브", href: "/contents/live", icon: <Play size={16} /> },
      { label: "VOD", href: "/contents/vod", icon: <Video size={16} /> },
      { label: "클립", href: "/contents/clips", icon: <Scissors size={16} /> },
      { label: "태그", href: "/contents/tags", icon: <Tag size={16} /> },
    ],
  },
  {
    label: "회원 관리",
    icon: <UserCheck size={18} />,
    children: [
      { label: "회원리스트", href: "/members/list", icon: <UserCheck size={16} /> },
      { label: "블랙리스트", href: "/members/blacklist", icon: <UserX size={16} /> },
    ],
  },
  { label: "파트너 관리", href: "/partners", icon: <Handshake size={18} /> },
  {
    label: "커뮤니티 관리",
    icon: <MessageSquare size={18} />,
    children: [
      { label: "게시물 관리", href: "/community/posts", icon: <MessageSquare size={16} /> },
      { label: "신고 관리", href: "/community/reports", icon: <Flag size={16} /> },
    ],
  },
  {
    label: "뽈/시즌권/환불",
    icon: <Coins size={18} />,
    children: [
      { label: "뽈 관리", href: "/commerce/ball-settings", icon: <Coins size={16} /> },
      { label: "뽈 사용내역", href: "/commerce/point-history", icon: <Coins size={16} /> },
      { label: "기프티뽈", href: "/commerce/gift-ball", icon: <Gift size={16} /> },
      { label: "환불 관리", href: "/commerce/refunds", icon: <Coins size={16} /> },
      { label: "시즌권 관리", href: "/commerce/season-pass", icon: <Coins size={16} /> },
      { label: "요금관리", href: "/commerce/pricing", icon: <Coins size={16} /> },
      { label: "인앱 환불", href: "/commerce/inapp-refunds", icon: <Coins size={16} /> },
      { label: "시즌권 사용내역", href: "/commerce/season-pass-history", icon: <Coins size={16} /> },
      { label: "잔여뽈 관리", href: "/commerce/remaining-points", icon: <Coins size={16} /> },
    ],
  },
  {
    label: "사이트 관리",
    icon: <Monitor size={18} />,
    children: [
      { label: "팝업", href: "/site/popups", icon: <Monitor size={16} /> },
      { label: "배너", href: "/site/banners", icon: <Image size={16} /> },
      { label: "공지사항", href: "/site/notices", icon: <Megaphone size={16} /> },
      { label: "이벤트", href: "/site/events", icon: <Gift size={16} /> },
    ],
  },
  { label: "앱 관리", href: "/app-management", icon: <Smartphone size={18} /> },
  {
    label: "고객센터 관리",
    icon: <HelpCircle size={18} />,
    children: [
      { label: "1:1 문의", href: "/support/inquiries", icon: <MessageSquare size={16} /> },
      { label: "신고", href: "/support/reports", icon: <Flag size={16} /> },
      { label: "약관", href: "/support/terms", icon: <BookOpen size={16} /> },
    ],
  },
  {
    label: "운영 관리",
    icon: <Settings size={18} />,
    children: [
      { label: "멤버관리", href: "/operations/members", icon: <Users size={16} /> },
      { label: "그룹관리", href: "/operations/groups", icon: <Layers size={16} /> },
      { label: "권한관리", href: "/operations/permissions", icon: <Shield size={16} /> },
      { label: "메뉴관리", href: "/operations/menus", icon: <Menu size={16} /> },
    ],
  },
  { label: "모니터링", href: "/monitoring", icon: <Activity size={18} /> },
  {
    label: "통계",
    icon: <BarChart3 size={18} />,
    children: [
      { label: "사용자통계", href: "/statistics/users", icon: <Users size={16} /> },
      { label: "시청통계", href: "/statistics/views", icon: <Play size={16} /> },
      { label: "매출통계", href: "/statistics/sales", icon: <Coins size={16} /> },
    ],
  },
  {
    label: "스카이라이프 계약",
    icon: <FileText size={18} />,
    children: [
      { label: "개통 리스트", href: "/skylife/activation", icon: <FileText size={16} /> },
      { label: "VPU CHU 등록", href: "/skylife/vpu-chu", icon: <Cpu size={16} /> },
    ],
  },
];

const separatorBeforeIndices = new Set([3, 6, 9, 12, 14, 16]);

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

function SidebarMenuItem({ item }: { item: MenuItem }) {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(false);
  const { user } = useAuthStore();
  const userRole = user?.role ?? "VIEWER";

  const hasChildren = item.children && item.children.length > 0;
  const isActive = item.href === pathname;
  const isChildActive = item.children?.some((child) => child.href === pathname);

  const canAccess = item.href
    ? canAccessMenuItem(userRole, item.href)
    : item.children?.some((child) => canAccessMenuItem(userRole, child.href)) ?? true;

  React.useEffect(() => {
    if (isChildActive) {
      setExpanded(true);
    }
  }, [isChildActive]);

  if (hasChildren) {
    return (
      <div>
        <button
          onClick={() => setExpanded(!expanded)}
          className={cn(
            "flex w-full items-center justify-between px-4 py-2.5 text-sm transition-colors",
            !canAccess && "cursor-not-allowed"
          )}
          style={{
            color: !canAccess
              ? "var(--c-border)"
              : isChildActive
                ? "var(--c-primary)"
                : "var(--fg-secondary)",
            backgroundColor: isChildActive && canAccess ? "var(--c-primary-light)" : undefined,
            fontWeight: isChildActive && canAccess ? 500 : undefined,
          }}
          disabled={!canAccess}
          title={!canAccess ? "접근 권한이 없습니다" : undefined}
        >
          <span className="flex items-center gap-3 [&>svg]:shrink-0">
            <span style={{
              color: !canAccess
                ? "var(--c-border)"
                : isChildActive
                  ? "var(--c-primary)"
                  : "var(--fg-tertiary)"
            }}>
              {item.icon}
            </span>
            <span>{item.label}</span>
          </span>
          {canAccess && (
            <span className={cn("transition-transform duration-200", expanded && "rotate-180")}>
              <ChevronDown
                size={14}
                style={{ color: isChildActive ? "var(--c-primary)" : "var(--fg-tertiary)" }}
              />
            </span>
          )}
        </button>
        {expanded && canAccess && (
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {item.children!.map((child) => {
              const childCanAccess = canAccessMenuItem(userRole, child.href);
              const childActive = pathname === child.href;
              if (!childCanAccess) {
                return (
                  <span
                    key={child.href}
                    className="flex items-center gap-2 py-2 pl-10 pr-4 text-sm cursor-not-allowed"
                    style={{ color: "var(--c-border)" }}
                    title="접근 권한이 없습니다"
                  >
                    {child.icon}
                    {child.label}
                  </span>
                );
              }
              return (
                <Link
                  key={child.href}
                  href={child.href}
                  className="flex items-center gap-2 py-2 pl-10 pr-4 text-sm transition-colors"
                  style={{
                    backgroundColor: childActive ? "var(--c-primary-light)" : undefined,
                    color: childActive ? "var(--c-primary)" : "var(--fg-secondary)",
                    fontWeight: childActive ? 500 : undefined,
                    borderLeft: childActive
                      ? "3px solid var(--c-primary)"
                      : "3px solid transparent",
                  }}
                >
                  <span style={{ color: childActive ? "var(--c-primary)" : "var(--fg-tertiary)" }}>
                    {child.icon}
                  </span>
                  {child.label}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  if (!canAccess) {
    return (
      <span
        className="flex items-center gap-3 px-4 py-2.5 text-sm cursor-not-allowed"
        style={{ color: "var(--c-border)" }}
        title="접근 권한이 없습니다"
      >
        <span style={{ color: "var(--c-border)" }}>{item.icon}</span>
        {item.label}
      </span>
    );
  }

  return (
    <Link
      href={item.href!}
      className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors"
      style={{
        backgroundColor: isActive ? "var(--c-primary-light)" : undefined,
        color: isActive ? "var(--c-primary)" : "var(--fg-secondary)",
        fontWeight: isActive ? 500 : undefined,
        borderLeft: isActive ? "3px solid var(--c-primary)" : "3px solid transparent",
      }}
    >
      <span style={{ color: isActive ? "var(--c-primary)" : "var(--fg-tertiary)" }}>
        {item.icon}
      </span>
      {item.label}
    </Link>
  );
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ backgroundColor: "var(--c-overlay)" }}
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-full w-[220px] flex-col transition-transform duration-200 lg:static lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
        style={{
          backgroundColor: "var(--bg-surface)",
          borderRight: "1px solid var(--c-border)",
        }}
      >
        {/* Logo */}
        <div
          className="flex h-14 items-center justify-between px-4"
          style={{ borderBottom: "1px solid var(--c-border)" }}
        >
          <Link href="/" className="flex items-center gap-2">
            <span className="text-lg font-bold tracking-tight" style={{ color: "var(--fg)" }}>
              POCHAK
            </span>
            <span
              className="rounded px-1.5 py-0.5 text-[10px] font-semibold"
              style={{ backgroundColor: "var(--c-primary)", color: "var(--fg-on-primary)" }}
            >
              BO
            </span>
          </Link>
          <button
            className="lg:hidden"
            style={{ color: "var(--fg-tertiary)" }}
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        {/* Menu */}
        <nav
          className="flex-1 overflow-y-auto py-3"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <style jsx>{`nav::-webkit-scrollbar { display: none; }`}</style>
          <div>
            {menuItems.map((item, index) => (
              <React.Fragment key={item.label}>
                {separatorBeforeIndices.has(index) && (
                  <div className="my-2 mx-4" style={{ borderTop: "1px solid var(--c-border-light)" }} />
                )}
                <SidebarMenuItem item={item} />
              </React.Fragment>
            ))}
          </div>
        </nav>

        {/* Footer */}
        <div className="px-4 py-3" style={{ borderTop: "1px solid var(--c-border)" }}>
          <p className="text-[11px]" style={{ color: "var(--fg-tertiary)" }}>
            POCHAK Back Office v1.0
          </p>
        </div>
      </aside>
    </>
  );
}
