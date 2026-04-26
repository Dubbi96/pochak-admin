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
import { Search } from "lucide-react";
import {
  getReports,
  REPORT_STATUS_LABELS,
  REPORT_CATEGORY_LABELS,
  type ReportStatus,
  type ReportCategory,
  type ReportFilter,
} from "@/services/support-api";
import type { PageResponse } from "@/types/common";
import type { Report } from "@/services/support-api";

// ── Status badge variants ────────────────────────────────────────────

const REPORT_STATUS_VARIANTS: Record<ReportStatus, "warning" | "success" | "secondary" | "default"> = {
  PENDING: "warning",
  REVIEWING: "default",
  RESOLVED: "success",
  DISMISSED: "secondary",
};

// ── Page Component ───────────────────────────────────────────────────

export default function CommunityReportsPage() {
  const [data, setData] = useState<PageResponse<Report> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);

  // Filters
  const [statusFilter, setStatusFilter] = useState<ReportStatus | "ALL">("ALL");
  const [categoryFilter, setCategoryFilter] = useState<ReportCategory | "ALL">("ALL");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [pendingKeyword, setPendingKeyword] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const filters: ReportFilter = {
        status: statusFilter !== "ALL" ? statusFilter : null,
        category: categoryFilter !== "ALL" ? categoryFilter : null,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        searchKeyword: searchKeyword || undefined,
      };
      const result = await getReports(filters, page);
      setData(result);
    } catch (err) {
      console.error("[Reports] fetch error", err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, categoryFilter, dateFrom, dateTo, searchKeyword, page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSearch = () => {
    setSearchKeyword(pendingKeyword);
    setPage(0);
  };

  const handleReset = () => {
    setStatusFilter("ALL");
    setCategoryFilter("ALL");
    setDateFrom("");
    setDateTo("");
    setSearchKeyword("");
    setPendingKeyword("");
    setPage(0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">커뮤니티 신고 관리</h1>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-end gap-4 rounded-lg border border-gray-200 bg-white p-4">
        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">상태</Label>
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v as ReportStatus | "ALL"); setPage(0); }}>
            <SelectTrigger className="w-[130px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">전체</SelectItem>
              {(Object.keys(REPORT_STATUS_LABELS) as ReportStatus[]).map((s) => (
                <SelectItem key={s} value={s}>{REPORT_STATUS_LABELS[s]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">신고유형</Label>
          <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v as ReportCategory | "ALL"); setPage(0); }}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">전체</SelectItem>
              {(Object.keys(REPORT_CATEGORY_LABELS) as ReportCategory[]).map((c) => (
                <SelectItem key={c} value={c}>{REPORT_CATEGORY_LABELS[c]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">접수일 (기간)</Label>
          <div className="flex items-center gap-2">
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-[140px]"
            />
            <span className="text-gray-400">~</span>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-[140px]"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">신고자 검색</Label>
          <Input
            value={pendingKeyword}
            onChange={(e) => setPendingKeyword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="신고자 이름 검색"
            className="w-[180px]"
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
              <th className="px-4 py-3">신고유형</th>
              <th className="px-4 py-3">대상</th>
              <th className="px-4 py-3">신고자</th>
              <th className="px-4 py-3">접수일</th>
              <th className="px-4 py-3">처리일</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-gray-400">로딩 중...</td>
              </tr>
            ) : !data || data.content.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-gray-400">데이터가 없습니다.</td>
              </tr>
            ) : (
              data.content.map((report, idx) => (
                <tr
                  key={report.id}
                  className={`border-b border-gray-100 transition-colors hover:bg-gray-50 ${idx % 2 === 1 ? "bg-gray-50/50" : ""}`}
                >
                  <td className="px-4 py-3 text-center text-gray-500">
                    {page * (data?.size ?? 20) + idx + 1}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant={REPORT_STATUS_VARIANTS[report.status]}>
                      {REPORT_STATUS_LABELS[report.status]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {REPORT_CATEGORY_LABELS[report.category]}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    <span className="text-xs text-gray-400 mr-1">[{report.targetType}]</span>
                    {report.targetName}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{report.reporterUsername}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {report.createdAt ? report.createdAt.slice(0, 10) : "-"}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {report.resolvedAt ? report.resolvedAt.slice(0, 10) : "-"}
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
