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
import type { PageResponse } from "@/types/common";

// ── Types ──────────────────────────────────────────────────────────

type InappPlatform = "ALL" | "APPLE" | "GOOGLE";

interface InappRefund {
  id: number;
  platform: "APPLE" | "GOOGLE";
  amount: number;
  requesterName: string;
  requesterEmail: string;
  requestedAt: string;
  remarkOrderId: string;
}

const PLATFORM_LABELS: Record<string, string> = {
  ALL: "전체",
  APPLE: "애플",
  GOOGLE: "구글",
};

const PLATFORM_BADGE_VARIANT: Record<string, "secondary" | "default"> = {
  APPLE: "secondary",
  GOOGLE: "default",
};

// ── Mock Data ──────────────────────────────────────────────────────

const MOCK_INAPP_REFUNDS: InappRefund[] = [
  { id: 1, platform: "GOOGLE", amount: 9900, requesterName: "김민수", requesterEmail: "minsu@gmail.com", requestedAt: "2026-03-22", remarkOrderId: "GPA.3387-2045-1298-54321" },
  { id: 2, platform: "APPLE", amount: 14900, requesterName: "이수진", requesterEmail: "sujin@naver.com", requestedAt: "2026-03-20", remarkOrderId: "MKTX8F2PNV" },
  { id: 3, platform: "GOOGLE", amount: 4900, requesterName: "박정호", requesterEmail: "jh.park@gmail.com", requestedAt: "2026-03-18", remarkOrderId: "GPA.3387-7721-9384-12345" },
  { id: 4, platform: "APPLE", amount: 29900, requesterName: "최예린", requesterEmail: "yerin@icloud.com", requestedAt: "2026-03-15", remarkOrderId: "PQRS5T6UVW" },
  { id: 5, platform: "GOOGLE", amount: 9900, requesterName: "정태우", requesterEmail: "taewoo@kakao.com", requestedAt: "2026-03-12", remarkOrderId: "GPA.3387-5544-6677-98765" },
  { id: 6, platform: "APPLE", amount: 4900, requesterName: "한지은", requesterEmail: "jieun@naver.com", requestedAt: "2026-03-10", remarkOrderId: "ABCD1E2FGH" },
];

// ── Mock API ───────────────────────────────────────────────────────

async function getInappRefunds(
  filters: { platform: InappPlatform; dateRange?: DateRange; searchKeyword?: string },
  page = 0,
  size = 20
): Promise<PageResponse<InappRefund>> {
  await new Promise((r) => setTimeout(r, 300));
  let filtered = [...MOCK_INAPP_REFUNDS];

  if (filters.platform !== "ALL") {
    filtered = filtered.filter((r) => r.platform === filters.platform);
  }
  if (filters.searchKeyword) {
    const kw = filters.searchKeyword.toLowerCase();
    filtered = filtered.filter((r) => r.requesterName.toLowerCase().includes(kw));
  }

  const start = page * size;
  const content = filtered.slice(start, start + size);
  return { content, totalElements: filtered.length, totalPages: Math.ceil(filtered.length / size), page, size };
}

// ── Component ──────────────────────────────────────────────────────

export default function InappRefundsPage() {
  const [data, setData] = useState<PageResponse<InappRefund> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);

  // Filters
  const [platform, setPlatform] = useState<InappPlatform>("ALL");
  const [dateRangeMode, setDateRangeMode] = useState<"ALL" | "RANGE">("ALL");
  const [dateRange, setDateRange] = useState<DateRange>({ from: undefined, to: undefined });
  const [searchKeyword, setSearchKeyword] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getInappRefunds(
        { platform, dateRange: dateRangeMode === "RANGE" ? dateRange : undefined, searchKeyword: searchKeyword || undefined },
        page
      );
      setData(result);
    } finally {
      setLoading(false);
    }
  }, [platform, dateRangeMode, dateRange, searchKeyword, page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSearch = () => { setPage(0); fetchData(); };
  const handleReset = () => {
    setPlatform("ALL");
    setDateRangeMode("ALL");
    setDateRange({ from: undefined, to: undefined });
    setSearchKeyword("");
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
          <Select value={platform} onValueChange={(v) => setPlatform(v as InappPlatform)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(["ALL", "APPLE", "GOOGLE"] as InappPlatform[]).map((p) => (
                <SelectItem key={p} value={p}>{PLATFORM_LABELS[p]}</SelectItem>
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
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
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
              <th className="px-4 py-3 text-center">구분</th>
              <th className="px-4 py-3 text-right">금액</th>
              <th className="px-4 py-3">접수자</th>
              <th className="px-4 py-3 text-center">접수일자</th>
              <th className="px-4 py-3">REMARK/ORDERID</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-gray-400">로딩 중...</td>
              </tr>
            ) : !data || data.content.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-gray-400">데이터가 없습니다.</td>
              </tr>
            ) : (
              data.content.map((item, idx) => (
                <tr key={item.id} className={`border-b border-gray-100 transition-colors hover:bg-gray-50 ${idx % 2 === 1 ? "bg-gray-50/50" : ""}`}>
                  <td className="px-4 py-3 text-center text-gray-500">{page * (data?.size ?? 20) + idx + 1}</td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant={PLATFORM_BADGE_VARIANT[item.platform]}>
                      {PLATFORM_LABELS[item.platform]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right font-medium tabular-nums text-gray-900">
                    {item.amount.toLocaleString()}원
                  </td>
                  <td className="px-4 py-3">
                    <button className="text-blue-600 hover:underline font-medium">
                      {item.requesterName}
                    </button>
                    <p className="text-xs text-gray-400">{item.requesterEmail}</p>
                  </td>
                  <td className="px-4 py-3 text-center text-gray-500">{item.requestedAt}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs font-mono">{item.remarkOrderId}</td>
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
