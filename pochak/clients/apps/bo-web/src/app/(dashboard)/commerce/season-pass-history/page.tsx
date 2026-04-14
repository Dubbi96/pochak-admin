"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DateRangePicker,
  type DateRange,
} from "@/components/filter/date-range-picker";
import { Search, Download } from "lucide-react";
import { StatusBadge } from "@/components/common/status-badge";
import { ExportButton } from "@/components/common/export-button";
import type { PageResponse } from "@/types/common";
import {
  getSeasonPassHistoryStats,
  getSeasonPassDailyRevenue,
  getSeasonPassHistoryList,
} from "@/services/commerce-admin-api";
import type {
  SeasonPassHistoryStats,
  SeasonPassDailyRevenue,
  SeasonPassHistoryItem,
} from "@/services/commerce-admin-api";

// ── Types ──────────────────────────────────────────────────────────

type TabType = "STATS" | "HISTORY";
type PeriodPreset = "TODAY" | "THIS_WEEK" | "THIS_MONTH" | "LAST_MONTH" | "3_MONTHS" | "6_MONTHS" | "ALL";
type ProductType = "ALL" | "TERM" | "SUBSCRIPTION";
type HistoryStatus = "ACTIVE" | "EXPIRED" | "CANCELLED" | "REFUNDED";

const PERIOD_LABELS: Record<PeriodPreset, string> = {
  TODAY: "오늘",
  THIS_WEEK: "이번주",
  THIS_MONTH: "이번달",
  LAST_MONTH: "지난달",
  "3_MONTHS": "3개월",
  "6_MONTHS": "6개월",
  ALL: "전체",
};

const STATUS_BADGE_MAP: Record<HistoryStatus, string> = {
  ACTIVE: "이용중",
  EXPIRED: "만료",
  CANCELLED: "취소",
  REFUNDED: "환불",
};

const HISTORY_EXPORT_COLUMNS = [
  { header: "NO", accessor: "id" },
  { header: "이름", accessor: "userName" },
  { header: "이메일", accessor: "userEmail" },
  { header: "시즌권", accessor: "passName" },
  { header: "상품유형", accessor: "productType" },
  { header: "결제플랫폼", accessor: "platform" },
  { header: "상태", accessor: "status" },
  { header: "금액", accessor: "amount" },
  { header: "구매일", accessor: "purchasedAt" },
  { header: "만료일", accessor: "expiresAt" },
];

// ── Component ──────────────────────────────────────────────────────

function KpiCard({ label, value, sub, color, colorStyle }: { label: string; value: string; sub?: string; color?: string; colorStyle?: React.CSSProperties }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`text-xl font-bold ${color ?? "text-gray-900"}`} style={colorStyle}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

