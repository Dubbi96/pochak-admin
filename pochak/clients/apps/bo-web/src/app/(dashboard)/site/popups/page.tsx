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
import { adminApi } from "@/lib/api-client";

// ── Types ────────────────────────────────────────────────────────────

interface PopupEntry {
  id: number;
  title: string;
  imageUrl: string;
  linkUrl: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
}

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: "활성화",
  INACTIVE: "비활성화",
};

// ── Page ─────────────────────────────────────────────────────────────

export default function PopupsPage() {
  const [data, setData] = useState<PopupEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const pageSize = 20;

  // Filters
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [keyword, setKeyword] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await adminApi.get<PopupEntry[]>("/admin/api/v1/site/popups");
      setData(Array.isArray(result) ? result : []);
    } catch (e) {
      console.error("Failed to fetch popups", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filtered = data.filter((p) => {
    const status = p.isActive ? "ACTIVE" : "INACTIVE";
    if (statusFilter !== "ALL" && status !== statusFilter) return false;
    if (keyword && !p.title.toLowerCase().includes(keyword.toLowerCase())) return false;
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
        <h1 className="text-xl font-bold text-gray-900">팝업 관리</h1>
        <Button>
          <Plus size={16} className="mr-1.5" />
          등록
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-end gap-4 rounded-lg border border-gray-200 bg-white p-4">
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
              <th className="px-4 py-3 text-center">이미지 URL</th>
              <th className="px-4 py-3 text-center">노출기간</th>
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
            ) : pageData.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                  데이터가 없습니다.
                </td>
              </tr>
            ) : (
              pageData.map((popup, idx) => {
                const status = popup.isActive ? "ACTIVE" : "INACTIVE";
                return (
                  <tr
                    key={popup.id}
                    className={`border-b border-gray-100 transition-colors hover:bg-gray-50 ${idx % 2 === 1 ? "bg-gray-50/50" : ""}`}
                  >
                    <td className="px-4 py-3 text-center text-gray-500">
                      {page * pageSize + idx + 1}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">{popup.title}</td>
                    <td className="px-4 py-3 text-center text-gray-500 text-xs truncate max-w-[150px]">
                      {popup.imageUrl || "-"}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-500 whitespace-nowrap text-xs">
                      {popup.startDate?.slice(0, 10)} ~ {popup.endDate?.slice(0, 10)}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-500 text-xs">
                      {popup.createdAt?.slice(0, 10)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant={popup.isActive ? "success" : "secondary"}>
                        {STATUS_LABELS[status]}
                      </Badge>
                    </td>
                  </tr>
                );
              })
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
