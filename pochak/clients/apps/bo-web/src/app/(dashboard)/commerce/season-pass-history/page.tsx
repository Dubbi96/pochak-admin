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

// ── Types ──────────────────────────────────────────────────────────

type TabType = "STATS" | "HISTORY";
type PeriodPreset = "TODAY" | "THIS_WEEK" | "THIS_MONTH" | "LAST_MONTH" | "3_MONTHS" | "6_MONTHS" | "ALL";
type ProductType = "ALL" | "TERM" | "SUBSCRIPTION";
type HistoryStatus = "ACTIVE" | "EXPIRED" | "CANCELLED" | "REFUNDED";

interface SeasonPassStats {
  totalCount: number;
  activeCount: number;
  expiredCount: number;
  cancelledRefundedCount: number;
  subscriptionActiveCount: number;
  totalRevenue: number;
  refundAmount: number;
  netRevenue: number;
  pgPayment: number;
  googlePlay: number;
  appStore: number;
}

interface DailyRevenue {
  date: string;
  newPurchases: number;
  renewals: number;
  cancellations: number;
  revenue: number;
  refunds: number;
  netRevenue: number;
}

interface SeasonPassHistoryItem {
  id: number;
  userName: string;
  userEmail: string;
  passName: string;
  productType: string;
  platform: string;
  status: HistoryStatus;
  amount: number;
  purchasedAt: string;
  expiresAt: string;
}

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

// ── Mock Data ──────────────────────────────────────────────────────

const MOCK_STATS: SeasonPassStats = {
  totalCount: 2847,
  activeCount: 1523,
  expiredCount: 891,
  cancelledRefundedCount: 433,
  subscriptionActiveCount: 672,
  totalRevenue: 142350000,
  refundAmount: 8720000,
  netRevenue: 133630000,
  pgPayment: 89500000,
  googlePlay: 31200000,
  appStore: 21650000,
};

const MOCK_DAILY_REVENUE: DailyRevenue[] = [
  { date: "2026-03-25", newPurchases: 42, renewals: 18, cancellations: 3, revenue: 3150000, refunds: 120000, netRevenue: 3030000 },
  { date: "2026-03-24", newPurchases: 38, renewals: 22, cancellations: 5, revenue: 2890000, refunds: 250000, netRevenue: 2640000 },
  { date: "2026-03-23", newPurchases: 55, renewals: 15, cancellations: 2, revenue: 4200000, refunds: 80000, netRevenue: 4120000 },
  { date: "2026-03-22", newPurchases: 31, renewals: 20, cancellations: 4, revenue: 2550000, refunds: 310000, netRevenue: 2240000 },
  { date: "2026-03-21", newPurchases: 47, renewals: 25, cancellations: 1, revenue: 3680000, refunds: 50000, netRevenue: 3630000 },
  { date: "2026-03-20", newPurchases: 29, renewals: 12, cancellations: 6, revenue: 2100000, refunds: 420000, netRevenue: 1680000 },
  { date: "2026-03-19", newPurchases: 60, renewals: 30, cancellations: 2, revenue: 5400000, refunds: 150000, netRevenue: 5250000 },
];

const MOCK_HISTORY: SeasonPassHistoryItem[] = [
  { id: 1, userName: "김민수", userEmail: "minsu@gmail.com", passName: "30일 시즌권", productType: "기간제", platform: "PG결제", status: "ACTIVE", amount: 10000, purchasedAt: "2026-03-15", expiresAt: "2026-04-14" },
  { id: 2, userName: "이수진", userEmail: "sujin@naver.com", passName: "월간 구독", productType: "정기구독", platform: "App Store", status: "ACTIVE", amount: 9900, purchasedAt: "2026-03-01", expiresAt: "2026-03-31" },
  { id: 3, userName: "박정호", userEmail: "jh.park@gmail.com", passName: "7일 시즌권", productType: "기간제", platform: "Google Play", status: "EXPIRED", amount: 3000, purchasedAt: "2026-03-10", expiresAt: "2026-03-17" },
  { id: 4, userName: "최예린", userEmail: "yerin@icloud.com", passName: "365일 시즌권", productType: "기간제", platform: "PG결제", status: "ACTIVE", amount: 50000, purchasedAt: "2026-01-10", expiresAt: "2027-01-09" },
  { id: 5, userName: "정태우", userEmail: "taewoo@kakao.com", passName: "월간 구독", productType: "정기구독", platform: "Google Play", status: "CANCELLED", amount: 9900, purchasedAt: "2026-02-15", expiresAt: "2026-03-14" },
  { id: 6, userName: "한지은", userEmail: "jieun@naver.com", passName: "30일 시즌권", productType: "기간제", platform: "App Store", status: "REFUNDED", amount: 10000, purchasedAt: "2026-03-05", expiresAt: "2026-04-04" },
  { id: 7, userName: "오성민", userEmail: "sungmin@gmail.com", passName: "월간 구독", productType: "정기구독", platform: "PG결제", status: "ACTIVE", amount: 9900, purchasedAt: "2026-03-20", expiresAt: "2026-04-19" },
  { id: 8, userName: "윤서현", userEmail: "seohyun@gmail.com", passName: "3일 시즌권", productType: "기간제", platform: "Google Play", status: "EXPIRED", amount: 1500, purchasedAt: "2026-03-21", expiresAt: "2026-03-24" },
];

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

