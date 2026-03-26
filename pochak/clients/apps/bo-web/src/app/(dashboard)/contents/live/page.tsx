"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
} from "@/components/ui/dialog";
import {
  DateRangePicker,
  type DateRange,
} from "@/components/filter/date-range-picker";
import { Plus, Search, Play } from "lucide-react";
import type { LiveAsset, ContentFilter, AssetVisibility } from "@/types/content-asset";
import type { OwnerType } from "@/types/venue";
import type { PageResponse } from "@/types/common";
import {
  getLiveAssets,
  updateLiveVisibility,
  getVenueOptions,
} from "@/services/content-asset-api";
import { VideoPreview } from "@/components/common/video-preview";

const TEST_LIVE_HLS_URL = "https://cph-p2p-msl.akamaized.net/hls/live/2000341/test/master.m3u8";

const ownerTypeLabels: Record<string, string> = {
  ALL: "전체",
  B2B: "단체",
  B2G: "협회",
  B2C: "일반",
};

export default function LiveListPage() {
  const router = useRouter();
  const [data, setData] = useState<PageResponse<LiveAsset> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);

  // Filters
  const [ownerTypeFilter, setOwnerTypeFilter] = useState("ALL");
  const [venueFilter, setVenueFilter] = useState("ALL");
  const [dateRange, setDateRange] = useState<DateRange>({
    from: undefined,
    to: undefined,
  });
  const [visibilityFilter, setVisibilityFilter] = useState("ALL");

  // Venue options
  const [venueOptions, setVenueOptions] = useState<
    { id: number; name: string }[]
  >([]);

  // Selection
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Detail modal
  const [detailAsset, setDetailAsset] = useState<LiveAsset | null>(null);

  useEffect(() => {
    getVenueOptions().then(setVenueOptions).catch((err) => {
      console.error("[LiveList] Failed to load venue options:", err);
    });
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const filters: ContentFilter = {
        ownerType:
          ownerTypeFilter === "ALL"
            ? null
            : (ownerTypeFilter as OwnerType),
        venueId:
          venueFilter === "ALL" ? null : parseInt(venueFilter, 10),
        visibility:
          visibilityFilter === "ALL"
            ? null
            : (visibilityFilter as AssetVisibility),
        dateFrom: dateRange.from
          ? dateRange.from.toISOString()
          : undefined,
        dateTo: dateRange.to ? dateRange.to.toISOString() : undefined,
      };
      const result = await getLiveAssets(filters, page);
      setData(result);
      setSelectedIds([]);
    } finally {
      setLoading(false);
    }
  }, [ownerTypeFilter, venueFilter, visibilityFilter, dateRange, page]);

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
    try {
      await updateLiveVisibility(selectedIds, visibility);
      fetchData();
    } catch (err) {
      console.error("[LiveList] Failed to update visibility:", err);
    }
  };

  const handleRowClick = (asset: LiveAsset, e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest("button") || target.closest('[role="checkbox"]')) return;
    setDetailAsset(asset);
  };

  // Check if a live asset is currently broadcasting (has a stream URL)
  const isBroadcasting = (asset: LiveAsset): boolean => {
    return asset.streamUrl !== null && asset.streamUrl !== "";
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">라이브 관리</h1>
        <Button onClick={() => router.push("/contents/live/create")}>
          <Plus size={16} className="mr-1.5" />
          등록
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-end gap-4 rounded-lg border border-gray-200 bg-white p-4">
        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">구분</Label>
          <Select value={ownerTypeFilter} onValueChange={setOwnerTypeFilter}>
            <SelectTrigger className="w-[130px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(ownerTypeLabels).map(([k, v]) => (
                <SelectItem key={k} value={k}>
                  {v}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">구장 선택</Label>
          <Select value={venueFilter} onValueChange={setVenueFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">전체</SelectItem>
              {venueOptions.map((v) => (
                <SelectItem key={v.id} value={String(v.id)}>
                  {v.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">영상 일자</Label>
          <DateRangePicker value={dateRange} onChange={setDateRange} />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">노출 여부</Label>
          <Select
            value={visibilityFilter}
            onValueChange={setVisibilityFilter}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">전체</SelectItem>
              <SelectItem value="PUBLIC">공개</SelectItem>
              <SelectItem value="PRIVATE">미공개</SelectItem>
            </SelectContent>
          </Select>
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
            일괄 공개
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="border-gray-300 text-gray-700 hover:bg-gray-100"
            onClick={() => handleBulkVisibility("PRIVATE")}
          >
            일괄 미공개
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
              <th className="px-4 py-3">단체 명</th>
              <th className="px-4 py-3">지점 명</th>
              <th className="px-4 py-3">구장 명</th>
              <th className="px-4 py-3">경기 명</th>
              <th className="px-4 py-3">시작시간~종료시간</th>
              <th className="px-4 py-3 text-center">영상 타입</th>
              <th className="px-4 py-3 text-center">노출상태</th>
              <th className="px-4 py-3 text-center w-[80px]">미리보기</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={10}
                  className="px-4 py-12 text-center text-gray-400"
                >
                  로딩 중...
                </td>
              </tr>
            ) : !data || data.content.length === 0 ? (
              <tr>
                <td
                  colSpan={10}
                  className="px-4 py-12 text-center text-gray-400"
                >
                  데이터가 없습니다.
                </td>
              </tr>
            ) : (
              data.content.map((asset, idx) => (
                <tr
                  key={asset.id}
                  className={`border-b border-gray-100 transition-colors hover:bg-gray-50 cursor-pointer ${idx % 2 === 1 ? "bg-gray-50/50" : ""}`}
                  onClick={(e) => handleRowClick(asset, e)}
                >
                  <td className="px-4 py-3 text-center">
                    <Checkbox
                      checked={selectedIds.includes(asset.id)}
                      onCheckedChange={() => toggleSelect(asset.id)}
                    />
                  </td>
                  <td className="px-4 py-3 text-center text-gray-500">
                    {page * (data?.size ?? 20) + idx + 1}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {asset.organizationName || (
                      <span className="text-gray-300">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {asset.branchName || (
                      <span className="text-gray-300">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {asset.venueName}
                  </td>
                  <td className="px-4 py-3 text-gray-900">
                    {asset.matchName}
                  </td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                    {format(new Date(asset.startTime), "yyyy.MM.dd HH:mm")}~
                    {format(new Date(asset.endTime), "HH:mm")}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge className="bg-red-100 text-red-700 border-transparent">
                      <span className="relative mr-1 flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
                      </span>
                      LIVE
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge
                      variant={
                        asset.visibility === "PUBLIC"
                          ? "success"
                          : "secondary"
                      }
                    >
                      {asset.visibility === "PUBLIC"
                        ? "공개"
                        : "미공개"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {isBroadcasting(asset) ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 px-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDetailAsset(asset);
                        }}
                      >
                        <Play size={12} className="mr-1" />
                        보기
                      </Button>
                    ) : (
                      <span className="text-xs text-gray-400">-</span>
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

      {/* LIVE Detail/Preview Modal */}
      <Dialog
        open={detailAsset !== null}
        onOpenChange={(open) => {
          if (!open) setDetailAsset(null);
        }}
      >
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>라이브 상세 / 미리보기</DialogTitle>
          </DialogHeader>
          {detailAsset && (
            <div className="space-y-4">
              {/* Video Player */}
              <VideoPreview
                src={detailAsset.streamUrl || TEST_LIVE_HLS_URL}
                poster={detailAsset.thumbnailUrl || undefined}
              />

              {/* Metadata */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                <div>
                  <span className="text-gray-500">경기명</span>
                  <p className="font-medium text-gray-900">{detailAsset.matchName}</p>
                </div>
                <div>
                  <span className="text-gray-500">구장</span>
                  <p className="font-medium text-gray-900">{detailAsset.venueName}</p>
                </div>
                <div>
                  <span className="text-gray-500">단체</span>
                  <p className="text-gray-700">{detailAsset.organizationName || "-"}</p>
                </div>
                <div>
                  <span className="text-gray-500">지점</span>
                  <p className="text-gray-700">{detailAsset.branchName || "-"}</p>
                </div>
                <div>
                  <span className="text-gray-500">시간</span>
                  <p className="text-gray-700">
                    {format(new Date(detailAsset.startTime), "yyyy.MM.dd HH:mm")}
                    ~{format(new Date(detailAsset.endTime), "HH:mm")}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">종목</span>
                  <p className="text-gray-700">{detailAsset.sportName || "-"}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">노출 상태</span>
                  <Badge
                    variant={detailAsset.visibility === "PUBLIC" ? "success" : "secondary"}
                  >
                    {detailAsset.visibility === "PUBLIC" ? "공개" : "미공개"}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">방송 상태</span>
                  <Badge className="bg-red-100 text-red-700 border-transparent">
                    {isBroadcasting(detailAsset) ? (
                      <>
                        <span className="relative mr-1 flex h-2 w-2">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                          <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
                        </span>
                        방송중
                      </>
                    ) : (
                      "대기중"
                    )}
                  </Badge>
                </div>
                {detailAsset.description && (
                  <div className="col-span-2">
                    <span className="text-gray-500">설명</span>
                    <p className="text-gray-700">{detailAsset.description}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
