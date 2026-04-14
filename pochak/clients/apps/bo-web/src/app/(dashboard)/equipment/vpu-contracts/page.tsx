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
import { Search, Download } from "lucide-react";
import { getVpuContracts } from "@/services/equipment-api";
import type { VpuContract, PlatformType, ActivationStatus } from "@/services/equipment-api";

// ── Constants ─────────────────────────────────────────────────────────

const ACTIVATION_LABELS: Record<ActivationStatus, string> = {
  ACTIVATED: "개통",
  DEACTIVATED: "미개통",
  ACTIVATING: "개통중",
  ERROR: "개통오류",
  SUSPENDED: "정지",
  TERMINATED: "해지",
  TEST: "테스트",
};

const ACTIVATION_BADGE_VARIANT: Record<
  ActivationStatus,
  "success" | "secondary" | "default" | "destructive" | "warning" | "info" | "outline"
> = {
  ACTIVATED: "success",
  DEACTIVATED: "secondary",
  ACTIVATING: "default",
  ERROR: "destructive",
  SUSPENDED: "warning",
  TERMINATED: "outline",
  TEST: "info",
};

const PLATFORM_LABELS: Record<PlatformType, string> = {
  PIXELLOT: "픽셀로",
  ARENA: "아레나",
  UNDECIDED: "미정",
};

// ── Page ─────────────────────────────────────────────────────────────

export default function VpuContractsPage() {
  const [page, setPage] = useState(0);
  const pageSize = 20;

  // API state
  const [contracts, setContracts] = useState<VpuContract[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [platformFilter, setPlatformFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [modelFilter, setModelFilter] = useState("ALL");
  const [vendorFilter, setVendorFilter] = useState("ALL");
  const [searchCondition, setSearchCondition] = useState("VPU_NAME");
  const [keyword, setKeyword] = useState("");

  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getVpuContracts(
        {
          platformType: platformFilter,
          activationStatus: statusFilter,
          modelName: modelFilter,
          vendor: vendorFilter,
          searchCondition,
          keyword: keyword || undefined,
        },
        page,
        pageSize
      );
      setContracts(result.content);
      setTotalPages(Math.max(1, result.totalPages));
    } catch {
      setError("데이터를 불러오지 못했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, [platformFilter, statusFilter, modelFilter, vendorFilter, searchCondition, keyword, page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const pageData = contracts;

  const toggleAll = () => {
    if (selectedIds.size === pageData.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(pageData.map((c) => c.id)));
    }
  };

  const toggleOne = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSearch = () => {
    setPage(0);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">VPU 계약 관리</h1>
        <Button variant="outline" size="sm">
          <Download size={16} className="mr-1.5" />
          Export
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-end gap-4 rounded-lg border border-gray-200 bg-white p-4">
        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">플랫폼 유형</Label>
          <Select value={platformFilter} onValueChange={setPlatformFilter}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">전체</SelectItem>
              <SelectItem value="PIXELLOT">픽셀로</SelectItem>
              <SelectItem value="ARENA">아레나</SelectItem>
              <SelectItem value="UNDECIDED">미정</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">개통 상태</Label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">전체</SelectItem>
              <SelectItem value="ACTIVATED">개통</SelectItem>
              <SelectItem value="DEACTIVATED">미개통</SelectItem>
              <SelectItem value="ACTIVATING">개통중</SelectItem>
              <SelectItem value="ERROR">개통오류</SelectItem>
              <SelectItem value="SUSPENDED">정지</SelectItem>
              <SelectItem value="TERMINATED">해지</SelectItem>
              <SelectItem value="TEST">테스트</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">모델명</Label>
          <Select value={modelFilter} onValueChange={setModelFilter}>
            <SelectTrigger className="w-[130px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">전체</SelectItem>
              <SelectItem value="VPU-3000">VPU-3000</SelectItem>
              <SelectItem value="VPU-5000">VPU-5000</SelectItem>
              <SelectItem value="VPU-7000">VPU-7000</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">판매처</Label>
          <Select value={vendorFilter} onValueChange={setVendorFilter}>
            <SelectTrigger className="w-[130px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">전체</SelectItem>
              <SelectItem value="호각">호각</SelectItem>
              <SelectItem value="스카이라이프">스카이라이프</SelectItem>
              <SelectItem value="미정">미정</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">검색어 조건</Label>
          <Select value={searchCondition} onValueChange={setSearchCondition}>
            <SelectTrigger className="w-[130px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="VPU_NAME">VPU명</SelectItem>
              <SelectItem value="SERIAL">시리얼</SelectItem>
              <SelectItem value="CUSTOMER">이용고객</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">검색어</Label>
          <div className="flex gap-2">
            <Input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="검색어 입력"
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
              <th className="px-4 py-3 text-center w-[50px]">
                <input
                  type="checkbox"
                  checked={pageData.length > 0 && selectedIds.size === pageData.length}
                  onChange={toggleAll}
                  className="rounded border-gray-300"
                />
              </th>
              <th className="px-4 py-3 text-center w-[60px]">NO</th>
              <th className="px-4 py-3 text-center">플랫폼유형</th>
              <th className="px-4 py-3">모델명</th>
              <th className="px-4 py-3">VPU명</th>
              <th className="px-4 py-3">시리얼번호</th>
              <th className="px-4 py-3">파트너</th>
              <th className="px-4 py-3 text-center">개통상태</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-gray-400">로딩 중...</td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-red-400">{error}</td>
              </tr>
            ) : pageData.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-gray-400">
                  데이터가 없습니다.
                </td>
              </tr>
            ) : (
              pageData.map((contract, idx) => (
                <tr
                  key={contract.id}
                  className={`border-b border-gray-100 transition-colors hover:bg-gray-50 ${idx % 2 === 1 ? "bg-gray-50/50" : ""}`}
                >
                  <td className="px-4 py-3 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(contract.id)}
                      onChange={() => toggleOne(contract.id)}
                      className="rounded border-gray-300"
                    />
                  </td>
                  <td className="px-4 py-3 text-center text-gray-500">
                    {page * pageSize + idx + 1}
                  </td>
                  <td className="px-4 py-3 text-center text-gray-600">
                    {PLATFORM_LABELS[contract.platformType]}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{contract.modelName}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{contract.vpuName}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">{contract.serialNumber}</td>
                  <td className="px-4 py-3 text-gray-600">{contract.partner}</td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant={ACTIVATION_BADGE_VARIANT[contract.activationStatus]}>
                      {ACTIVATION_LABELS[contract.activationStatus]}
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
