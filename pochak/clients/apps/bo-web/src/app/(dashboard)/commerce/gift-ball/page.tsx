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
import { Search, Plus } from "lucide-react";
import { StatusBadge } from "@/components/common/status-badge";
import type { PageResponse } from "@/types/common";

// ── Types ──────────────────────────────────────────────────────────

type GiftBallStatus = "ALL" | "INACTIVE" | "ACTIVE" | "PENDING" | "STOPPED" | "ENDED";
type GiftBallProduct = "ALL" | "100" | "200" | "500" | "1000";

interface GiftBall {
  id: number;
  name: string;
  dateFrom: string;
  dateTo: string;
  product: string;
  issuedCount: number;
  status: "INACTIVE" | "ACTIVE" | "PENDING" | "STOPPED" | "ENDED";
  usagePercent: number;
}

const STATUS_LABELS: Record<string, string> = {
  ALL: "전체",
  INACTIVE: "비활성화",
  ACTIVE: "활성",
  PENDING: "대기",
  STOPPED: "중단",
  ENDED: "종료",
};

const STATUS_BADGE_MAP: Record<string, string> = {
  INACTIVE: "비활성화",
  ACTIVE: "활성",
  PENDING: "대기",
  STOPPED: "중단",
  ENDED: "종료",
};

const PRODUCT_LABELS: Record<string, string> = {
  ALL: "전체",
  "100": "100뽈",
  "200": "200뽈",
  "500": "500뽈",
  "1000": "1,000뽈",
};

// ── Mock Data ──────────────────────────────────────────────────────

const MOCK_GIFT_BALLS: GiftBall[] = [
  { id: 1, name: "신규 가입 환영 기프티뽈", dateFrom: "2026-01-01", dateTo: "2026-06-30", product: "100뽈", issuedCount: 500, status: "ACTIVE", usagePercent: 62 },
  { id: 2, name: "봄맞이 이벤트 기프티뽈", dateFrom: "2026-03-01", dateTo: "2026-04-30", product: "200뽈", issuedCount: 300, status: "ACTIVE", usagePercent: 38 },
  { id: 3, name: "VIP 회원 감사 기프티뽈", dateFrom: "2026-02-01", dateTo: "2026-02-28", product: "500뽈", issuedCount: 100, status: "ENDED", usagePercent: 91 },
  { id: 4, name: "시즌 오프닝 기프티뽈", dateFrom: "2026-04-01", dateTo: "2026-05-31", product: "1,000뽈", issuedCount: 50, status: "PENDING", usagePercent: 0 },
  { id: 5, name: "제휴사 공동 프로모션", dateFrom: "2026-01-15", dateTo: "2026-03-15", product: "200뽈", issuedCount: 1000, status: "STOPPED", usagePercent: 45 },
  { id: 6, name: "테스트 기프티뽈", dateFrom: "2025-12-01", dateTo: "2025-12-31", product: "100뽈", issuedCount: 10, status: "INACTIVE", usagePercent: 0 },
];

// ── Mock API ───────────────────────────────────────────────────────

async function getGiftBalls(
  filters: { dateRange?: DateRange; status: GiftBallStatus; product: GiftBallProduct; searchName?: string },
  page = 0,
  size = 20
): Promise<PageResponse<GiftBall>> {
  await new Promise((r) => setTimeout(r, 300));
  let filtered = [...MOCK_GIFT_BALLS];

  if (filters.status !== "ALL") {
    filtered = filtered.filter((g) => g.status === filters.status);
  }
  if (filters.product !== "ALL") {
    const label = PRODUCT_LABELS[filters.product];
    filtered = filtered.filter((g) => g.product === label);
  }
  if (filters.searchName) {
    const kw = filters.searchName.toLowerCase();
    filtered = filtered.filter((g) => g.name.toLowerCase().includes(kw));
  }

  const start = page * size;
  const content = filtered.slice(start, start + size);
  return { content, totalElements: filtered.length, totalPages: Math.ceil(filtered.length / size), page, size };
}

// ── Component ──────────────────────────────────────────────────────

