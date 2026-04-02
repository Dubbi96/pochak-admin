"use client";

import React, { useState } from "react";
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
import { Plus, Search } from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────

type PublishStatus = "ACTIVE" | "INACTIVE";

interface PopupEntry {
  id: number;
  order: number;
  title: string;
  pcImageUrl: string;
  mobileImageUrl: string;
  exposureStart: string;
  exposureEnd: string;
  createdAt: string;
  status: PublishStatus;
}

// ── Mock Data ────────────────────────────────────────────────────────

const MOCK_POPUPS: PopupEntry[] = [
  { id: 1, order: 1, title: "신규 가입 이벤트 안내", pcImageUrl: "popup_pc_001.png", mobileImageUrl: "popup_mo_001.png", exposureStart: "2026-03-01", exposureEnd: "2026-03-31", createdAt: "2026-02-25", status: "ACTIVE" },
  { id: 2, order: 2, title: "시즌 오픈 기념 할인", pcImageUrl: "popup_pc_002.png", mobileImageUrl: "popup_mo_002.png", exposureStart: "2026-03-10", exposureEnd: "2026-04-10", createdAt: "2026-03-05", status: "ACTIVE" },
  { id: 3, order: 3, title: "서비스 점검 안내", pcImageUrl: "popup_pc_003.png", mobileImageUrl: "popup_mo_003.png", exposureStart: "2026-03-20", exposureEnd: "2026-03-21", createdAt: "2026-03-18", status: "INACTIVE" },
  { id: 4, order: 4, title: "포착 클럽 가입 안내", pcImageUrl: "popup_pc_004.png", mobileImageUrl: "popup_mo_004.png", exposureStart: "2026-04-01", exposureEnd: "2026-04-30", createdAt: "2026-03-20", status: "ACTIVE" },
  { id: 5, order: 5, title: "앱 업데이트 안내", pcImageUrl: "popup_pc_005.png", mobileImageUrl: "popup_mo_005.png", exposureStart: "2026-02-01", exposureEnd: "2026-02-28", createdAt: "2026-01-28", status: "INACTIVE" },
];

const STATUS_LABELS: Record<PublishStatus, string> = {
  ACTIVE: "활성화",
  INACTIVE: "비활성화",
};

// ── Page ─────────────────────────────────────────────────────────────

