"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  DateRangePicker,
  type DateRange,
} from "@/components/filter/date-range-picker";
import {
  Download,
  Eye,
  Clock,
  Users,
  Star,
  LayoutList,
  LayoutGrid,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import {
  exportToCsv,
  type ViewStatistics,
  type ViewContentItem,
  type DailyViewPoint,
  type ContentBreakdownItem,
} from "@/services/statistics-api";
import { adminApi } from "@/lib/api-client";

// ── KPI Card ───────────────────────────────────────────────────────

const KPI_ICONS = [Eye, Clock, Users, Star] as const;

function KpiCard({
  label,
  value,
  unit,
  change,
  icon: Icon,
}: {
  label: string;
  value: number;
  unit?: string;
  change?: number;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-gray-500">{label}</CardTitle>
        <Icon size={18} className="text-gray-400" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {value.toLocaleString()}
          {unit && <span className="ml-1 text-sm font-normal text-gray-500">{unit}</span>}
        </div>
        {change !== undefined && (
          <p className={`flex items-center gap-1 text-xs ${change >= 0 ? "text-emerald-600" : "text-red-500"}`}>
            {change >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            전기 대비 {Math.abs(change)}%
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// ── Daily Views Bar Chart ─────────────────────────────────────────

function DailyViewsChart({ data }: { data: DailyViewPoint[] }) {
  const maxValue = Math.max(...data.map((d) => d.views), 1);

  return (
    <div className="flex items-end gap-2" style={{ height: 180 }}>
      {data.map((d) => (
        <div key={d.date} className="flex flex-1 flex-col items-center gap-1">
          <span className="text-[10px] text-gray-500">
            {d.views.toLocaleString()}
          </span>
          <div
            className="bg-emerald-500 w-full max-w-[48px] rounded-t transition-all"
            style={{ height: `${(d.views / maxValue) * 100}%`, minHeight: 4 }}
          />
          <span className="text-xs text-gray-600">{d.date}</span>
        </div>
      ))}
    </div>
  );
}

// ── Content Breakdown Table ───────────────────────────────────────

function ContentBreakdownTable({ items }: { items: ContentBreakdownItem[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50 text-xs font-medium uppercase tracking-wider text-gray-500">
            <th className="px-4 py-3">종목</th>
            <th className="px-4 py-3 text-right">LIVE 조회</th>
            <th className="px-4 py-3 text-right">VOD 조회</th>
            <th className="px-4 py-3 text-right">전체 조회</th>
            <th className="px-4 py-3 text-right">평균 시청(분)</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr
              key={item.sport}
              className={`border-b border-gray-100 transition-colors hover:bg-gray-50 ${idx % 2 === 1 ? "bg-gray-50/50" : ""}`}
            >
              <td className="px-4 py-3 font-medium text-gray-900">{item.sport}</td>
              <td className="px-4 py-3 text-right">{item.liveViews.toLocaleString()}</td>
              <td className="px-4 py-3 text-right">{item.vodViews.toLocaleString()}</td>
              <td className="px-4 py-3 text-right font-medium">{item.totalViews.toLocaleString()}</td>
              <td className="px-4 py-3 text-right text-gray-600">{item.avgWatchMin}분</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-gray-200 bg-gray-50 font-medium">
            <td className="px-4 py-3">합계</td>
            <td className="px-4 py-3 text-right">{items.reduce((s, i) => s + i.liveViews, 0).toLocaleString()}</td>
            <td className="px-4 py-3 text-right">{items.reduce((s, i) => s + i.vodViews, 0).toLocaleString()}</td>
            <td className="px-4 py-3 text-right">{items.reduce((s, i) => s + i.totalViews, 0).toLocaleString()}</td>
            <td className="px-4 py-3 text-right text-gray-600">
              {Math.round(items.reduce((s, i) => s + i.avgWatchMin, 0) / (items.length || 1))}분
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

// ── Content Table ──────────────────────────────────────────────────

function ContentTable({ items }: { items: ViewContentItem[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50 text-xs font-medium uppercase tracking-wider text-gray-500">
            <th className="px-4 py-3 text-center w-[60px]">NO</th>
            <th className="px-4 py-3">경기명</th>
            <th className="px-4 py-3">종목</th>
            <th className="px-4 py-3 text-center">날짜</th>
            <th className="px-4 py-3 text-right">조회수</th>
            <th className="px-4 py-3 text-right">시청시간</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr
              key={item.id}
              className={`border-b border-gray-100 transition-colors hover:bg-gray-50 ${idx % 2 === 1 ? "bg-gray-50/50" : ""}`}
            >
              <td className="px-4 py-3 text-center text-gray-500">{idx + 1}</td>
              <td className="px-4 py-3 font-medium text-gray-900">{item.title}</td>
              <td className="px-4 py-3 text-gray-600">{item.sport}</td>
              <td className="px-4 py-3 text-center text-gray-500">{item.date}</td>
              <td className="px-4 py-3 text-right font-medium">{item.views.toLocaleString()}</td>
              <td className="px-4 py-3 text-right text-gray-600">{item.watchTime}</td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                데이터가 없습니다.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

// ── Content Cards ──────────────────────────────────────────────────

function ContentCards({ items }: { items: ViewContentItem[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <Card key={item.id}>
          <CardContent className="p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                {item.sport}
              </span>
              <span className="text-xs text-gray-400">{item.date}</span>
            </div>
            <h3 className="mb-3 text-sm font-semibold text-gray-900">{item.title}</h3>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">
                조회 <span className="font-medium text-gray-900">{item.views.toLocaleString()}</span>
              </span>
              <span className="text-gray-500">
                시청 <span className="font-medium text-gray-900">{item.watchTime}</span>
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
      {items.length === 0 && (
        <div className="col-span-full py-12 text-center text-gray-400">
          데이터가 없습니다.
        </div>
      )}
    </div>
  );
}

// ── Content View with Toggle ───────────────────────────────────────

function ContentView({ items }: { items: ViewContentItem[] }) {
  const [viewMode, setViewMode] = useState<"list" | "card">("list");

  return (
    <div className="space-y-4 pt-4">
      <div className="flex items-center justify-end gap-1">
        <Button
          size="sm"
          variant={viewMode === "list" ? "default" : "outline"}
          onClick={() => setViewMode("list")}
        >
          <LayoutList size={14} className="mr-1" />
          목록
        </Button>
        <Button
          size="sm"
          variant={viewMode === "card" ? "default" : "outline"}
          onClick={() => setViewMode("card")}
        >
          <LayoutGrid size={14} className="mr-1" />
          카드
        </Button>
      </div>
      {viewMode === "list" ? (
        <ContentTable items={items} />
      ) : (
        <ContentCards items={items} />
      )}
    </div>
  );
}

// ── Page ────────────────────────────────────────────────────────────

export default function ViewStatisticsPage() {
  const [data, setData] = useState<ViewStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange>({
    from: undefined,
    to: undefined,
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const apiParams: Record<string, string> = {};
      if (dateRange.from) apiParams.dateFrom = dateRange.from.toISOString();
      if (dateRange.to) apiParams.dateTo = dateRange.to.toISOString();

      const apiResult = await adminApi.get<ViewStatistics>(
        "/admin/api/v1/statistics/views",
        apiParams
      );
      if (apiResult) {
        setData(apiResult);
      }
    } catch {
      /* API error - data remains in initial empty state */
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleExport = () => {
    if (!data) return;

    const headers = ["유형", "경기명", "종목", "날짜", "조회수", "시청시간"];
    const rows: string[][] = [];

    data.liveContent.forEach((item) =>
      rows.push(["LIVE", item.title, item.sport, item.date, String(item.views), item.watchTime])
    );
    data.vodContent.forEach((item) =>
      rows.push(["VOD", item.title, item.sport, item.date, String(item.views), item.watchTime])
    );

    exportToCsv("시청통계", headers, rows);
  };

  if (loading || !data) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-400">
        로딩 중...
      </div>
    );
  }

  const kpis = [
    { ...data.kpi.totalViews, icon: KPI_ICONS[0] },
    { ...data.kpi.avgDuration, icon: KPI_ICONS[1] },
    { ...data.kpi.peakConcurrent, icon: KPI_ICONS[2] },
    { ...data.kpi.topContent, icon: KPI_ICONS[3] },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">시청 통계</h1>
        <Button variant="outline" onClick={handleExport}>
          <Download size={16} className="mr-1.5" />
          내보내기
        </Button>
      </div>

      {/* Date Filter */}
      <div className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-4">
        <span className="text-sm font-medium text-gray-700">기간별 조회</span>
        <DateRangePicker value={dateRange} onChange={setDateRange} />
        <Button size="sm" onClick={fetchData}>
          조회
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <KpiCard
            key={k.label}
            label={k.label}
            value={k.value}
            unit={k.unit}
            change={k.change}
            icon={k.icon}
          />
        ))}
      </div>

      {/* Daily Views Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">일별 조회수 추이</CardTitle>
        </CardHeader>
        <CardContent>
          <DailyViewsChart data={data.dailyViews} />
        </CardContent>
      </Card>

      {/* Content Breakdown by Sport */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">종목별 시청 분석</CardTitle>
        </CardHeader>
        <CardContent>
          <ContentBreakdownTable items={data.contentBreakdown} />
        </CardContent>
      </Card>

      {/* Tabs: LIVE / VOD */}
      <Card>
        <CardContent className="pt-6">
          <Tabs defaultValue="live">
            <TabsList>
              <TabsTrigger value="live">LIVE</TabsTrigger>
              <TabsTrigger value="vod">VOD</TabsTrigger>
            </TabsList>

            <TabsContent value="live">
              <ContentView items={data.liveContent} />
            </TabsContent>

            <TabsContent value="vod">
              <ContentView items={data.vodContent} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
