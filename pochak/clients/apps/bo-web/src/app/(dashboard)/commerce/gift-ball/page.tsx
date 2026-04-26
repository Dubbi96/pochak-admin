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
import { getGiftBallList } from "@/services/commerce-admin-api";
import type { GiftBall } from "@/services/commerce-admin-api";

// ── Types ──────────────────────────────────────────────────────────

type GiftBallStatus = "ALL" | "INACTIVE" | "ACTIVE" | "PENDING" | "STOPPED" | "ENDED";
type GiftBallProduct = "ALL" | "100" | "200" | "500" | "1000";

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
      const result = await getGiftBallList(
        {
          dateFrom: dateRangeMode === "RANGE" && dateRange.from ? dateRange.from.toISOString().slice(0, 10) : undefined,
          dateTo: dateRangeMode === "RANGE" && dateRange.to ? dateRange.to.toISOString().slice(0, 10) : undefined,
          status: status !== "ALL" ? status : undefined,
          product: product !== "ALL" ? PRODUCT_LABELS[product] : undefined,
          searchName: searchName || undefined,
        },
        page
      );
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
