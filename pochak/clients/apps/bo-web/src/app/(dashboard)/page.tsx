"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useAuthStore } from "@/stores/auth-store";
import {
  Users,
  TrendingUp,
  Video,
  ChevronRight,
  RefreshCw,
  DollarSign,
  Eye,
} from "lucide-react";
import { adminApi } from "@/lib/api-client";
import { BarChart } from "@/components/charts/BarChart";
import { AreaChart } from "@/components/charts/AreaChart";
import { DonutChart } from "@/components/charts/DonutChart";

type Period = "day" | "week" | "month";
const PERIOD_LABELS: Record<Period, string> = {
  day: "일간",
  week: "주간",
  month: "월간",
};
const AUTO_REFRESH_INTERVAL = 60_000;

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
  topContent: Array<{ contentId: string; title?: string; viewCount: number }>;
  activeUsersTrend: Array<{ date: string; activeUsers: number }>;
  revenueTrend?: Array<{ date: string; revenue: number }>;
  viewsTrend?: Array<{ date: string; views: number }>;
  contentDistribution?: Array<{
    type: string;
    count: number;
  }>;
}

interface LegacyDashboardStats {
  totalMembers: number;
  totalContents: number;
  totalReservations: number;
  todayVisitors: number;
}

interface DashboardData {
  todayVisitors: number;
  weekVisitors: number;
  monthVisitors: number;
  todayActiveUsers: number;
  weekActiveUsers: number;
  monthActiveUsers: number;
  todayRevenue: number;
  weekRevenue: number;
  monthRevenue: number;
  totalContents: number;
  todayViews: number;
  weekViews: number;
  monthViews: number;
  topContent: Array<{ contentId: string; title?: string; viewCount: number }>;
  activeUsersTrend: Array<{ date: string; activeUsers: number }>;
  revenueTrend: Array<{ date: string; revenue: number }>;
  viewsTrend: Array<{ date: string; views: number }>;
  contentDistribution: Array<{ type: string; count: number }>;
}

function getDateRangeLabel(): string {
  const now = new Date();
  const m = now.getMonth() + 1;
  const d = now.getDate();
  return `${now.getFullYear()}.${String(m).padStart(2, "0")}.${String(d).padStart(2, "0")} 기준`;
}

function getWeekRangeLabel(): string {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const fmt = (dt: Date) =>
    `${dt.getMonth() + 1}.${String(dt.getDate()).padStart(2, "0")}`;
  return `${fmt(weekAgo)} ~ ${fmt(now)}`;
}

function formatWon(value: number): string {
  if (value >= 100_000_000) return `${(value / 100_000_000).toFixed(1)}억`;
  if (value >= 10_000) return `${(value / 10_000).toFixed(0)}만`;
  return value.toLocaleString();
}

function formatShortDate(dateStr: string): string {
  const parts = dateStr.split("-");
  if (parts.length >= 3) return `${parts[1]}/${parts[2]}`;
  return dateStr;
}