export default function PopupsPage() {
  const [page, setPage] = useState(0);
  const pageSize = 20;

  // Filters
  const [dateMode, setDateMode] = useState("ALL");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [exposureMode, setExposureMode] = useState("ALL");
  const [exposureFrom, setExposureFrom] = useState("");
  const [exposureTo, setExposureTo] = useState("");
  const [keyword, setKeyword] = useState("");

  // Order edits
  const [orderEdits, setOrderEdits] = useState<Record<number, number>>({});

  // Filtered data
  const filtered = MOCK_POPUPS.filter((p) => {
    if (statusFilter !== "ALL" && p.status !== statusFilter) return false;
    if (keyword && !p.title.toLowerCase().includes(keyword.toLowerCase())) return false;
    if (dateMode === "RANGE" && dateFrom && p.createdAt < dateFrom) return false;
    if (dateMode === "RANGE" && dateTo && p.createdAt > dateTo) return false;
    if (exposureMode === "RANGE" && exposureFrom && p.exposureEnd < exposureFrom) return false;
    if (exposureMode === "RANGE" && exposureTo && p.exposureStart > exposureTo) return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageData = filtered.slice(page * pageSize, (page + 1) * pageSize);

  const handleSearch = () => {
    setPage(0);
  };

  const handleOrderChange = (id: number, value: string) => {
    const num = parseInt(value, 10);
    if (!isNaN(num) && num > 0) {
      setOrderEdits((prev) => ({ ...prev, [id]: num }));
    }
  };

  const handleApplyOrders = () => {
    // TODO: API call to update orders
    setOrderEdits({});
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">팝업 관리</h1>
        <div className="flex items-center gap-2">
          {Object.keys(orderEdits).length > 0 && (
            <Button variant="outline" onClick={handleApplyOrders}>
              순서 적용
            </Button>
          )}
          <Button>
            <Plus size={16} className="mr-1.5" />
            등록
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-end gap-4 rounded-lg border border-gray-200 bg-white p-4">
        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">등록일자</Label>
          <div className="flex items-center gap-2">
            <Select value={dateMode} onValueChange={setDateMode}>
              <SelectTrigger className="w-[110px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">전체</SelectItem>
                <SelectItem value="RANGE">기간검색</SelectItem>
              </SelectContent>
            </Select>
            {dateMode === "RANGE" && (
              <>
                <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-[140px]" />
                <span className="text-gray-400">~</span>
                <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-[140px]" />
              </>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">게시 상태</Label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">전체</SelectItem>
              <SelectItem value="ACTIVE">활성화</SelectItem>
              <SelectItem value="INACTIVE">비활성화</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">노출기간</Label>
          <div className="flex items-center gap-2">
            <Select value={exposureMode} onValueChange={setExposureMode}>
              <SelectTrigger className="w-[110px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">전체</SelectItem>
                <SelectItem value="RANGE">기간검색</SelectItem>
              </SelectContent>
            </Select>
            {exposureMode === "RANGE" && (
              <>
                <Input type="date" value={exposureFrom} onChange={(e) => setExposureFrom(e.target.value)} className="w-[140px]" />
                <span className="text-gray-400">~</span>
                <Input type="date" value={exposureTo} onChange={(e) => setExposureTo(e.target.value)} className="w-[140px]" />
              </>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">제목 검색</Label>
          <div className="flex gap-2">
            <Input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="제목 입력"
              className="w-[200px]"
            />
            <Button variant="outline" size="icon" onClick={handleSearch}>
              <Search size={16} />
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-xs font-medium uppercase tracking-wider text-gray-500">
              <th className="px-4 py-3 text-center w-[80px]">순서</th>
              <th className="px-4 py-3 text-center w-[60px]">NO</th>
              <th className="px-4 py-3">제목</th>
              <th className="px-4 py-3 text-center">이미지(PC)</th>
              <th className="px-4 py-3 text-center">이미지(모바일)</th>
              <th className="px-4 py-3 text-center">노출기간</th>
              <th className="px-4 py-3 text-center">등록일</th>
              <th className="px-4 py-3 text-center">게시상태</th>
            </tr>
          </thead>
          <tbody>
            {pageData.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-gray-400">
                  데이터가 없습니다.
                </td>
              </tr>
            ) : (
              pageData.map((popup, idx) => (
                <tr
                  key={popup.id}
                  className={`border-b border-gray-100 transition-colors hover:bg-gray-50 ${idx % 2 === 1 ? "bg-gray-50/50" : ""}`}
                >
                  <td className="px-4 py-3 text-center">
                    <Input
                      type="number"
                      min={1}
                      value={orderEdits[popup.id] ?? popup.order}
                      onChange={(e) => handleOrderChange(popup.id, e.target.value)}
                      className="w-[50px] h-7 text-center text-xs mx-auto"
                    />
                  </td>
                  <td className="px-4 py-3 text-center text-gray-500">
                    {page * pageSize + idx + 1}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">{popup.title}</td>
                  <td className="px-4 py-3 text-center text-gray-500 text-xs truncate max-w-[120px]">
                    {popup.pcImageUrl}
                  </td>
                  <td className="px-4 py-3 text-center text-gray-500 text-xs truncate max-w-[120px]">
                    {popup.mobileImageUrl}
                  </td>
                  <td className="px-4 py-3 text-center text-gray-500 whitespace-nowrap text-xs">
                    {popup.exposureStart} ~ {popup.exposureEnd}
                  </td>
                  <td className="px-4 py-3 text-center text-gray-500 text-xs">
                    {popup.createdAt}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant={popup.status === "ACTIVE" ? "success" : "secondary"}>
                      {STATUS_LABELS[popup.status]}
                    </Badge>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)}>
            이전
          </Button>
          <span className="text-sm text-gray-600">
            {page + 1} / {totalPages}
          </span>
          <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>
            다음
          </Button>
        </div>
      )}
    </div>
  );
}
