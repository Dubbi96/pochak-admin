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
type ProgressStatus = "IN_PROGRESS" | "UPCOMING" | "ENDED";

interface EventEntry {
  id: number;
  progressStatus: ProgressStatus;
  title: string;
  viewCount: number;
  progressStart: string;
  progressEnd: string;
  createdAt: string;
  publishStatus: PublishStatus;
}

// ── Mock Data ────────────────────────────────────────────────────────

const MOCK_EVENTS: EventEntry[] = [
  { id: 1, progressStatus: "IN_PROGRESS", title: "포착 시즌 오픈 이벤트", viewCount: 1234, progressStart: "2026-03-01", progressEnd: "2026-03-31", createdAt: "2026-02-25", publishStatus: "ACTIVE" },
  { id: 2, progressStatus: "IN_PROGRESS", title: "친구 초대 이벤트", viewCount: 856, progressStart: "2026-03-10", progressEnd: "2026-04-10", createdAt: "2026-03-05", publishStatus: "ACTIVE" },
  { id: 3, progressStatus: "UPCOMING", title: "여름 시즌 사전 예약 이벤트", viewCount: 0, progressStart: "2026-06-01", progressEnd: "2026-06-30", createdAt: "2026-03-20", publishStatus: "ACTIVE" },
  { id: 4, progressStatus: "ENDED", title: "겨울 시즌 종료 이벤트", viewCount: 3421, progressStart: "2025-12-01", progressEnd: "2026-01-31", createdAt: "2025-11-25", publishStatus: "INACTIVE" },
  { id: 5, progressStatus: "ENDED", title: "포착 런칭 기념 이벤트", viewCount: 5678, progressStart: "2025-09-01", progressEnd: "2025-10-31", createdAt: "2025-08-28", publishStatus: "INACTIVE" },
];

const PROGRESS_LABELS: Record<ProgressStatus, string> = {
  IN_PROGRESS: "진행중",
  UPCOMING: "예정",
  ENDED: "종료",
};

const PROGRESS_BADGE_VARIANT: Record<ProgressStatus, "success" | "default" | "secondary"> = {
  IN_PROGRESS: "success",
  UPCOMING: "default",
  ENDED: "secondary",
};

const PUBLISH_LABELS: Record<PublishStatus, string> = {
  ACTIVE: "활성화",
  INACTIVE: "비활성화",
};

// ── Page ─────────────────────────────────────────────────────────────

export default function EventsPage() {
  const [page, setPage] = useState(0);
  const pageSize = 20;

  // Filters
  const [dateMode, setDateMode] = useState("ALL");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [publishFilter, setPublishFilter] = useState("ALL");
  const [progressFilter, setProgressFilter] = useState("ALL");
  const [keyword, setKeyword] = useState("");

  // Filtered data
  const filtered = MOCK_EVENTS.filter((e) => {
    if (publishFilter !== "ALL" && e.publishStatus !== publishFilter) return false;
    if (progressFilter !== "ALL" && e.progressStatus !== progressFilter) return false;
    if (keyword && !e.title.toLowerCase().includes(keyword.toLowerCase())) return false;
    if (dateMode === "RANGE" && dateFrom && e.createdAt < dateFrom) return false;
    if (dateMode === "RANGE" && dateTo && e.createdAt > dateTo) return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageData = filtered.slice(page * pageSize, (page + 1) * pageSize);

  const handleSearch = () => {
    setPage(0);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">이벤트 관리</h1>
        <Button>
          <Plus size={16} className="mr-1.5" />
          등록
        </Button>
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
          <Select value={publishFilter} onValueChange={setPublishFilter}>
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
          <Label className="text-xs text-gray-500">진행 상태</Label>
          <Select value={progressFilter} onValueChange={setProgressFilter}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">전체</SelectItem>
              <SelectItem value="IN_PROGRESS">진행중</SelectItem>
              <SelectItem value="UPCOMING">예정</SelectItem>
              <SelectItem value="ENDED">종료</SelectItem>
            </SelectContent>
          </Select>
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
              <th className="px-4 py-3 text-center w-[60px]">NO</th>
              <th className="px-4 py-3 text-center w-[90px]">진행상태</th>
              <th className="px-4 py-3">제목</th>
              <th className="px-4 py-3 text-center w-[80px]">조회수</th>
              <th className="px-4 py-3 text-center">진행일자</th>
              <th className="px-4 py-3 text-center w-[100px]">등록일</th>
              <th className="px-4 py-3 text-center w-[90px]">게시상태</th>
              <th className="px-4 py-3 text-center w-[80px]">관리</th>
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
              pageData.map((event, idx) => (
                <tr
                  key={event.id}
                  className={`border-b border-gray-100 transition-colors hover:bg-gray-50 ${idx % 2 === 1 ? "bg-gray-50/50" : ""}`}
                >
                  <td className="px-4 py-3 text-center text-gray-500">
                    {page * pageSize + idx + 1}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant={PROGRESS_BADGE_VARIANT[event.progressStatus]}>
                      {PROGRESS_LABELS[event.progressStatus]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">{event.title}</td>
                  <td className="px-4 py-3 text-center text-gray-600">
                    {event.viewCount.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-center text-gray-500 whitespace-nowrap text-xs">
                    {event.progressStart} ~ {event.progressEnd}
                  </td>
                  <td className="px-4 py-3 text-center text-gray-500 text-xs">
                    {event.createdAt}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant={event.publishStatus === "ACTIVE" ? "success" : "secondary"}>
                      {PUBLISH_LABELS[event.publishStatus]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Button variant="outline" size="sm" className="h-7 text-xs">
                      상세
                    </Button>
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
