"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { Users, TrendingUp, Video, ChevronRight, RefreshCw } from "lucide-react";
import { adminApi } from "@/lib/api-client";

type Period = "day" | "week" | "month";
const PERIOD_LABELS: Record<Period, string> = { day: "일간", week: "주간", month: "월간" };
const AUTO_REFRESH_INTERVAL = 60_000; // 60 seconds

/** Dashboard summary stats from the legacy admin API */
interface LegacyDashboardStats {
  totalMembers: number;
  totalContents: number;
  totalReservations: number;
  todayVisitors: number;
}

/** Analytics dashboard stats from the new analytics API */
interface AnalyticsDashboardStats {
  todayVisitors: number;
  weekVisitors: number;
  monthVisitors: number;
  todayActiveUsers: number;
  weekActiveUsers: number;
  monthActiveUsers: number;
  todayViews: number;
  weekViews: number;
  monthViews: number;
  todayRevenue: number;
  weekRevenue: number;
  monthRevenue: number;
  totalContents: number;
  topContent: Array<{ contentId: string; viewCount: number }>;
  activeUsersTrend: Array<{ date: string; activeUsers: number }>;
}

/** Merged dashboard state */
interface DashboardData {
  todayVisitors: number;
  todayActiveUsers: number;
  todayRevenue: number;
  totalContents: number;
  todayViews: number;
  weekViews: number;
  monthViews: number;
  topContent: Array<{ contentId: string; viewCount: number }>;
  activeUsersTrend: Array<{ date: string; activeUsers: number }>;
}

function getDateRangeLabel(): string {
  const now = new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  return `${now.getFullYear()}.${String(month).padStart(2, "0")}.${String(day).padStart(2, "0")} 기준`;
}

