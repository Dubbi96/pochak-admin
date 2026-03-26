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
import { ExportButton } from "@/components/common/export-button";
import { Search, Plus } from "lucide-react";
import {
  SPORT_OPTIONS,
  DISTRICT_OPTIONS,
  OPERATION_STATUS_LABELS,
  type OperationStatus,
} from "@/services/organization-api";

// ── Types ──────────────────────────────────────────────────────────

interface PublicOrg {
  id: number;
  sportName: string;
  operationStatus: OperationStatus;
  name: string;
  district: string;
  teamCount: number;
  individualCount: number;
  associationCount: number;
  published: boolean;
}

// ── Mock Data ──────────────────────────────────────────────────────

const MOCK_DATA: PublicOrg[] = [
  { id: 1, sportName: "축구", operationStatus: "ACTIVE", name: "서울시 축구연합", district: "서울 강남구", teamCount: 24, individualCount: 580, associationCount: 3, published: true },
  { id: 2, sportName: "야구", operationStatus: "ACTIVE", name: "경기도 야구연합", district: "경기 성남시", teamCount: 18, individualCount: 420, associationCount: 2, published: true },
  { id: 3, sportName: "농구", operationStatus: "SUSPENDED", name: "서울시 농구연합", district: "서울 송파구", teamCount: 12, individualCount: 280, associationCount: 1, published: false },
  { id: 4, sportName: "배구", operationStatus: "ACTIVE", name: "부산시 배구연합", district: "부산 해운대구", teamCount: 8, individualCount: 190, associationCount: 1, published: true },
  { id: 5, sportName: "풋살", operationStatus: "ACTIVE", name: "서울시 풋살연합", district: "서울 마포구", teamCount: 30, individualCount: 720, associationCount: 4, published: true },
  { id: 6, sportName: "축구", operationStatus: "ACTIVE", name: "강남구 축구리그", district: "서울 강남구", teamCount: 16, individualCount: 340, associationCount: 2, published: true },
  { id: 7, sportName: "야구", operationStatus: "DISSOLVED", name: "서초구 야구리그", district: "서울 서초구", teamCount: 0, individualCount: 0, associationCount: 0, published: false },
  { id: 8, sportName: "축구", operationStatus: "ACTIVE", name: "수원시 축구연합", district: "경기 수원시", teamCount: 20, individualCount: 450, associationCount: 2, published: true },
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
  { header: "단체명", accessor: "name" },
  { header: "시/군/구", accessor: "district" },
  { header: "팀수", accessor: "teamCount" },
  { header: "개인수", accessor: "individualCount" },
  { header: "협회수", accessor: "associationCount" },
];

const PAGE_SIZE = 20;

export default function PublicOrgPage() {
  // Filters
  const [publishFilter, setPublishFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sportFilter, setSportFilter] = useState("ALL");
  const [districtFilter, setDistrictFilter] = useState("ALL");
  const [searchKeyword, setSearchKeyword] = useState("");

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">단체(개방형) 관리</h1>
          <p className="mt-1 text-sm text-gray-500">개방형 단체 목록을 조회하고 관리합니다.</p>
        </div>
        <div className="flex items-center gap-2">
          <ExportButton
            data={filtered as unknown as Record<string, unknown>[]}
            columns={EXPORT_COLUMNS}
            filename="public-orgs"
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
          <Label className="text-xs text-gray-500">단체명</Label>
          <Input
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="단체명 검색"
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
              <th className="px-4 py-3 text-center w-[60px]">NO</th>
              <th className="px-4 py-3">종목</th>
              <th className="px-4 py-3 text-center">운영상태</th>
              <th className="px-4 py-3">단체명</th>
              <th className="px-4 py-3">시/군/구</th>
              <th className="px-4 py-3 text-center">팀수</th>
              <th className="px-4 py-3 text-center">개인수</th>
              <th className="px-4 py-3 text-center">협회수</th>
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-gray-400">
                  데이터가 없습니다.
                </td>
              </tr>
            ) : (
              paged.map((item, idx) => (
                <tr
                  key={item.id}
                  className={`border-b border-gray-100 transition-colors hover:bg-gray-50 ${idx % 2 === 1 ? "bg-gray-50/50" : ""}`}
                >
                  <td className="px-4 py-3 text-center text-gray-500">
                    {page * PAGE_SIZE + idx + 1}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{item.sportName}</td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant={STATUS_BADGE_VARIANT[item.operationStatus]}>
                      {OPERATION_STATUS_LABELS[item.operationStatus]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 font-medium text-blue-600 cursor-pointer hover:underline">
                    {item.name}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{item.district}</td>
                  <td className="px-4 py-3 text-center text-gray-600">{item.teamCount}</td>
                  <td className="px-4 py-3 text-center text-gray-600">{item.individualCount}</td>
                  <td className="px-4 py-3 text-center text-gray-600">{item.associationCount}</td>
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
