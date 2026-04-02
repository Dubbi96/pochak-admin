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
import { Search, Download } from "lucide-react";
import { ExportButton } from "@/components/common/export-button";
import type { PageResponse } from "@/types/common";
import {
  exportPointHistoryCsv,
  POINT_TYPE_LABELS,
  type PointHistory,
  type PointHistoryFilter,
  type PointType,
} from "@/services/commerce-admin-api";
import { adminApi } from "@/lib/api-client";

const TYPE_BADGE_VARIANT: Record<string, "success" | "destructive" | "secondary" | "info" | "warning"> = {
  CHARGE: "success",
  EARN: "info",
  USE: "secondary",
  CANCEL: "warning",
  EXPIRE: "destructive",
};

const EXPORT_COLUMNS = [
  { header: "NO", accessor: "id" },
  { header: "구분", accessor: "type" },
  { header: "결제수단", accessor: "paymentMethod" },
  { header: "내역", accessor: "description" },
  { header: "금액(뽈)", accessor: "amount" },
  { header: "사용자", accessor: "userName" },
  { header: "이메일", accessor: "userEmail" },
  { header: "진행일자", accessor: "processedAt" },
];

export default function PointHistoryPage() {
  const [data, setData] = useState<PageResponse<PointHistory> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);

  // Filters
  const [dateRange, setDateRange] = useState<DateRange>({ from: undefined, to: undefined });
  const [type, setType] = useState<PointType>("ALL");
  const [searchType, setSearchType] = useState("name");
  const [searchKeyword, setSearchKeyword] = useState("");

  // CSV export
  const [exporting, setExporting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const filters: PointHistoryFilter = {
        dateFrom: dateRange.from?.toISOString(),
        dateTo: dateRange.to?.toISOString(),
        type,
        searchType,
        searchKeyword: searchKeyword || undefined,
      };

      const apiParams: Record<string, string> = { page: String(page) };
      if (type !== "ALL") apiParams.type = type;
      if (filters.dateFrom) apiParams.dateFrom = filters.dateFrom;
      if (filters.dateTo) apiParams.dateTo = filters.dateTo;
      if (filters.searchKeyword) {
        apiParams.searchType = searchType;
        apiParams.searchKeyword = filters.searchKeyword;
      }

      const apiResult = await adminApi.get<PageResponse<PointHistory>>(
        "/admin/api/v1/commerce/point-history",
        apiParams
      );
      setData(apiResult);
    } finally {
      setLoading(false);
    }
  }, [dateRange, type, searchType, searchKeyword, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearch = () => {
    setPage(0);
    fetchData();
  };

  const handleReset = () => {
    setDateRange({ from: undefined, to: undefined });
    setType("ALL");
    setSearchType("name");
    setSearchKeyword("");
  };

  const handleExportCsv = async () => {
    setExporting(true);
    try {
      const filters: PointHistoryFilter = {
        dateFrom: dateRange.from?.toISOString(),
        dateTo: dateRange.to?.toISOString(),
        type,
        searchType,
        searchKeyword: searchKeyword || undefined,
      };
      const csvContent = await exportPointHistoryCsv(filters);

      // Trigger download
      const BOM = "\uFEFF";
      const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `point-history-${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  // Summary stats
  const summary = data?.content.reduce(
    (acc, item) => {
      if (item.amount > 0) acc.totalIn += item.amount;
      else acc.totalOut += Math.abs(item.amount);
      return acc;
    },
    { totalIn: 0, totalOut: 0 }
  ) ?? { totalIn: 0, totalOut: 0 };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">뽈 사용내역</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExportCsv} disabled={exporting}>
            <Download size={16} className="mr-1.5" />
            {exporting ? "내보내는 중..." : "CSV 내보내기"}
          </Button>
          <ExportButton
            data={(data?.content ?? []) as unknown as Record<string, unknown>[]}
            columns={EXPORT_COLUMNS}
            filename="point-history"
            label="Export"
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-xs text-gray-500">총 건수</p>
          <p className="text-xl font-bold text-gray-900">{data?.totalElements ?? 0}건</p>
        </div>
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-xs text-emerald-600">총 유입(충전/적립)</p>
          <p className="text-xl font-bold text-emerald-700">+{summary.totalIn.toLocaleString()}뽈</p>
        </div>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-xs text-red-600">총 유출(사용/취소/만료)</p>
          <p className="text-xl font-bold text-red-700">-{summary.totalOut.toLocaleString()}뽈</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-end gap-4 rounded-lg border border-gray-200 bg-white p-4">
        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">진행일자</Label>
          <DateRangePicker value={dateRange} onChange={setDateRange} />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">타입</Label>
          <Select value={type} onValueChange={(v) => setType(v as PointType)}>
            <SelectTrigger className="w-[130px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">전체</SelectItem>
              <SelectItem value="CHARGE">충전</SelectItem>
              <SelectItem value="EARN">적립</SelectItem>
              <SelectItem value="USE">사용</SelectItem>
              <SelectItem value="CANCEL">취소내역</SelectItem>
              <SelectItem value="EXPIRE">만료</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">사용자 검색</Label>
          <div className="flex items-center gap-2">
            <Select value={searchType} onValueChange={setSearchType}>
              <SelectTrigger className="w-[110px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">이름</SelectItem>
                <SelectItem value="email">이메일</SelectItem>
              </SelectContent>
            </Select>
            <Input
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="검색어 입력"
              className="w-[180px]"
            />
          </div>
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

      {/* Type Quick Filters */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500 mr-1">빠른 필터:</span>
        {(["ALL", "CHARGE", "EARN", "USE", "CANCEL", "EXPIRE"] as PointType[]).map((t) => (
          <Button
            key={t}
            variant={type === t ? "default" : "outline"}
            size="sm"
            onClick={() => { setType(t); setPage(0); }}
          >
            {POINT_TYPE_LABELS[t]}
          </Button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-xs font-medium uppercase tracking-wider text-gray-500">
              <th className="px-4 py-3 text-center w-[60px]">NO</th>
              <th className="px-4 py-3 text-center">구분</th>
              <th className="px-4 py-3">결제수단</th>
              <th className="px-4 py-3">내역</th>
              <th className="px-4 py-3 text-right">금액(뽈)</th>
              <th className="px-4 py-3">사용자</th>
              <th className="px-4 py-3">이메일</th>
              <th className="px-4 py-3 text-center">진행일자</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-gray-400">
                  로딩 중...
                </td>
              </tr>
            ) : !data || data.content.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-gray-400">
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
                  <td className="px-4 py-3 text-center">
                    <Badge variant={TYPE_BADGE_VARIANT[item.type] ?? "secondary"}>
                      {POINT_TYPE_LABELS[item.type]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{item.paymentMethod}</td>
                  <td className="px-4 py-3 text-gray-900">{item.description}</td>
                  <td className="px-4 py-3 text-right font-medium tabular-nums">
                    <span className={item.amount >= 0 ? "text-emerald-600" : "text-red-500"}>
                      {item.amount >= 0 ? "+" : ""}{item.amount.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{item.userName}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{item.userEmail}</td>
                  <td className="px-4 py-3 text-center text-gray-500">{item.processedAt}</td>
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
