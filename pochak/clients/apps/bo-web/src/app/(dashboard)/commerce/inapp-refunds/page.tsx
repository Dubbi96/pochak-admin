"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
import { Search } from "lucide-react";
import {
  getRefunds,
  REFUND_KIND_LABELS,
  REFUND_STATUS_LABELS,
  type RefundKind,
  type RefundStatus,
  type RefundFilter,
} from "@/services/commerce-admin-api";
import type { PageResponse } from "@/types/common";
import type { Refund } from "@/services/commerce-admin-api";

// ── Status badge variants ──────────────────────────────────────────

const REFUND_STATUS_VARIANTS: Record<string, "warning" | "success" | "secondary" | "default"> = {
  REQUESTED: "warning",
  COMPLETED: "success",
  REJECTED: "secondary",
};

const REFUND_KIND_VARIANTS: Record<string, "default" | "secondary"> = {
  BALL: "default",
  SEASON_PASS: "secondary",
};

// ── Component ──────────────────────────────────────────────────────

export default function InappRefundsPage() {
  const [data, setData] = useState<PageResponse<Refund> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);

  // Filters
  const [kind, setKind] = useState<RefundKind>("ALL");
  const [status, setStatus] = useState<RefundStatus>("ALL");
  const [dateRangeMode, setDateRangeMode] = useState<"ALL" | "RANGE">("ALL");
  const [dateRange, setDateRange] = useState<DateRange>({ from: undefined, to: undefined });
  const [pendingKeyword, setPendingKeyword] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const filters: RefundFilter = {
        category: "ALL",
        kind,
        status,
        searchKeyword: searchKeyword || undefined,
      };
      const result = await getRefunds(filters, page);
      setData(result);
    } catch (err) {
      console.error("[InappRefunds] fetch error", err);
    } finally {
      setLoading(false);
    }
  }, [kind, status, searchKeyword, page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSearch = () => {
    setSearchKeyword(pendingKeyword);
    setPage(0);
  };

  const handleReset = () => {
    setKind("ALL");
    setStatus("ALL");
    setDateRangeMode("ALL");
    setDateRange({ from: undefined, to: undefined });
    setPendingKeyword("");
    setSearchKeyword("");
    setPage(0);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">인앱 환불 관리</h1>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-end gap-4 rounded-lg border border-gray-200 bg-white p-4">
        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">구분</Label>
          <Select value={kind} onValueChange={(v) => { setKind(v as RefundKind); setPage(0); }}>
            <SelectTrigger className="w-[130px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(REFUND_KIND_LABELS) as RefundKind[]).map((k) => (
                <SelectItem key={k} value={k}>{REFUND_KIND_LABELS[k]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">상태</Label>
          <Select value={status} onValueChange={(v) => { setStatus(v as RefundStatus); setPage(0); }}>
            <SelectTrigger className="w-[130px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(REFUND_STATUS_LABELS) as RefundStatus[]).map((s) => (
                <SelectItem key={s} value={s}>{REFUND_STATUS_LABELS[s]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">기간</Label>
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
          <Label className="text-xs text-gray-500">접수자 검색</Label>
          <Input
            value={pendingKeyword}
            onChange={(e) => setPendingKeyword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="접수자 이름 검색"
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
              <th className="px-4 py-3 text-center">상태</th>
              <th className="px-4 py-3 text-center">구분</th>
              <th className="px-4 py-3 text-right">환불금액</th>
              <th className="px-4 py-3">접수자</th>
              <th className="px-4 py-3 text-center">접수일자</th>
              <th className="px-4 py-3">결제수단</th>
              <th className="px-4 py-3">거래ID</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-gray-400">로딩 중...</td>
              </tr>
            ) : !data || data.content.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-gray-400">데이터가 없습니다.</td>
              </tr>
            ) : (
              data.content.map((item, idx) => (
                <tr key={item.id} className={`border-b border-gray-100 transition-colors hover:bg-gray-50 ${idx % 2 === 1 ? "bg-gray-50/50" : ""}`}>
                  <td className="px-4 py-3 text-center text-gray-500">
                    {page * (data?.size ?? 20) + idx + 1}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant={REFUND_STATUS_VARIANTS[item.status]}>
                      {REFUND_STATUS_LABELS[item.status]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant={REFUND_KIND_VARIANTS[item.kind]}>
                      {REFUND_KIND_LABELS[item.kind]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right font-medium tabular-nums text-gray-900">
                    {item.wonAmount.toLocaleString()}원
                  </td>
                  <td className="px-4 py-3">
                    <button className="hover:underline font-medium" style={{ color: "var(--c-primary)" }}>
                      {item.requesterName}
                    </button>
                    <p className="text-xs text-gray-400">{item.requesterEmail}</p>
                  </td>
                  <td className="px-4 py-3 text-center text-gray-500">
                    {item.requestedAt ? item.requestedAt.slice(0, 10) : "-"}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{item.paymentMethod ?? "-"}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs font-mono">{item.originalTransactionId}</td>
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
