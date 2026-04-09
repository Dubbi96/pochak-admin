"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ExportButton } from "@/components/common/export-button";
import { Search } from "lucide-react";
import {
  SPORT_OPTIONS,
  OPERATION_STATUS_LABELS,
  type OperationStatus,
} from "@/services/organization-api";
import { adminApi } from "@/lib/api-client";

// ── Types ──────────────────────────────────────────────────────────

interface ClubTeam {
  teamId: number;
  name: string;
  shortName?: string;
  sportName?: string;
  siGunGuCode?: string;
  memberCount: number;
  operationStatus?: OperationStatus;
  logoUrl?: string;
  description?: string;
}

interface ApiPageResponse {
  content?: ClubTeam[];
  // Also handle flat array response
  totalElements?: number;
  totalPages?: number;
  number?: number;
}

const STATUS_BADGE_VARIANT: Record<string, "success" | "warning" | "destructive"> = {
  ACTIVE: "success",
  SUSPENDED: "warning",
  DISSOLVED: "destructive",
};

const EXPORT_COLUMNS = [
  { header: "ID", accessor: "teamId" },
  { header: "팀명", accessor: "name" },
  { header: "종목", accessor: "sportName" },
  { header: "지역", accessor: "siGunGuCode" },
  { header: "회원수", accessor: "memberCount" },
  { header: "운영상태", accessor: "operationStatus" },
];

const PAGE_SIZE = 20;