// ── Mock API ───────────────────────────────────────────────────────

async function getSeasonPassHistory(
  _filters: Record<string, unknown>,
  page = 0,
  size = 20
): Promise<PageResponse<SeasonPassHistoryItem>> {
  await new Promise((r) => setTimeout(r, 300));
  const start = page * size;
  const content = MOCK_HISTORY.slice(start, start + size);
  return { content, totalElements: MOCK_HISTORY.length, totalPages: Math.ceil(MOCK_HISTORY.length / size), page, size };
}

// ── Component ──────────────────────────────────────────────────────

function KpiCard({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`text-xl font-bold ${color ?? "text-gray-900"}`}>{value}</p>
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

  // History state
  const [historyData, setHistoryData] = useState<PageResponse<SeasonPassHistoryItem> | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyPage, setHistoryPage] = useState(0);
  const [historyDateRange, setHistoryDateRange] = useState<DateRange>({ from: undefined, to: undefined });
  const [historySearch, setHistorySearch] = useState("");

  const stats = MOCK_STATS;

  const fetchHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const result = await getSeasonPassHistory({}, historyPage);
      setHistoryData(result);
    } finally {
      setHistoryLoading(false);
    }
  }, [historyPage]);

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
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
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

            <Button onClick={() => {}}>
              <Search size={16} className="mr-1.5" />
              검색
            </Button>
          </div>

          {/* KPI Cards - Group 1: Counts */}
          <div className="grid grid-cols-5 gap-4">
            <KpiCard label="전체 건수" value={`${stats.totalCount.toLocaleString()}건`} />
            <KpiCard label="이용중" value={`${stats.activeCount.toLocaleString()}건`} color="text-blue-600" />
            <KpiCard label="만료" value={`${stats.expiredCount.toLocaleString()}건`} color="text-gray-500" />
            <KpiCard label="취소/환불" value={`${stats.cancelledRefundedCount.toLocaleString()}건`} color="text-red-500" />
            <KpiCard label="구독 활성" value={`${stats.subscriptionActiveCount.toLocaleString()}건`} color="text-emerald-600" />
          </div>

          {/* KPI Cards - Group 2: Revenue */}
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <p className="text-xs text-gray-500">총 매출</p>
              <p className="text-xl font-bold text-gray-900">{stats.totalRevenue.toLocaleString()}원</p>
            </div>
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="text-xs text-red-600">환불 금액</p>
              <p className="text-xl font-bold text-red-700">-{stats.refundAmount.toLocaleString()}원</p>
            </div>
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-xs text-emerald-600">순 매출</p>
              <p className="text-xl font-bold text-emerald-700">{stats.netRevenue.toLocaleString()}원</p>
            </div>
          </div>

          {/* KPI Cards - Group 3: Platforms */}
          <div className="grid grid-cols-3 gap-4">
            <KpiCard label="PG 결제" value={`${stats.pgPayment.toLocaleString()}원`} sub={`${((stats.pgPayment / stats.totalRevenue) * 100).toFixed(1)}%`} />
            <KpiCard label="Google Play" value={`${stats.googlePlay.toLocaleString()}원`} sub={`${((stats.googlePlay / stats.totalRevenue) * 100).toFixed(1)}%`} />
            <KpiCard label="App Store" value={`${stats.appStore.toLocaleString()}원`} sub={`${((stats.appStore / stats.totalRevenue) * 100).toFixed(1)}%`} />
          </div>

          {/* Daily Revenue Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-700">일별 매출 현황</h2>
              <ExportButton
                data={MOCK_DAILY_REVENUE as unknown as Record<string, unknown>[]}
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
                  {MOCK_DAILY_REVENUE.map((row, idx) => (
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
