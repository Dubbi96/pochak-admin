"use client";

import React, { useState } from "react";
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
import { Search, Plus } from "lucide-react";
import {
  SPORT_OPTIONS,
  DISTRICT_OPTIONS,
  OPERATION_STATUS_LABELS,
  type OperationStatus,
} from "@/services/organization-api";

// ── Types ──────────────────────────────────────────────────────────

interface EliteTeam {
  id: number;
  sportName: string;
  operationStatus: OperationStatus;
  name: string;
  district: string;
  memberCount: number;
  managerCount: number;
  competitionCount: number;
  published: boolean;
}

// ── Mock Data ──────────────────────────────────────────────────────

const MOCK_DATA: EliteTeam[] = [
  { id: 1, sportName: "축구", operationStatus: "ACTIVE", name: "FC서울 엘리트", district: "서울 강남구", memberCount: 32, managerCount: 4, competitionCount: 12, published: true },
  { id: 2, sportName: "야구", operationStatus: "ACTIVE", name: "서울 드래곤즈", district: "서울 송파구", memberCount: 28, managerCount: 3, competitionCount: 8, published: true },
  { id: 3, sportName: "농구", operationStatus: "SUSPENDED", name: "강남 점프스", district: "서울 강남구", memberCount: 15, managerCount: 2, competitionCount: 5, published: false },
  { id: 4, sportName: "배구", operationStatus: "ACTIVE", name: "서초 스파이크", district: "서울 서초구", memberCount: 18, managerCount: 2, competitionCount: 7, published: true },
  { id: 5, sportName: "축구", operationStatus: "DISSOLVED", name: "마포 유나이티드", district: "서울 마포구", memberCount: 0, managerCount: 0, competitionCount: 3, published: false },
  { id: 6, sportName: "풋살", operationStatus: "ACTIVE", name: "성남 퓨처스", district: "경기 성남시", memberCount: 20, managerCount: 3, competitionCount: 9, published: true },
  { id: 7, sportName: "축구", operationStatus: "ACTIVE", name: "수원 FC 엘리트", district: "경기 수원시", memberCount: 25, managerCount: 3, competitionCount: 11, published: true },
  { id: 8, sportName: "야구", operationStatus: "SUSPENDED", name: "해운대 이글스", district: "부산 해운대구", memberCount: 22, managerCount: 2, competitionCount: 6, published: false },
  { id: 9, sportName: "농구", operationStatus: "ACTIVE", name: "송파 블레이저스", district: "서울 송파구", memberCount: 14, managerCount: 2, competitionCount: 4, published: true },
  { id: 10, sportName: "축구", operationStatus: "ACTIVE", name: "강남 아카데미 FC", district: "서울 강남구", memberCount: 30, managerCount: 5, competitionCount: 15, published: true },
];

const STATUS_BADGE_VARIANT: Record<string, "success" | "warning" | "destructive"> = {
  ACTIVE: "success",
  SUSPENDED: "warning",
  DISSOLVED: "destructive",
};

const EXPORT_COLUMNS = [
  { header: "NO", accessor: "id" },
  { header: "종목", accessor: "sportName" },
  { header: "운영상태", accessor: "operationStatus" },
  { header: "팀명", accessor: "name" },
  { header: "시/군/구", accessor: "district" },
  { header: "회원수", accessor: "memberCount" },
  { header: "매니저수", accessor: "managerCount" },
  { header: "대회수", accessor: "competitionCount" },
];

const PAGE_SIZE = 20;

export default function EliteTeamPage() {
  // Filters
  const [publishFilter, setPublishFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sportFilter, setSportFilter] = useState("ALL");
  const [districtFilter, setDistrictFilter] = useState("ALL");
  const [searchKeyword, setSearchKeyword] = useState("");

  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  // Pagination
  const [page, setPage] = useState(0);

  // Filtering logic
  const filtered = MOCK_DATA.filter((item) => {
    if (publishFilter === "ACTIVE" && !item.published) return false;
    if (publishFilter === "INACTIVE" && item.published) return false;
    if (statusFilter !== "ALL" && item.operationStatus !== statusFilter) return false;
    if (sportFilter !== "ALL" && item.sportName !== sportFilter) return false;
    if (districtFilter !== "ALL" && item.district !== districtFilter) return false;
    if (searchKeyword && !item.name.includes(searchKeyword)) return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const handleSearch = () => setPage(0);
  const handleReset = () => {
    setPublishFilter("ALL");
    setStatusFilter("ALL");
    setSportFilter("ALL");
    setDistrictFilter("ALL");
    setSearchKeyword("");
    setPage(0);
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
    if (selectedIds.size === paged.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paged.map((r) => r.id)));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">팀(엘리트) 관리</h1>
          <p className="mt-1 text-sm text-gray-500">엘리트 팀 목록을 조회하고 관리합니다.</p>
        </div>
        <div className="flex items-center gap-2">
          <ExportButton
            data={filtered as unknown as Record<string, unknown>[]}
            columns={EXPORT_COLUMNS}
            filename="elite-teams"
            label="Export"
          />
          <Button>
            <Plus className="mr-1.5 h-4 w-4" />
            등록
          </Button>
        </div>
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
          <Label className="text-xs text-gray-500">운영 상태</Label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
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
          <Select value={sportFilter} onValueChange={setSportFilter}>
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
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="팀명 검색"
            className="w-[180px]"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">시/군/구</Label>
          <Select value={districtFilter} onValueChange={setDistrictFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DISTRICT_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
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
              <th className="px-4 py-3 text-center w-[48px]">
                <Checkbox
                  checked={paged.length > 0 && selectedIds.size === paged.length}
                  onCheckedChange={toggleSelectAll}
                />
              </th>
              <th className="px-4 py-3 text-center w-[60px]">NO</th>
              <th className="px-4 py-3">종목</th>
              <th className="px-4 py-3 text-center">운영상태</th>
              <th className="px-4 py-3">팀명</th>
              <th className="px-4 py-3">시/군/구</th>
              <th className="px-4 py-3 text-center">회원수</th>
              <th className="px-4 py-3 text-center">매니저수</th>
              <th className="px-4 py-3 text-center">대회수</th>
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-12 text-center text-gray-400">
                  데이터가 없습니다.
                </td>
              </tr>
            ) : (
              paged.map((item, idx) => (
                <tr
                  key={item.id}
                  className={`border-b border-gray-100 transition-colors hover:bg-gray-50 ${idx % 2 === 1 ? "bg-gray-50/50" : ""}`}
                >
                  <td className="px-4 py-3 text-center">
                    <Checkbox
                      checked={selectedIds.has(item.id)}
                      onCheckedChange={() => toggleSelect(item.id)}
                    />
                  </td>
                  <td className="px-4 py-3 text-center text-gray-500">
                    {page * PAGE_SIZE + idx + 1}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{item.sportName}</td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant={STATUS_BADGE_VARIANT[item.operationStatus]}>
                      {OPERATION_STATUS_LABELS[item.operationStatus]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 font-medium cursor-pointer hover:underline" style={{ color: "var(--c-primary)" }}>
                    {item.name}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{item.district}</td>
                  <td className="px-4 py-3 text-center text-gray-600">{item.memberCount}</td>
                  <td className="px-4 py-3 text-center text-gray-600">{item.managerCount}</td>
                  <td className="px-4 py-3 text-center text-gray-600">{item.competitionCount}</td>
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
