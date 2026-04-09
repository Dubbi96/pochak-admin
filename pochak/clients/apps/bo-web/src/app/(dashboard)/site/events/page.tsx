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
import { Plus, Search } from "lucide-react";
import type { PageResponse } from "@/types/common";
import { adminApi } from "@/lib/api-client";

// ── Types ────────────────────────────────────────────────────────────

interface EventEntry {
  id: number;
  title: string;
  content: string;
  imageUrl: string;
  startDate: string;
  endDate: string;
  status: string;
  isActive: boolean;
  createdAt: string;
}

// ── Utils ─────────────────────────────────────────────────────────────

function getProgressStatus(startDate: string, endDate: string): "IN_PROGRESS" | "UPCOMING" | "ENDED" {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (now < start) return "UPCOMING";
  if (now > end) return "ENDED";
  return "IN_PROGRESS";
}

const PROGRESS_LABELS: Record<string, string> = {
  IN_PROGRESS: "진행중",
  UPCOMING: "예정",
  ENDED: "종료",
};

const PROGRESS_BADGE_VARIANT: Record<string, "success" | "default" | "secondary"> = {
  IN_PROGRESS: "success",
  UPCOMING: "default",
  ENDED: "secondary",
};

// ── Page ─────────────────────────────────────────────────────────────

export default function EventsPage() {
  const [data, setData] = useState<EventEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const pageSize = 20;

  // Filters
  const [publishFilter, setPublishFilter] = useState("ALL");
  const [progressFilter, setProgressFilter] = useState("ALL");
  const [keyword, setKeyword] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await adminApi.get<PageResponse<EventEntry>>(
        "/admin/api/v1/site/events",
        { page: String(page), size: String(pageSize) }
      );
      const items = (result as unknown as { content?: EventEntry[] })?.content ?? (Array.isArray(result) ? result as unknown as EventEntry[] : []);
      setData(items);
    } catch (e) {
      console.error("Failed to fetch events", e);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filtered = data.filter((e) => {
    const progress = getProgressStatus(e.startDate, e.endDate);
    if (publishFilter !== "ALL" && ((publishFilter === "ACTIVE") !== e.isActive)) return false;
    if (progressFilter !== "ALL" && progress !== progressFilter) return false;
    if (keyword && !e.title.toLowerCase().includes(keyword.toLowerCase())) return false;
    return true;
  });

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
              <th className="px-4 py-3">제목</th>
              <th className="px-4 py-3 text-center">진행기간</th>
              <th className="px-4 py-3 text-center">진행상태</th>
              <th className="px-4 py-3 text-center">등록일</th>
              <th className="px-4 py-3 text-center">게시상태</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                  로딩 중...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                  데이터가 없습니다.
                </td>
              </tr>
            ) : (
              filtered.map((event, idx) => {
                const progress = getProgressStatus(event.startDate, event.endDate);
                return (
                  <tr
                    key={event.id}
                    className={`border-b border-gray-100 transition-colors hover:bg-gray-50 ${idx % 2 === 1 ? "bg-gray-50/50" : ""}`}
                  >
                    <td className="px-4 py-3 text-center text-gray-500">
                      {idx + 1}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">{event.title}</td>
                    <td className="px-4 py-3 text-center text-gray-500 whitespace-nowrap text-xs">
                      {event.startDate?.slice(0, 10)} ~ {event.endDate?.slice(0, 10)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant={PROGRESS_BADGE_VARIANT[progress]}>
                        {PROGRESS_LABELS[progress]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-center text-gray-500 text-xs">
                      {event.createdAt?.slice(0, 10)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant={event.isActive ? "success" : "secondary"}>
                        {event.isActive ? "활성화" : "비활성화"}
                      </Badge>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