export default function ClubTeamPage() {
  const [clubs, setClubs] = useState<ClubTeam[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sportFilter, setSportFilter] = useState("ALL");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [pendingKeyword, setPendingKeyword] = useState("");

  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  // Pagination
  const [page, setPage] = useState(0);

  // Status change
  const [changingStatus, setChangingStatus] = useState<number | null>(null);

  const fetchClubs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = {
        page: String(page),
        size: String(PAGE_SIZE),
      };
      if (sportFilter !== "ALL") params.sportId = sportFilter;
      if (searchKeyword) params.keyword = searchKeyword;

      const res = await adminApi.get<ApiPageResponse | ClubTeam[]>(
        "/admin/api/v1/clubs",
        params
      );

      if (Array.isArray(res)) {
        setClubs(res);
        setTotal(res.length);
        setTotalPages(1);
      } else if (res && typeof res === "object") {
        const content = (res as ApiPageResponse).content ?? [];
        setClubs(content);
        setTotal((res as ApiPageResponse).totalElements ?? content.length);
        setTotalPages((res as ApiPageResponse).totalPages ?? 1);
      }
    } catch {
      setError("클럽 목록을 불러오는 데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }, [page, sportFilter, searchKeyword]);

  useEffect(() => {
    fetchClubs();
  }, [fetchClubs]);

  const handleSearch = () => {
    setSearchKeyword(pendingKeyword);
    setPage(0);
    setSelectedIds(new Set());
  };

  const handleReset = () => {
    setStatusFilter("ALL");
    setSportFilter("ALL");
    setPendingKeyword("");
    setSearchKeyword("");
    setPage(0);
    setSelectedIds(new Set());
  };

  const handleStatusChange = async (clubId: number, status: OperationStatus) => {
    setChangingStatus(clubId);
    try {
      await adminApi.patch(`/admin/api/v1/clubs/${clubId}/status`, { status });
      setClubs((prev) =>
        prev.map((c) => (c.teamId === clubId ? { ...c, operationStatus: status } : c))
      );
    } catch {
      alert("상태 변경에 실패했습니다.");
    } finally {
      setChangingStatus(null);
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === clubs.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(clubs.map((r) => r.teamId)));
    }
  };

  // Client-side status filter (server doesn't support status filter for clubs)
  const displayed = statusFilter === "ALL"
    ? clubs
    : clubs.filter((c) => c.operationStatus === statusFilter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">팀(동호회) 관리</h1>
          <p className="mt-1 text-sm text-gray-500">
            동호회 팀 목록을 조회하고 관리합니다.
            {total > 0 && (
              <span className="ml-2 font-medium text-gray-700">총 {total}개</span>
            )}
          </p>
        </div>
        <ExportButton
          data={clubs as unknown as Record<string, unknown>[]}
          columns={EXPORT_COLUMNS}
          filename="club-teams"
          label="Export"
        />
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-end gap-4 rounded-lg border border-gray-200 bg-white p-4">
        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">운영 상태</Label>
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(0); }}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">전체</SelectItem>
              <SelectItem value="ACTIVE">운영중</SelectItem>
              <SelectItem value="SUSPENDED">운영중단</SelectItem>
              <SelectItem value="DISSOLVED">해체</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">종목</Label>
          <Select value={sportFilter} onValueChange={(v) => { setSportFilter(v); setPage(0); }}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SPORT_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">팀명</Label>
          <Input
            value={pendingKeyword}
            onChange={(e) => setPendingKeyword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="팀명 검색"
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

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-xs font-medium uppercase tracking-wider text-gray-500">
              <th className="px-4 py-3 text-center w-[48px]">
                <Checkbox
                  checked={clubs.length > 0 && selectedIds.size === clubs.length}
                  onCheckedChange={toggleSelectAll}
                />
              </th>
              <th className="px-4 py-3 text-center w-[60px]">NO</th>
              <th className="px-4 py-3">팀명</th>
              <th className="px-4 py-3">종목</th>
              <th className="px-4 py-3">지역</th>
              <th className="px-4 py-3 text-center">회원수</th>
              <th className="px-4 py-3 text-center">운영상태</th>
              <th className="px-4 py-3 text-center">상태 변경</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-gray-400">
                  불러오는 중...
                </td>
              </tr>
            ) : displayed.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-gray-400">
                  데이터가 없습니다.
                </td>
              </tr>
            ) : (
              displayed.map((item, idx) => (
                <tr
                  key={item.teamId}
                  className={`border-b border-gray-100 transition-colors hover:bg-gray-50 ${idx % 2 === 1 ? "bg-gray-50/50" : ""}`}
                >
                  <td className="px-4 py-3 text-center">
                    <Checkbox
                      checked={selectedIds.has(item.teamId)}
                      onCheckedChange={() => toggleSelect(item.teamId)}
                    />
                  </td>
                  <td className="px-4 py-3 text-center text-gray-500">
                    {page * PAGE_SIZE + idx + 1}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">{item.name}</td>
                  <td className="px-4 py-3 text-gray-600">{item.sportName ?? "–"}</td>
                  <td className="px-4 py-3 text-gray-600">{item.siGunGuCode ?? "–"}</td>
                  <td className="px-4 py-3 text-center text-gray-600">{item.memberCount}</td>
                  <td className="px-4 py-3 text-center">
                    {item.operationStatus ? (
                      <Badge variant={STATUS_BADGE_VARIANT[item.operationStatus] ?? "default"}>
                        {OPERATION_STATUS_LABELS[item.operationStatus] ?? item.operationStatus}
                      </Badge>
                    ) : (
                      <span className="text-gray-400">–</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Select
                      value={item.operationStatus ?? "ACTIVE"}
                      onValueChange={(v) => handleStatusChange(item.teamId, v as OperationStatus)}
                      disabled={changingStatus === item.teamId}
                    >
                      <SelectTrigger className="w-[110px] h-7 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ACTIVE">운영중</SelectItem>
                        <SelectItem value="SUSPENDED">운영중단</SelectItem>
                        <SelectItem value="DISSOLVED">해체</SelectItem>
                      </SelectContent>
                    </Select>
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
          <Button variant="outline" size="sm" disabled={page === 0 || loading} onClick={() => setPage(page - 1)}>
            이전
          </Button>
          <span className="text-sm text-gray-600">
            {page + 1} / {totalPages}
          </span>
          <Button variant="outline" size="sm" disabled={page >= totalPages - 1 || loading} onClick={() => setPage(page + 1)}>
            다음
          </Button>
        </div>
      )}
    </div>
  );
}