const CONTENT_TYPE_COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
];

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [data, setData] = useState<DashboardData | null>(null);
  const [period, setPeriod] = useState<Period>("day");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchDashboard = useCallback(
    async (silent = false) => {
      if (!silent) setIsRefreshing(true);
      try {
        const analyticsResult = await adminApi.get<{
          data: AnalyticsDashboardStats;
        }>(`/admin/api/v1/analytics/dashboard?period=${period}`);
        const stats =
          (analyticsResult as Record<string, unknown>)?.data ?? analyticsResult;
        const s = stats as AnalyticsDashboardStats;
        if (s && typeof s.todayVisitors === "number") {
          setData({
            todayVisitors: s.todayVisitors,
            weekVisitors: s.weekVisitors ?? 0,
            monthVisitors: s.monthVisitors ?? 0,
            todayActiveUsers: s.todayActiveUsers,
            weekActiveUsers: s.weekActiveUsers ?? 0,
            monthActiveUsers: s.monthActiveUsers ?? 0,
            todayRevenue: s.todayRevenue,
            weekRevenue: s.weekRevenue ?? 0,
            monthRevenue: s.monthRevenue ?? 0,
            totalContents: s.totalContents,
            todayViews: s.todayViews,
            weekViews: s.weekViews,
            monthViews: s.monthViews,
            topContent: s.topContent ?? [],
            activeUsersTrend: s.activeUsersTrend ?? [],
            revenueTrend: s.revenueTrend ?? [],
            viewsTrend: s.viewsTrend ?? [],
            contentDistribution: s.contentDistribution ?? [],
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
            weekVisitors: 0,
            monthVisitors: 0,
            todayActiveUsers: legacy.totalMembers,
            weekActiveUsers: 0,
            monthActiveUsers: 0,
            todayRevenue: 0,
            weekRevenue: 0,
            monthRevenue: 0,
            totalContents: legacy.totalContents,
            todayViews: 0,
            weekViews: 0,
            monthViews: 0,
            topContent: [],
            activeUsersTrend: [],
            revenueTrend: [],
            viewsTrend: [],
            contentDistribution: [],
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
    },
    [period]
  );

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

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
    val !== undefined ? `${formatWon(val)}원` : "--";

  const periodVisitors =
    period === "day"
      ? data?.todayVisitors
      : period === "week"
        ? data?.weekVisitors
        : data?.monthVisitors;
  const periodActiveUsers =
    period === "day"
      ? data?.todayActiveUsers
      : period === "week"
        ? data?.weekActiveUsers
        : data?.monthActiveUsers;
  const periodRevenue =
    period === "day"
      ? data?.todayRevenue
      : period === "week"
        ? data?.weekRevenue
        : data?.monthRevenue;
  const periodViews =
    period === "day"
      ? data?.todayViews
      : period === "week"
        ? data?.weekViews
        : data?.monthViews;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            안녕하세요, {user?.name || "관리자"}님
          </h1>
          <p style={{ marginTop: 2 }} className="text-sm text-gray-400">
            POCHAK Back Office 대시보드입니다.
          </p>
        </div>
        <div className="flex items-center gap-3">
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
          <button
            onClick={() => fetchDashboard()}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 disabled:opacity-50"
          >
            <RefreshCw
              size={14}
              className={isRefreshing ? "animate-spin" : ""}
            />
            새로고침
          </button>
          {lastUpdated && (
            <span className="text-xs text-gray-400">
              {lastUpdated.toLocaleTimeString("ko-KR", {
                hour: "2-digit",
                minute: "2-digit",
              })}{" "}
              갱신
            </span>
          )}
        </div>
      </div>

      {/* KPI Cards - 4 columns */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 16,
        }}
      >
        {/* 방문자 */}
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
              <Users size={16} className="text-blue-600" />
            </div>
            <span className="text-sm font-medium text-gray-500">
              {PERIOD_LABELS[period]} 방문자
            </span>
          </div>
          <div style={{ marginTop: 12 }}>
            <span className="text-[28px] font-bold leading-none text-gray-900">
              {fmt(periodVisitors)}
            </span>
            <span className="text-sm text-gray-400" style={{ marginLeft: 4 }}>
              명
            </span>
          </div>
        </div>

        {/* 활성 사용자 */}
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50">
              <TrendingUp size={16} className="text-emerald-600" />
            </div>
            <span className="text-sm font-medium text-gray-500">
              {PERIOD_LABELS[period]} 활성 사용자
            </span>
          </div>
          <div style={{ marginTop: 12 }}>
            <span className="text-[28px] font-bold leading-none text-gray-900">
              {fmt(periodActiveUsers)}
            </span>
            <span className="text-sm text-gray-400" style={{ marginLeft: 4 }}>
              명
            </span>
          </div>
        </div>

        {/* 매출 */}
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50">
              <DollarSign size={16} className="text-amber-600" />
            </div>
            <span className="text-sm font-medium text-gray-500">
              {PERIOD_LABELS[period]} 매출
            </span>
          </div>
          <div style={{ marginTop: 12 }}>
            <span className="text-[28px] font-bold leading-none text-blue-600">
              {fmtCurrency(periodRevenue)}
            </span>
          </div>
        </div>

        {/* 조회수 */}
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50">
              <Eye size={16} className="text-violet-600" />
            </div>
            <span className="text-sm font-medium text-gray-500">
              {PERIOD_LABELS[period]} 조회수
            </span>
          </div>
          <div style={{ marginTop: 12 }}>
            <span className="text-[28px] font-bold leading-none text-gray-900">
              {fmt(periodViews)}
            </span>
            <span className="text-sm text-gray-400" style={{ marginLeft: 4 }}>
              회
            </span>
          </div>
        </div>
      </div>

      {/* Charts Row: Active Users Trend + Revenue Trend */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
        }}
      >
        {/* Active Users Trend */}
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">
              활성 사용자 추이
            </h2>
            <span className="text-xs text-gray-400">최근 30일</span>
          </div>
          <div style={{ marginTop: 16, paddingBottom: 20 }}>
            {data?.activeUsersTrend && data.activeUsersTrend.length > 0 ? (
              <BarChart
                data={data.activeUsersTrend.map((d) => ({
                  label: formatShortDate(d.date),
                  value: d.activeUsers,
                }))}
                height={180}
                color="#3b82f6"
                hoverColor="#2563eb"
              />
            ) : (
              <div
                className="flex items-center justify-center text-sm text-gray-400"
                style={{ height: 180 }}
              >
                데이터가 없습니다
              </div>
            )}
          </div>
        </div>

        {/* Revenue Trend */}
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">매출 추이</h2>
            <span className="text-xs text-gray-400">최근 30일</span>
          </div>
          <div style={{ marginTop: 16, paddingBottom: 20 }}>
            {data?.revenueTrend && data.revenueTrend.length > 0 ? (
              <AreaChart
                data={data.revenueTrend.map((d) => ({
                  label: formatShortDate(d.date),
                  value: d.revenue,
                }))}
                height={180}
                color="#10b981"
                fillColor="rgba(16,185,129,0.1)"
                formatValue={(v) => `${formatWon(v)}원`}
              />
            ) : (
              <div
                className="flex items-center justify-center text-sm text-gray-400"
                style={{ height: 180 }}
              >
                데이터가 없습니다
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Views Trend + Content Distribution */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: 16,
        }}
      >
        {/* Views Trend */}
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">
              콘텐츠 조회수 추이
            </h2>
            <button className="flex items-center gap-0.5 text-xs font-medium text-blue-600 hover:text-blue-700">
              전체 통계
              <ChevronRight size={14} />
            </button>
          </div>
          <div style={{ marginTop: 16 }}>
            {/* Summary cards */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 12,
                marginBottom: 16,
              }}
            >
              <div className="rounded-lg bg-[#f8f9fb] px-4 py-3">
                <p className="text-xs text-gray-400">오늘</p>
                <p
                  className="text-xl font-bold text-gray-900"
                  style={{ marginTop: 4 }}
                >
                  {fmt(data?.todayViews)}
                </p>
              </div>
              <div className="rounded-lg bg-[#f8f9fb] px-4 py-3">
                <p className="text-xs text-gray-400">주간</p>
                <p
                  className="text-xl font-bold text-gray-900"
                  style={{ marginTop: 4 }}
                >
                  {fmt(data?.weekViews)}
                </p>
              </div>
              <div className="rounded-lg bg-[#f8f9fb] px-4 py-3">
                <p className="text-xs text-gray-400">월간</p>
                <p
                  className="text-xl font-bold text-gray-900"
                  style={{ marginTop: 4 }}
                >
                  {fmt(data?.monthViews)}
                </p>
              </div>
            </div>

            {/* Views chart */}
            <div style={{ paddingBottom: 20 }}>
              {data?.viewsTrend && data.viewsTrend.length > 0 ? (
                <AreaChart
                  data={data.viewsTrend.map((d) => ({
                    label: formatShortDate(d.date),
                    value: d.views,
                  }))}
                  height={160}
                  color="#8b5cf6"
                  fillColor="rgba(139,92,246,0.1)"
                />
              ) : (
                <div
                  className="flex items-center justify-center text-sm text-gray-400"
                  style={{ height: 160 }}
                >
                  차트 데이터가 없습니다
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content Distribution */}
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">
              콘텐츠 분포
            </h2>
          </div>
          <div
            className="flex items-center justify-center"
            style={{ marginTop: 16 }}
          >
            {data?.contentDistribution &&
            data.contentDistribution.length > 0 ? (
              <DonutChart
                data={data.contentDistribution.map((d, i) => ({
                  label: d.type,
                  value: d.count,
                  color: CONTENT_TYPE_COLORS[i % CONTENT_TYPE_COLORS.length],
                }))}
                size={160}
                centerValue={fmt(data.totalContents)}
                centerLabel="총 콘텐츠"
              />
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-50">
                  <Video size={20} className="text-violet-600" />
                </div>
                <span className="text-[28px] font-bold text-gray-900">
                  {fmt(data?.totalContents)}
                </span>
                <span className="text-xs text-gray-500">총 콘텐츠 수</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top Content */}
      {data?.topContent && data.topContent.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">
              인기 콘텐츠 (월간 TOP 10)
            </h2>
            <button className="flex items-center gap-0.5 text-xs font-medium text-blue-600 hover:text-blue-700">
              전체 콘텐츠
              <ChevronRight size={14} />
            </button>
          </div>
          <div style={{ marginTop: 12 }}>
            {data.topContent.slice(0, 10).map((item, idx) => {
              const maxViews = data.topContent[0]?.viewCount ?? 1;
              const barPct = (item.viewCount / maxViews) * 100;
              return (
                <div
                  key={item.contentId}
                  className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm hover:bg-gray-50"
                >
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      idx < 3
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <span className="w-40 truncate text-gray-700">
                    {item.title || item.contentId}
                  </span>
                  <div className="flex-1">
                    <div
                      className="h-2 rounded-full bg-blue-100"
                      style={{ width: "100%" }}
                    >
                      <div
                        className="h-2 rounded-full bg-blue-500 transition-all"
                        style={{ width: `${barPct}%` }}
                      />
                    </div>
                  </div>
                  <span className="shrink-0 font-semibold text-gray-900">
                    {item.viewCount.toLocaleString()}회
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick Start */}
      <div className="rounded-lg border border-gray-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-gray-900">빠른 시작</h2>
        <p className="text-sm text-gray-500" style={{ marginTop: 8 }}>
          좌측 사이드바 메뉴를 통해 각 관리 기능에 접근할 수 있습니다.
          {data
            ? " 대시보드가 Analytics API에 연결되었습니다."
            : " API 서버 연동 후 대시보드에 실시간 데이터가 표시됩니다."}
        </p>
      </div>
    </div>
  );
}
