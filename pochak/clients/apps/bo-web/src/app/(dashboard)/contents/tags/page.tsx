"use client";

import React, { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DateRangePicker,
  type DateRange,
} from "@/components/filter/date-range-picker";
import { Search } from "lucide-react";
import type {
  AssetTag,
  TagFilter,
  TagItem,
  ContentType,
} from "@/types/content-asset";
import type { PageResponse } from "@/types/common";
import {
  getAssetTags,
  getTagsByMatch,
  getTournamentOptions,
} from "@/services/content-asset-api";

export default function TagsListPage() {
  const [data, setData] = useState<PageResponse<AssetTag> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);

  // Filters
  const [tournamentFilter, setTournamentFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [matchNameFilter, setMatchNameFilter] = useState("");
  const [dateRange, setDateRange] = useState<DateRange>({
    from: undefined,
    to: undefined,
  });

  // Tournament options
  const [tournamentOptions, setTournamentOptions] = useState<
    { id: number; name: string }[]
  >([]);

  // Tag detail modal
  const [selectedMatch, setSelectedMatch] = useState<AssetTag | null>(null);
  const [matchTags, setMatchTags] = useState<TagItem[]>([]);
  const [tagModalOpen, setTagModalOpen] = useState(false);
  const [tagLoading, setTagLoading] = useState(false);

  useEffect(() => {
    getTournamentOptions().then(setTournamentOptions);
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const filters: TagFilter = {
        tournamentId:
          tournamentFilter === "ALL"
            ? null
            : parseInt(tournamentFilter, 10),
        contentType:
          typeFilter === "ALL" ? null : (typeFilter as ContentType),
        matchName: matchNameFilter || undefined,
        dateFrom: dateRange.from
          ? dateRange.from.toISOString()
          : undefined,
        dateTo: dateRange.to ? dateRange.to.toISOString() : undefined,
      };
      const result = await getAssetTags(filters, page);
      setData(result);
    } finally {
      setLoading(false);
    }
  }, [tournamentFilter, typeFilter, matchNameFilter, dateRange, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearch = () => {
    setPage(0);
    fetchData();
  };

  const handleRowClick = async (tag: AssetTag) => {
    setSelectedMatch(tag);
    setTagModalOpen(true);
    setTagLoading(true);
    try {
      const tags = await getTagsByMatch(tag.id);
      setMatchTags(tags);
    } finally {
      setTagLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">태그 관리</h1>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-end gap-4 rounded-lg border border-gray-200 bg-white p-4">
        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">대회/리그</Label>
          <Select
            value={tournamentFilter}
            onValueChange={setTournamentFilter}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">전체</SelectItem>
              {tournamentOptions.map((t) => (
                <SelectItem key={t.id} value={String(t.id)}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">타입</Label>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">전체</SelectItem>
              <SelectItem value="LIVE">Live</SelectItem>
              <SelectItem value="VOD">VOD</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">경기 명</Label>
          <Input
            value={matchNameFilter}
            onChange={(e) => setMatchNameFilter(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="경기 명 검색"
            className="w-[200px]"
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

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-xs font-medium uppercase tracking-wider text-gray-500">
              <th className="px-4 py-3 text-center w-[60px]">NO</th>
              <th className="px-4 py-3">경기 명</th>
              <th className="px-4 py-3 text-center">타입</th>
              <th className="px-4 py-3">대회 명</th>
              <th className="px-4 py-3">홈팀</th>
              <th className="px-4 py-3">어웨이팀</th>
              <th className="px-4 py-3">등록 날짜</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-12 text-center text-gray-400"
                >
                  로딩 중...
                </td>
              </tr>
            ) : !data || data.content.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-12 text-center text-gray-400"
                >
                  데이터가 없습니다.
                </td>
              </tr>
            ) : (
              data.content.map((tag, idx) => (
                <tr
                  key={tag.id}
                  className={`border-b border-gray-100 transition-colors hover:bg-gray-50 cursor-pointer ${idx % 2 === 1 ? "bg-gray-50/50" : ""}`}
                  onClick={() => handleRowClick(tag)}
                >
                  <td className="px-4 py-3 text-center text-gray-500">
                    {page * (data?.size ?? 20) + idx + 1}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {tag.matchName}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {tag.contentType === "LIVE" ? (
                      <Badge className="bg-red-100 text-red-700 border-transparent">
                        <span className="relative mr-1 flex h-2 w-2">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                          <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
                        </span>
                        LIVE
                      </Badge>
                    ) : (
                      <Badge variant="info">VOD</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {tag.tournamentName}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {tag.homeTeam}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {tag.awayTeam}
                  </td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                    {format(
                      new Date(tag.createdAt),
                      "yyyy.MM.dd HH:mm"
                    )}
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

      {/* Tag Detail Modal */}
      <Dialog
        open={tagModalOpen}
        onOpenChange={(v) => !v && setTagModalOpen(false)}
      >
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>태그 상세</DialogTitle>
            <DialogDescription>
              {selectedMatch?.matchName ?? ""} 경기의 태그 목록입니다.
            </DialogDescription>
          </DialogHeader>

          {tagLoading ? (
            <div className="py-8 text-center text-gray-400">
              로딩 중...
            </div>
          ) : matchTags.length === 0 ? (
            <div className="py-8 text-center text-gray-400">
              등록된 태그가 없습니다.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 text-xs font-medium text-gray-500">
                    <th className="px-3 py-2">태그</th>
                    <th className="px-3 py-2 text-center">시간</th>
                    <th className="px-3 py-2 text-center">팀</th>
                  </tr>
                </thead>
                <tbody>
                  {matchTags.map((t) => (
                    <tr
                      key={t.id}
                      className="border-b border-gray-100"
                    >
                      <td className="px-3 py-2 font-medium text-gray-900">
                        {t.label}
                      </td>
                      <td className="px-3 py-2 text-center text-gray-600">
                        {t.time}
                      </td>
                      <td className="px-3 py-2 text-center">
                        {t.team === "HOME" ? (
                          <Badge variant="info">홈</Badge>
                        ) : t.team === "AWAY" ? (
                          <Badge variant="warning">어웨이</Badge>
                        ) : (
                          <Badge variant="secondary">-</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