export default function GiftBallPage() {
  const [data, setData] = useState<PageResponse<GiftBall> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);

  // Filters
  const [dateRangeMode, setDateRangeMode] = useState<"ALL" | "RANGE">("ALL");
  const [dateRange, setDateRange] = useState<DateRange>({ from: undefined, to: undefined });
  const [status, setStatus] = useState<GiftBallStatus>("ALL");
  const [product, setProduct] = useState<GiftBallProduct>("ALL");
  const [searchName, setSearchName] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getGiftBalls({ dateRange: dateRangeMode === "RANGE" ? dateRange : undefined, status, product, searchName: searchName || undefined }, page);
      setData(result);
    } finally {
      setLoading(false);
    }
  }, [dateRangeMode, dateRange, status, product, searchName, page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSearch = () => { setPage(0); fetchData(); };
  const handleReset = () => {
    setDateRangeMode("ALL");
    setDateRange({ from: undefined, to: undefined });
    setStatus("ALL");
    setProduct("ALL");
    setSearchName("");
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">기프티뽈 관리</h1>
        <Button>
          <Plus size={16} className="mr-1.5" />
          등록
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-end gap-4 rounded-lg border border-gray-200 bg-white p-4">
        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">사용기간</Label>
          <div className="flex items-center gap-2">
            <Select value={dateRangeMode} onValueChange={(v) => setDateRangeMode(v as "ALL" | "RANGE")}>
              <SelectTrigger className="w-[110px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">전체</SelectItem>
                <SelectItem value="RANGE">특정기간</SelectItem>
              </SelectContent>
            </Select>
            {dateRangeMode === "RANGE" && (
              <DateRangePicker value={dateRange} onChange={setDateRange} />
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">상태</Label>
          <Select value={status} onValueChange={(v) => setStatus(v as GiftBallStatus)}>
            <SelectTrigger className="w-[130px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(["ALL", "INACTIVE", "ACTIVE", "PENDING", "STOPPED", "ENDED"] as GiftBallStatus[]).map((s) => (
                <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">상품</Label>
          <Select value={product} onValueChange={(v) => setProduct(v as GiftBallProduct)}>
            <SelectTrigger className="w-[130px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(["ALL", "100", "200", "500", "1000"] as GiftBallProduct[]).map((p) => (
                <SelectItem key={p} value={p}>{PRODUCT_LABELS[p]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">발급명</Label>
          <Input
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="발급명 검색"
            className="w-[200px]"
          />
        </div>

        <div className="flex items-end gap-2">
          <Button onClick={handleSearch}>
            <Search size={16} className="mr-1.5" />
            검색
          </Button>
          <Button variant="outline" onClick={handleReset}>
            초기화
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-xs font-medium uppercase tracking-wider text-gray-500">
              <th className="px-4 py-3 text-center w-[60px]">NO</th>
              <th className="px-4 py-3">발급명</th>
              <th className="px-4 py-3 text-center">사용기간</th>
              <th className="px-4 py-3 text-center">상품</th>
              <th className="px-4 py-3 text-right">발급수</th>
              <th className="px-4 py-3 text-center">상태</th>
              <th className="px-4 py-3 text-right">사용(%)</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                  로딩 중...
                </td>
              </tr>
            ) : !data || data.content.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                  데이터가 없습니다.
                </td>
              </tr>
            ) : (
              data.content.map((item, idx) => (
                <tr
                  key={item.id}
                  className={`border-b border-gray-100 transition-colors hover:bg-gray-50 ${idx % 2 === 1 ? "bg-gray-50/50" : ""}`}
                >
                  <td className="px-4 py-3 text-center text-gray-500">
                    {page * (data?.size ?? 20) + idx + 1}
                  </td>
                  <td className="px-4 py-3">
                    <button className="hover:underline font-medium text-left" style={{ color: "var(--c-primary)" }}>
                      {item.name}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-center text-gray-600 text-xs">
                    {item.dateFrom} ~ {item.dateTo}
                  </td>
                  <td className="px-4 py-3 text-center text-gray-700">{item.product}</td>
                  <td className="px-4 py-3 text-right font-medium tabular-nums text-gray-900">
                    {item.issuedCount.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <StatusBadge status={STATUS_BADGE_MAP[item.status] ?? item.status} />
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    <span className={item.usagePercent >= 80 ? "text-emerald-600 font-medium" : "text-gray-600"}>
                      {item.usagePercent}%
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)}>
            이전
          </Button>
          <span className="text-sm text-gray-600">{page + 1} / {data.totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= data.totalPages - 1} onClick={() => setPage(page + 1)}>
            다음
          </Button>
        </div>
      )}
    </div>
  );
}
