"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  DateRangePicker,
  type DateRange,
} from "@/components/filter/date-range-picker";
import { Download, Users, UserPlus, Activity, UserMinus, TrendingUp, TrendingDown } from "lucide-react";
import {
  exportToCsv,
  type UserStatistics,
  type ChartDataPoint,
  type MonthlyTrendRow,
} from "@/services/statistics-api";
import { adminApi } from "@/lib/api-client";

// ── CSS Bar Chart ──────────────────────────────────────────────────

function BarChart({
  data,
  color = "bg-emerald-500",
  colorStyle,
  height = 160,
}: {
  data: ChartDataPoint[];
  color?: string;
  colorStyle?: React.CSSProperties;
  height?: number;
}) {
  const maxValue = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="flex items-end gap-2" style={{ height }}>
      {data.map((d) => (
        <div key={d.label} className="flex flex-1 flex-col items-center gap-1">
          <span className="text-[10px] text-gray-500">
            {d.value.toLocaleString()}
          </span>
          <div
            className={`${colorStyle ? "" : color} w-full max-w-[48px] rounded-t transition-all`}
            style={{ height: `${(d.value / maxValue) * 100}%`, minHeight: 4, ...colorStyle }}
          />
          <span className="text-xs text-gray-600">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

// ── Pie Chart (CSS) ────────────────────────────────────────────────

const PIE_COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"];

function PieChart({ data }: { data: ChartDataPoint[] }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  let cumulative = 0;
  const segments = data.map((d, i) => {
    const start = cumulative;
    const pct = (d.value / total) * 100;
    cumulative += pct;
    return { ...d, start, pct, color: PIE_COLORS[i % PIE_COLORS.length] };
  });

  const gradientStops = segments
    .map((s) => `${s.color} ${s.start}% ${s.start + s.pct}%`)
    .join(", ");

  return (
    <div className="flex items-center gap-8">
      <div
        className="h-40 w-40 shrink-0 rounded-full"
        style={{ background: `conic-gradient(${gradientStops})` }}
      />
      <div className="space-y-2">
        {segments.map((s) => (
          <div key={s.label} className="flex items-center gap-2 text-sm">
            <div
              className="h-3 w-3 rounded-sm"
              style={{ backgroundColor: s.color }}
            />
            <span className="text-gray-700">{s.label}</span>
            <span className="font-medium text-gray-900">
              {s.value.toLocaleString()}명
            </span>
            <span className="text-gray-400">({s.pct.toFixed(1)}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── KPI Card ───────────────────────────────────────────────────────

const KPI_ICONS = [Users, UserPlus, Activity, UserMinus] as const;

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

// ── Monthly Trend Table ───────────────────────────────────────────

function MonthlyTrendTable({ rows }: { rows: MonthlyTrendRow[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50 text-xs font-medium uppercase tracking-wider text-gray-500">
            <th className="px-4 py-3">월</th>
            <th className="px-4 py-3 text-right">신규 가입</th>
            <th className="px-4 py-3 text-right">활성 사용자</th>
            <th className="px-4 py-3 text-right">이탈 사용자</th>
            <th className="px-4 py-3 text-right">리텐션</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, idx) => (
            <tr
              key={r.month}
              className={`border-b border-gray-100 transition-colors hover:bg-gray-50 ${idx % 2 === 1 ? "bg-gray-50/50" : ""}`}
            >
              <td className="px-4 py-3 font-medium text-gray-900">{r.month}</td>
              <td className="px-4 py-3 text-right">{r.newSignups.toLocaleString()}명</td>
              <td className="px-4 py-3 text-right">{r.activeUsers.toLocaleString()}명</td>
              <td className="px-4 py-3 text-right text-red-500">{r.churnUsers.toLocaleString()}명</td>
              <td className="px-4 py-3 text-right font-medium text-emerald-600">{r.retention}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Page ────────────────────────────────────────────────────────────

export default function UserStatisticsPage() {
  const [data, setData] = useState<UserStatistics | null>(null);
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

      const apiResult = await adminApi.get<UserStatistics>(
        "/admin/api/v1/statistics/users",
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

    const headers = ["구분", "항목", "값"];
    const rows: string[][] = [];

    // KPI
    const kpi = data.kpi;
    rows.push(["KPI", kpi.totalUsers.label, String(kpi.totalUsers.value)]);
    rows.push(["KPI", kpi.newSignups.label, String(kpi.newSignups.value)]);
    rows.push(["KPI", kpi.activeUsers.label, String(kpi.activeUsers.value)]);
    rows.push(["KPI", kpi.churnRate.label, String(kpi.churnRate.value)]);

    // Gender
    data.genderDistribution.forEach((d) =>
      rows.push(["성별", d.label, String(d.value)])
    );
    // Age
    data.ageDistribution.forEach((d) =>
      rows.push(["연령", d.label, String(d.value)])
    );
    // Type
    data.typeDistribution.forEach((d) =>
      rows.push(["유형", d.label, String(d.value)])
    );
    // Monthly Trend
    data.monthlyTrend.forEach((r) =>
      rows.push(["월별추이", r.month, `가입:${r.newSignups} 활성:${r.activeUsers} 이탈:${r.churnUsers}`])
    );

    exportToCsv("사용자통계", headers, rows);
  };

  if (loading || !data) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-400">
        로딩 중...
      </div>
    );
  }

  const kpis = [
    { ...data.kpi.totalUsers, icon: KPI_ICONS[0] },
    { ...data.kpi.newSignups, icon: KPI_ICONS[1] },
    { ...data.kpi.activeUsers, icon: KPI_ICONS[2] },
    { ...data.kpi.churnRate, icon: KPI_ICONS[3] },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">사용자 통계</h1>
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

      {/* Signup Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">신규 가입자 현황</CardTitle>
        </CardHeader>
        <CardContent>
          <BarChart data={data.signupTrend} color="bg-emerald-500" height={180} />
        </CardContent>
      </Card>

      {/* Monthly Trend Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">월별 추이</CardTitle>
        </CardHeader>
        <CardContent>
          <MonthlyTrendTable rows={data.monthlyTrend} />
        </CardContent>
      </Card>

      {/* Tabs: Gender / Age / Type */}
      <Card>
        <CardContent className="pt-6">
          <Tabs defaultValue="gender">
            <TabsList>
              <TabsTrigger value="gender">성별</TabsTrigger>
              <TabsTrigger value="age">연령</TabsTrigger>
              <TabsTrigger value="type">유형</TabsTrigger>
            </TabsList>

            <TabsContent value="gender">
              <div className="pt-4">
                <BarChart
                  data={data.genderDistribution}
                  colorStyle={{ backgroundColor: "var(--c-primary)" }}
                  height={160}
                />
              </div>
            </TabsContent>

            <TabsContent value="age">
              <div className="pt-4">
                <BarChart
                  data={data.ageDistribution}
                  color="bg-violet-500"
                  height={160}
                />
              </div>
            </TabsContent>

            <TabsContent value="type">
              <div className="pt-4">
                <PieChart data={data.typeDistribution} />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