export default function SeasonPassHistoryPage() {
  const [tab, setTab] = useState<TabType>("STATS");

  // Stats filters
  const [period, setPeriod] = useState<PeriodPreset>("ALL");
  const [platform, setPlatform] = useState("ALL");
  const [productType, setProductType] = useState<ProductType>("ALL");
  const [seasonPass, setSeasonPass] = useState("ALL");

  // Stats data
  const [stats, setStats] = useState<SeasonPassHistoryStats | null>(null);
  const [dailyRevenue, setDailyRevenue] = useState<SeasonPassDailyRevenue[]>([]);
  const [statsLoading, setStatsLoading] = useState(false);

  // History state
  const [historyData, setHistoryData] = useState<PageResponse<SeasonPassHistoryItem> | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyPage, setHistoryPage] = useState(0);
  const [historyDateRange, setHistoryDateRange] = useState<DateRange>({ from: undefined, to: undefined });
  const [historySearch, setHistorySearch] = useState("");

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const [statsResult, dailyResult] = await Promise.all([
        getSeasonPassHistoryStats({ period, platform, productType, seasonPass }),
        getSeasonPassDailyRevenue({ period, platform }),
      ]);
      setStats(statsResult);
      setDailyRevenue(dailyResult);
    } finally {
      setStatsLoading(false);
    }
  }, [period, platform, productType, seasonPass]);

  const fetchHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const result = await getSeasonPassHistoryList(
        {
          dateFrom: historyDateRange.from?.toISOString().slice(0, 10),
          dateTo: historyDateRange.to?.toISOString().slice(0, 10),
          searchKeyword: historySearch || undefined,
        },
        historyPage
      );
      setHistoryData(result);
    } finally {
      setHistoryLoading(false);
    }
  }, [historyPage, historyDateRange, historySearch]);

  useEffect(() => {
    if (tab === "STATS") fetchStats();
  }, [tab, fetchStats]);

  useEffect(() => {
    if (tab === "HISTORY") fetchHistory();
  }, [tab, fetchHistory]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">시즌권 사용내역</h1>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-gray-200">
        {([["STATS", "통계"], ["HISTORY", "사용내역"]] as [TabType, string][]).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === key
                ? ""
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
            style={tab === key ? { borderBottomColor: "var(--c-primary)", color: "var(--c-primary)" } : undefined}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ─── 통계 Tab ─── */}
      {tab === "STATS" && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="flex flex-wrap items-end gap-4 rounded-lg border border-gray-200 bg-white p-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-gray-500">기간</Label>
              <Select value={period} onValueChange={(v) => setPeriod(v as PeriodPreset)}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.entries(PERIOD_LABELS) as [PeriodPreset, string][]).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-gray-500">결제플랫폼</Label>
              <Select value={platform} onValueChange={setPlatform}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">전체</SelectItem>
                  <SelectItem value="PG">PG 결제</SelectItem>
                  <SelectItem value="GOOGLE">Google Play</SelectItem>
                  <SelectItem value="APPLE">App Store</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-gray-500">상품유형</Label>
              <Select value={productType} onValueChange={(v) => setProductType(v as ProductType)}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">전체</SelectItem>
                  <SelectItem value="TERM">기간제</SelectItem>
                  <SelectItem value="SUBSCRIPTION">정기구독</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-gray-500">시즌권</Label>
              <Select value={seasonPass} onValueChange={setSeasonPass}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">전체</SelectItem>
                  <SelectItem value="3DAY">3일 시즌권</SelectItem>
                  <SelectItem value="7DAY">7일 시즌권</SelectItem>
                  <SelectItem value="30DAY">30일 시즌권</SelectItem>
                  <SelectItem value="365DAY">365일 시즌권</SelectItem>
                  <SelectItem value="MONTHLY">월간 구독</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={fetchStats}>
              <Search size={16} className="mr-1.5" />
              검색
            </Button>
          </div>

          {statsLoading ? (
            <p className="text-sm text-gray-400 py-8 text-center">로딩 중...</p>
          ) : (
            <>
              {/* KPI Cards - Group 1: Counts */}
              <div className="grid grid-cols-5 gap-4">
                <KpiCard label="전체 건수" value={stats ? `${stats.totalCount.toLocaleString()}건` : "-"} />
                <KpiCard label="이용중" value={stats ? `${stats.activeCount.toLocaleString()}건` : "-"} colorStyle={{ color: "var(--c-primary)" }} />
                <KpiCard label="만료" value={stats ? `${stats.expiredCount.toLocaleString()}건` : "-"} color="text-gray-500" />
                <KpiCard label="취소/환불" value={stats ? `${stats.cancelledRefundedCount.toLocaleString()}건` : "-"} color="text-red-500" />
                <KpiCard label="구독 활성" value={stats ? `${stats.subscriptionActiveCount.toLocaleString()}건` : "-"} color="text-emerald-600" />
              </div>

              {/* KPI Cards - Group 2: Revenue */}
              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-lg border border-gray-200 bg-white p-4">
                  <p className="text-xs text-gray-500">총 매출</p>
                  <p className="text-xl font-bold text-gray-900">{stats ? stats.totalRevenue.toLocaleString() : "-"}원</p>
                </div>
                <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                  <p className="text-xs text-red-600">환불 금액</p>
                  <p className="text-xl font-bold text-red-700">{stats ? `-${stats.refundAmount.toLocaleString()}` : "-"}원</p>
                </div>
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                  <p className="text-xs text-emerald-600">순 매출</p>
                  <p className="text-xl font-bold text-emerald-700">{stats ? stats.netRevenue.toLocaleString() : "-"}원</p>
                </div>
              </div>

              {/* KPI Cards - Group 3: Platforms */}
              <div className="grid grid-cols-3 gap-4">
                <KpiCard label="PG 결제" value={stats ? `${stats.pgPayment.toLocaleString()}원` : "-"} sub={stats && stats.totalRevenue ? `${((stats.pgPayment / stats.totalRevenue) * 100).toFixed(1)}%` : undefined} />
                <KpiCard label="Google Play" value={stats ? `${stats.googlePlay.toLocaleString()}원` : "-"} sub={stats && stats.totalRevenue ? `${((stats.googlePlay / stats.totalRevenue) * 100).toFixed(1)}%` : undefined} />
                <KpiCard label="App Store" value={stats ? `${stats.appStore.toLocaleString()}원` : "-"} sub={stats && stats.totalRevenue ? `${((stats.appStore / stats.totalRevenue) * 100).toFixed(1)}%` : undefined} />
              </div>

              {/* Daily Revenue Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-gray-700">일별 매출 현황</h2>
                  <ExportButton
                    data={dailyRevenue as unknown as Record<string, unknown>[]}
                    columns={[
                      { header: "날짜", accessor: "date" },
                      { header: "신규 구매", accessor: "newPurchases" },
                      { header: "갱신", accessor: "renewals" },
                      { header: "취소", accessor: "cancellations" },
                      { header: "매출", accessor: "revenue" },
                      { header: "환불", accessor: "refunds" },
                      { header: "순 매출", accessor: "netRevenue" },
                    ]}
                    filename="season-pass-daily-revenue"
                    label="Export"
                  />
                </div>
                <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50 text-xs font-medium uppercase tracking-wider text-gray-500">
                        <th className="px-4 py-3 text-center">날짜</th>
                        <th className="px-4 py-3 text-right">신규 구매</th>
                        <th className="px-4 py-3 text-right">갱신</th>
                        <th className="px-4 py-3 text-right">취소</th>
                        <th className="px-4 py-3 text-right">매출</th>
                        <th className="px-4 py-3 text-right">환불</th>
                        <th className="px-4 py-3 text-right">순 매출</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dailyRevenue.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-4 py-8 text-center text-gray-400">데이터가 없습니다.</td>
                        </tr>
                      ) : dailyRevenue.map((row, idx) => (
                        <tr key={row.date} className={`border-b border-gray-100 transition-colors hover:bg-gray-50 ${idx % 2 === 1 ? "bg-gray-50/50" : ""}`}>
                          <td className="px-4 py-3 text-center text-gray-600">{row.date}</td>
                          <td className="px-4 py-3 text-right tabular-nums text-gray-900">{row.newPurchases}</td>
                          <td className="px-4 py-3 text-right tabular-nums text-gray-600">{row.renewals}</td>
                          <td className="px-4 py-3 text-right tabular-nums text-red-500">{row.cancellations}</td>
                          <td className="px-4 py-3 text-right tabular-nums font-medium text-gray-900">{row.revenue.toLocaleString()}원</td>
                          <td className="px-4 py-3 text-right tabular-nums text-red-500">-{row.refunds.toLocaleString()}원</td>
                          <td className="px-4 py-3 text-right tabular-nums font-medium text-emerald-600">{row.netRevenue.toLocaleString()}원</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ─── 사용내역 Tab ─── */}
      {tab === "HISTORY" && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="flex flex-wrap items-end gap-4 rounded-lg border border-gray-200 bg-white p-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-gray-500">기간</Label>
              <DateRangePicker value={historyDateRange} onChange={setHistoryDateRange} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-gray-500">검색</Label>
              <Input
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchHistory()}
                placeholder="이름 또는 이메일"
                className="w-[200px]"
              />
            </div>
            <Button onClick={fetchHistory}>
              <Search size={16} className="mr-1.5" />
              검색
            </Button>
            <div className="ml-auto">
              <ExportButton
                data={(historyData?.content ?? []) as unknown as Record<string, unknown>[]}
                columns={HISTORY_EXPORT_COLUMNS}
                filename="season-pass-history"
                label="Export"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-xs font-medium uppercase tracking-wider text-gray-500">
                  <th className="px-4 py-3 text-center w-[60px]">NO</th>
                  <th className="px-4 py-3">이름</th>
                  <th className="px-4 py-3">이메일</th>
                  <th className="px-4 py-3">시즌권</th>
                  <th className="px-4 py-3 text-center">상품유형</th>
                  <th className="px-4 py-3 text-center">결제플랫폼</th>
                  <th className="px-4 py-3 text-center">상태</th>
                  <th className="px-4 py-3 text-right">금액</th>
                  <th className="px-4 py-3 text-center">구매일</th>
                  <th className="px-4 py-3 text-center">만료일</th>
                </tr>
              </thead>
              <tbody>
                {historyLoading ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-12 text-center text-gray-400">로딩 중...</td>
                  </tr>
                ) : !historyData || historyData.content.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-12 text-center text-gray-400">데이터가 없습니다.</td>
                  </tr>
                ) : (
                  historyData.content.map((item, idx) => (
                    <tr key={item.id} className={`border-b border-gray-100 transition-colors hover:bg-gray-50 ${idx % 2 === 1 ? "bg-gray-50/50" : ""}`}>
                      <td className="px-4 py-3 text-center text-gray-500">{historyPage * (historyData?.size ?? 20) + idx + 1}</td>
                      <td className="px-4 py-3 text-gray-900">{item.userName}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{item.userEmail}</td>
                      <td className="px-4 py-3 text-gray-700">{item.passName}</td>
                      <td className="px-4 py-3 text-center text-gray-600">{item.productType}</td>
                      <td className="px-4 py-3 text-center text-gray-600">{item.platform}</td>
                      <td className="px-4 py-3 text-center">
                        <StatusBadge status={STATUS_BADGE_MAP[item.status]} />
                      </td>
                      <td className="px-4 py-3 text-right font-medium tabular-nums text-gray-900">{item.amount.toLocaleString()}원</td>
                      <td className="px-4 py-3 text-center text-gray-500">{item.purchasedAt}</td>
                      <td className="px-4 py-3 text-center text-gray-500">{item.expiresAt}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {historyData && historyData.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button variant="outline" size="sm" disabled={historyPage === 0} onClick={() => setHistoryPage(historyPage - 1)}>
                이전
              </Button>
              <span className="text-sm text-gray-600">{historyPage + 1} / {historyData.totalPages}</span>
              <Button variant="outline" size="sm" disabled={historyPage >= historyData.totalPages - 1} onClick={() => setHistoryPage(historyPage + 1)}>
                다음
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