function getWeekRangeLabel(): string {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const fmt = (d: Date) =>
    `${d.getMonth() + 1}.${String(d.getDate()).padStart(2, "0")}`;
  return `${fmt(weekAgo)} ~ ${fmt(now)}`;
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [data, setData] = useState<DashboardData | null>(null);
  const [period, setPeriod] = useState<Period>("day");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchDashboard = useCallback(async (silent = false) => {
    if (!silent) setIsRefreshing(true);
    try {
      const analyticsResult = await adminApi.get<{ data: AnalyticsDashboardStats }>(
        `/admin/api/v1/analytics/dashboard?period=${period}`
      );
      const stats = (analyticsResult as any)?.data ?? analyticsResult;
      if (stats && typeof stats.todayVisitors === "number") {
        setData({
          todayVisitors: stats.todayVisitors,
          todayActiveUsers: stats.todayActiveUsers,
          todayRevenue: stats.todayRevenue,
          totalContents: stats.totalContents,
          todayViews: stats.todayViews,
          weekViews: stats.weekViews,
          monthViews: stats.monthViews,
          topContent: stats.topContent ?? [],
          activeUsersTrend: stats.activeUsersTrend ?? [],
        });
        setLastUpdated(new Date());
        return;
      }
    } catch {
      // analytics endpoint not available, try legacy
    }

    try {
      const legacy = await adminApi.get<LegacyDashboardStats>(
        "/admin/api/v1/dashboard/stats"
      );
      if (legacy) {
        setData({
          todayVisitors: legacy.todayVisitors,
          todayActiveUsers: legacy.totalMembers,
          todayRevenue: 0,
          totalContents: legacy.totalContents,
          todayViews: 0,
          weekViews: 0,
          monthViews: 0,
          topContent: [],
          activeUsersTrend: [],
        });
        setLastUpdated(new Date());
      }
    } catch (err) {
      if (process.env.NODE_ENV === "development") {
        console.warn("[Dashboard] Failed to fetch stats:", err);
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [period]);

  // Initial fetch + period change
  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // Auto-refresh polling
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      fetchDashboard(true);
    }, AUTO_REFRESH_INTERVAL);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchDashboard]);

  const fmt = (val: number | undefined) =>
    val !== undefined ? val.toLocaleString() : "--";

  const fmtCurrency = (val: number | undefined) =>
    val !== undefined ? `${val.toLocaleString()}원` : "--";

  return (
    <div className="space-y-6">
      {/* Welcome + Controls */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            안녕하세요, {user?.name || "관리자"}님
          </h1>
          <p className="mt-0.5 text-sm text-gray-400">
            POCHAK Back Office 대시보드입니다.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Period Selector */}
          <div className="flex rounded-lg border border-gray-200 bg-white p-0.5">
            {(["day", "week", "month"] as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  period === p
                    ? "bg-blue-600 text-white"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {PERIOD_LABELS[p]}
              </button>
            ))}
          </div>
          {/* Manual Refresh */}
          <button
            onClick={() => fetchDashboard()}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 disabled:opacity-50"
          >
            <RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} />
            새로고침
          </button>
          {/* Last Updated */}
          {lastUpdated && (
            <span className="text-xs text-gray-400">
              {lastUpdated.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })} 갱신
            </span>
          )}
        </div>
      </div>

      {/* Top KPI Grid: 2 columns */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* 오늘 방문자 */}
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
                <Users size={16} className="text-blue-600" />
              </div>
              <span className="text-sm font-medium text-gray-500">오늘 방문자</span>
            </div>
            <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-500">
              {getDateRangeLabel()}
            </span>
          </div>
          <div className="mt-4 flex items-end justify-between">
            <span className="text-[32px] font-bold leading-none text-gray-900">
              {fmt(data?.todayVisitors)}
            </span>
            <button className="flex items-center gap-0.5 text-xs font-medium text-blue-600 hover:text-blue-700">
              회원 관리
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* 활성 사용자 */}
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50">
                <TrendingUp size={16} className="text-emerald-600" />
              </div>
              <span className="text-sm font-medium text-gray-500">주간 활성 사용자</span>
            </div>
            <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-500">
              {getWeekRangeLabel()}
            </span>
          </div>
          <div className="mt-4 flex items-end justify-between">
            <span className="text-[32px] font-bold leading-none text-gray-900">
              {fmt(data?.todayActiveUsers)}
            </span>
            <button className="flex items-center gap-0.5 text-xs font-medium text-blue-600 hover:text-blue-700">
              통계 보기
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Secondary KPI Grid: 2 columns */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* 매출 현황 */}
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-500">매출 현황</span>
            </div>
            <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-500">
              {getDateRangeLabel()}
            </span>
          </div>
          <div className="mt-4 flex items-end justify-between">
            <span className="text-[32px] font-bold leading-none text-blue-600">
              {fmtCurrency(data?.todayRevenue)}
            </span>
            <button className="flex items-center gap-0.5 text-xs font-medium text-blue-600 hover:text-blue-700">
              전체 매출 내역
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* 총 콘텐츠 수 */}
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50">
                <Video size={16} className="text-violet-600" />
              </div>
              <span className="text-sm font-medium text-gray-500">총 콘텐츠 수</span>
            </div>
          </div>
          <div className="mt-4 flex items-end justify-between">
            <span className="text-[32px] font-bold leading-none text-gray-900">
              {fmt(data?.totalContents)}
            </span>
            <button className="flex items-center gap-0.5 text-xs font-medium text-blue-600 hover:text-blue-700">
              콘텐츠 관리
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Content Views - Full width card */}
      <div className="rounded-lg border border-gray-200 bg-white p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">콘텐츠 조회수</h2>
          <button className="flex items-center gap-0.5 text-xs font-medium text-blue-600 hover:text-blue-700">
            전체 통계
            <ChevronRight size={14} />
          </button>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-4">
          <div className="rounded-lg bg-[#f8f9fb] px-4 py-3">
            <p className="text-xs text-gray-400">오늘</p>
            <p className="mt-1 text-xl font-bold text-gray-900">{fmt(data?.todayViews)}</p>
          </div>
          <div className="rounded-lg bg-[#f8f9fb] px-4 py-3">
            <p className="text-xs text-gray-400">주간</p>
            <p className="mt-1 text-xl font-bold text-gray-900">{fmt(data?.weekViews)}</p>
          </div>
          <div className="rounded-lg bg-[#f8f9fb] px-4 py-3">
            <p className="text-xs text-gray-400">월간</p>
            <p className="mt-1 text-xl font-bold text-gray-900">{fmt(data?.monthViews)}</p>
          </div>
        </div>
      </div>

      {/* Active Users Trend - Full width */}
      {data?.activeUsersTrend && data.activeUsersTrend.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">
              일별 활성 사용자 추이 (30일)
            </h2>
          </div>
          <div className="mt-4 flex items-end gap-0.5" style={{ height: 120 }}>
            {data.activeUsersTrend.map((item) => {
              const max = Math.max(
                ...data.activeUsersTrend.map((d) => d.activeUsers),
                1
              );
              const heightPct = (item.activeUsers / max) * 100;
              return (
                <div
                  key={item.date}
                  className="flex-1 rounded-t bg-blue-400 transition-all hover:bg-blue-500"
                  style={{ height: `${heightPct}%`, minHeight: 2 }}
                  title={`${item.date}: ${item.activeUsers}명`}
                />
              );
            })}
          </div>
          <div className="mt-1.5 flex justify-between text-xs text-gray-400">
            <span>{data.activeUsersTrend[0]?.date}</span>
            <span>
              {data.activeUsersTrend[data.activeUsersTrend.length - 1]?.date}
            </span>
          </div>
        </div>
      )}

      {/* Top Content - Full width */}
      {data?.topContent && data.topContent.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">
              인기 콘텐츠 (월간)
            </h2>
            <button className="flex items-center gap-0.5 text-xs font-medium text-blue-600 hover:text-blue-700">
              전체 콘텐츠
              <ChevronRight size={14} />
            </button>
          </div>
          <div className="mt-4 space-y-3">
            {data.topContent.map((item, idx) => (
              <div
                key={item.contentId}
                className="flex items-center justify-between rounded-md px-3 py-2 text-sm hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-600">
                    {idx + 1}
                  </span>
                  <span className="text-gray-700">{item.contentId}</span>
                </div>
                <span className="font-semibold text-gray-900">
                  {item.viewCount.toLocaleString()}회
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Start / Status */}
      <div className="rounded-lg border border-gray-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-gray-900">빠른 시작</h2>
        <p className="mt-2 text-sm text-gray-500">
          좌측 사이드바 메뉴를 통해 각 관리 기능에 접근할 수 있습니다.
          {data
            ? " 대시보드가 Analytics API에 연결되었습니다."
            : " API 서버 연동 후 대시보드에 실시간 데이터가 표시됩니다."}
        </p>
      </div>
    </div>
  );
}
