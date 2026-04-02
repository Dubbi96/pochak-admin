"use client";

import React, { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
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
import type {
  ClipAsset,
  ClipFilter,
  ClipType,
  AssetVisibility,
} from "@/types/content-asset";
import type { PageResponse } from "@/types/common";
import {
  getClipAssets,
  updateClipVisibility,
  getSportOptions,
} from "@/services/content-asset-api";

const clipTypeLabels: Record<string, string> = {
  ALL: "전체",
  TEAM: "팀",
  ASSOCIATION: "협회",
  ORG_OPEN: "단체(개방)",
  ORG_CLOSED_HQ: "단체(폐쇄)본점",
  ORG_CLOSED_BRANCH: "단체(폐쇄)지점",
  PERSONAL: "개인",
  AFFILIATED: "소속",
};

export default function ClipsListPage() {
  const [data, setData] = useState<PageResponse<ClipAsset> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);

  // Filters
  const [matchNameFilter, setMatchNameFilter] = useState("");
  const [clipTypeFilter, setClipTypeFilter] = useState("ALL");
  const [sportFilter, setSportFilter] = useState("ALL");
  const [clipNameFilter, setClipNameFilter] = useState("");
  const [dateRange, setDateRange] = useState<DateRange>({
    from: undefined,
    to: undefined,
  });

  // Sport options
  const [sportOptions, setSportOptions] = useState<
    { id: number; name: string }[]
  >([]);

  // Selection
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  useEffect(() => {
    getSportOptions().then(setSportOptions);
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const filters: ClipFilter = {
        matchName: matchNameFilter || undefined,
        clipType:
          clipTypeFilter === "ALL"
            ? null
            : (clipTypeFilter as ClipType),
        sportId:
          sportFilter === "ALL" ? null : parseInt(sportFilter, 10),
        clipName: clipNameFilter || undefined,
        dateFrom: dateRange.from
          ? dateRange.from.toISOString()
          : undefined,
        dateTo: dateRange.to ? dateRange.to.toISOString() : undefined,
      };
      const result = await getClipAssets(filters, page);
      setData(result);
      setSelectedIds([]);
    } finally {
      setLoading(false);
    }
  }, [
    matchNameFilter,
    clipTypeFilter,
    sportFilter,
    clipNameFilter,
    dateRange,
    page,
  ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearch = () => {
    setPage(0);
    fetchData();
  };

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (!data) return;
    if (selectedIds.length === data.content.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(data.content.map((a) => a.id));
    }
  };

  const handleBulkVisibility = async (visibility: AssetVisibility) => {
    if (selectedIds.length === 0) return;
    await updateClipVisibility(selectedIds, visibility);
    fetchData();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">클립 관리</h1>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-end gap-4 rounded-lg border border-gray-200 bg-white p-4">
        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">경기 명</Label>
          <Input
            value={matchNameFilter}
            onChange={(e) => setMatchNameFilter(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="경기 명 검색"
            className="w-[180px]"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">클립 타입</Label>
          <Select value={clipTypeFilter} onValueChange={setClipTypeFilter}>
            <SelectTrigger className="w-[170px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(clipTypeLabels).map(([k, v]) => (
                <SelectItem key={k} value={k}>
                  {v}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">종목</Label>
          <Select value={sportFilter} onValueChange={setSportFilter}>
            <SelectTrigger className="w-[130px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">전체</SelectItem>
              {sportOptions.map((s) => (
                <SelectItem key={s.id} value={String(s.id)}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">클립 명</Label>
          <Input
            value={clipNameFilter}
            onChange={(e) => setClipNameFilter(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="클립 명 검색"
            className="w-[180px]"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">등록 일시</Label>
          <DateRangePicker value={dateRange} onChange={setDateRange} />
        </div>

        <Button variant="outline" size="icon" onClick={handleSearch}>
          <Search size={16} />
        </Button>
      </div>

      {/* Bulk Actions */}
      {selectedIds.length > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2">
          <span className="text-sm text-emerald-700">
            {selectedIds.length}건 선택됨
          </span>
          <Button
            size="sm"
            variant="outline"
            className="border-emerald-300 text-emerald-700 hover:bg-emerald-100"
            onClick={() => handleBulkVisibility("PUBLIC")}
          >
            전체 공개
          </Button>
          <Button
            size="sm"
            variant="outline"
            style={{ borderColor: "var(--c-primary)", color: "var(--c-primary)" }}
            onClick={() => handleBulkVisibility("MEMBERS_ONLY")}
          >
            멤버만
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="border-gray-300 text-gray-700 hover:bg-gray-100"
            onClick={() => handleBulkVisibility("PRIVATE")}
          >
            비공개
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-xs font-medium uppercase tracking-wider text-gray-500">
              <th className="px-4 py-3 text-center w-[40px]">
                <Checkbox
                  checked={
                    data !== null &&
                    data.content.length > 0 &&
                    selectedIds.length === data.content.length
                  }
                  onCheckedChange={toggleSelectAll}
                />
              </th>
              <th className="px-4 py-3 text-center w-[60px]">NO</th>
              <th className="px-4 py-3">클립명</th>
              <th className="px-4 py-3">종목</th>
              <th className="px-4 py-3">경기명</th>
              <th className="px-4 py-3 text-center">클립타입</th>
              <th className="px-4 py-3 text-right">조회수</th>
              <th className="px-4 py-3">등록일시</th>
              <th className="px-4 py-3 text-center">노출상태</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={9}
                  className="px-4 py-12 text-center text-gray-400"
                >
                  로딩 중...
                </td>
              </tr>
            ) : !data || data.content.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  className="px-4 py-12 text-center text-gray-400"
                >
                  데이터가 없습니다.
                </td>
              </tr>
            ) : (
              data.content.map((clip, idx) => (
                <tr
                  key={clip.id}
                  className={`border-b border-gray-100 transition-colors hover:bg-gray-50 ${idx % 2 === 1 ? "bg-gray-50/50" : ""}`}
                >
                  <td className="px-4 py-3 text-center">
                    <Checkbox
                      checked={selectedIds.includes(clip.id)}
                      onCheckedChange={() => toggleSelect(clip.id)}
                    />
                  </td>
                  <td className="px-4 py-3 text-center text-gray-500">
                    {page * (data?.size ?? 20) + idx + 1}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {clip.clipName}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {clip.sportName}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {clip.matchName}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant="outline">
                      {clipTypeLabels[clip.clipType] ?? clip.clipType}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600">
                    {clip.viewCount.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                    {format(
                      new Date(clip.createdAt),
                      "yyyy.MM.dd HH:mm"
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge
                      variant={
                        clip.visibility === "PUBLIC"
                          ? "success"
                          : clip.visibility === "MEMBERS_ONLY"
                            ? "info"
                            : clip.visibility === "SPECIFIC"
                              ? "warning"
                              : "secondary"
                      }
                    >
                      {clip.visibility === "PUBLIC"
                        ? "전체 공개"
                        : clip.visibility === "MEMBERS_ONLY"
                          ? "멤버만"
                          : clip.visibility === "SPECIFIC"
                            ? "특정 사용자"
                            : "비공개"}
                    </Badge>
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
          <Button
            variant="outline"
            size="sm"
            disabled={page === 0}
            onClick={() => setPage(page - 1)}
          >
            이전
          </Button>
          <span className="text-sm text-gray-600">
            {page + 1} / {data.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= data.totalPages - 1}
            onClick={() => setPage(page + 1)}
          >
            다음
          </Button>
        </div>
      )}
    </div>
  );
}
