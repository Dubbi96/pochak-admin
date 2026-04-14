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
import { Search, Plus } from "lucide-react";
import {
  getOrganizations,
  type Organization,
  type OrganizationFilter,
} from "@/services/organization-api";
import type { PageResponse } from "@/types/common";

const EXPORT_COLUMNS = [
  { header: "NO", accessor: "id" },
  { header: "지점명", accessor: "name" },
  { header: "본점ID", accessor: "parentOrganizationId" },
  { header: "지역코드", accessor: "siGunGuCode" },
  { header: "인증", accessor: "isVerified" },
  { header: "활성", accessor: "published" },
];

const PAGE_SIZE = 20;

export default function PrivateBranchPage() {
  const [data, setData] = useState<PageResponse<Organization> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const [activeFilter, setActiveFilter] = useState("ALL");
  const [pendingKeyword, setPendingKeyword] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const filters: OrganizationFilter = {
        type: "PRIVATE",
        operationStatus: "ALL",
        accessType: "ALL",
        sportName: "",
        district: "",
        searchKeyword,
      };
      const result = await getOrganizations(filters, page, PAGE_SIZE);
      setData(result);
    } catch (err) {
      console.error("[PrivateBranch] fetch error", err);
    } finally {
      setLoading(false);
    }
  }, [searchKeyword, page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSearch = () => { setSearchKeyword(pendingKeyword); setPage(0); };
  const handleReset = () => {
    setActiveFilter("ALL");
    setPendingKeyword("");
    setSearchKeyword("");
    setPage(0);
  };

  // Branches = PRIVATE orgs that have a parent
  const items = (data?.content ?? []).filter((item) => {
    if (!item.parentOrganizationId) return false; // must have a parent
    if (activeFilter === "ACTIVE" && !item.published) return false;
    if (activeFilter === "INACTIVE" && item.published) return false;
    return true;
  });

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">단체(폐쇄형) 지점 관리</h1>
          <p className="mt-1 text-sm text-gray-500">폐쇄형(PRIVATE) 단체의 지점 목록을 조회하고 관리합니다.</p>
        </div>
        <div className="flex items-center gap-2">
          <ExportButton
            data={items as unknown as Record<string, unknown>[]}
            columns={EXPORT_COLUMNS}
            filename="private-branches"
            label="Export"
          />
          <Button><Plus className="mr-1.5 h-4 w-4" />등록</Button>
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-4 rounded-lg border border-gray-200 bg-white p-4">
        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">활성 상태</Label>
          <Select value={activeFilter} onValueChange={setActiveFilter}>
            <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">전체</SelectItem>
              <SelectItem value="ACTIVE">활성</SelectItem>
              <SelectItem value="INACTIVE">비활성</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">지점명</Label>
          <Input
            value={pendingKeyword}
            onChange={(e) => setPendingKeyword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="지점명 검색"
            className="w-[180px]"
          />
        </div>

        <div className="flex items-end gap-2">
          <Button onClick={handleSearch}><Search size={16} className="mr-1.5" />검색</Button>
          <Button variant="outline" onClick={handleReset}>초기화</Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-xs font-medium uppercase tracking-wider text-gray-500">
              <th className="px-4 py-3 text-center w-[48px]">
                <Checkbox
                  checked={items.length > 0 && selectedIds.size === items.length}
                  onCheckedChange={() => {
                    if (selectedIds.size === items.length) setSelectedIds(new Set());
                    else setSelectedIds(new Set(items.map((r) => r.id)));
                  }}
                />
              </th>
              <th className="px-4 py-3 text-center w-[60px]">NO</th>
              <th className="px-4 py-3">지점명</th>
              <th className="px-4 py-3 text-center">본점 ID</th>
              <th className="px-4 py-3">지역코드</th>
              <th className="px-4 py-3 text-center">인증</th>
              <th className="px-4 py-3 text-center">활성</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-400">로딩 중...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-400">데이터가 없습니다.</td></tr>
            ) : (
              items.map((item, idx) => (
                <tr key={item.id} className={`border-b border-gray-100 transition-colors hover:bg-gray-50 ${idx % 2 === 1 ? "bg-gray-50/50" : ""}`}>
                  <td className="px-4 py-3 text-center">
                    <Checkbox checked={selectedIds.has(item.id)} onCheckedChange={() => toggleSelect(item.id)} />
                  </td>
                  <td className="px-4 py-3 text-center text-gray-500">{page * PAGE_SIZE + idx + 1}</td>
                  <td className="px-4 py-3 font-medium cursor-pointer hover:underline" style={{ color: "var(--c-primary)" }}>
                    {item.name}
                  </td>
                  <td className="px-4 py-3 text-center text-gray-500 text-xs">#{item.parentOrganizationId}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{item.siGunGuCode ?? "-"}</td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant={item.isVerified ? "success" : "secondary"}>
                      {item.isVerified ? "인증" : "미인증"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant={item.published ? "success" : "secondary"}>
                      {item.published ? "활성" : "비활성"}
                    </Badge>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)}>이전</Button>
          <span className="text-sm text-gray-600">{page + 1} / {data.totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= data.totalPages - 1} onClick={() => setPage(page + 1)}>다음</Button>
        </div>
      )}
    </div>
  );
}
