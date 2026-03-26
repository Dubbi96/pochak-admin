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
import { Search } from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────

interface Contract {
  id: string;
  companyName: string;
  customerName: string;
  registeredAt: string;
  status: "계약중" | "해지" | "대기";
  venueId: string;
  equipmentType: string;
  equipmentId: string;
}

// ── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_CONTRACTS: Contract[] = [
  {
    id: "CTR-2026-001",
    companyName: "서울FC",
    customerName: "김민수",
    registeredAt: "2026-01-15",
    status: "계약중",
    venueId: "VEN-001",
    equipmentType: "VPU",
    equipmentId: "VPU-SN-10001",
  },
  {
    id: "CTR-2026-002",
    companyName: "부산유나이티드",
    customerName: "이정훈",
    registeredAt: "2026-02-03",
    status: "계약중",
    venueId: "VEN-002",
    equipmentType: "CHU",
    equipmentId: "CHU-SN-20001",
  },
  {
    id: "CTR-2026-003",
    companyName: "대전시티즌",
    customerName: "박세진",
    registeredAt: "2026-02-20",
    status: "해지",
    venueId: "VEN-003",
    equipmentType: "VPU",
    equipmentId: "VPU-SN-10002",
  },
  {
    id: "CTR-2026-004",
    companyName: "수원삼성",
    customerName: "최영호",
    registeredAt: "2026-03-01",
    status: "대기",
    venueId: "VEN-004",
    equipmentType: "",
    equipmentId: "",
  },
  {
    id: "CTR-2026-005",
    companyName: "인천유나이티드",
    customerName: "정하늘",
    registeredAt: "2026-03-10",
    status: "계약중",
    venueId: "VEN-005",
    equipmentType: "CHU",
    equipmentId: "CHU-SN-20002",
  },
  {
    id: "CTR-2026-006",
    companyName: "강원FC",
    customerName: "한지우",
    registeredAt: "2026-03-18",
    status: "대기",
    venueId: "VEN-006",
    equipmentType: "",
    equipmentId: "",
  },
];

const PAGE_SIZE = 20;

// ── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: Contract["status"] }) {
  const variantMap: Record<Contract["status"], "success" | "destructive" | "warning"> = {
    "계약중": "success",
    "해지": "destructive",
    "대기": "warning",
  };
  return <Badge variant={variantMap[status]}>{status}</Badge>;
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function ActivationListPage() {
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [equipmentPresence, setEquipmentPresence] = useState("ALL");
  const [equipmentTypeFilter, setEquipmentTypeFilter] = useState("ALL");
  const [page, setPage] = useState(0);

  // Filter logic
  const filtered = MOCK_CONTRACTS.filter((c) => {
    if (keyword) {
      const kw = keyword.toLowerCase();
      if (
        !c.id.toLowerCase().includes(kw) &&
        !c.customerName.toLowerCase().includes(kw)
      )
        return false;
    }
    if (statusFilter !== "ALL" && c.status !== statusFilter) return false;
    if (equipmentPresence === "유" && !c.equipmentId) return false;
    if (equipmentPresence === "무" && c.equipmentId) return false;
    if (equipmentTypeFilter !== "ALL" && c.equipmentType !== equipmentTypeFilter)
      return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const handleSearch = () => {
    setPage(0);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">개통 리스트</h1>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-end gap-4 rounded-lg border border-gray-200 bg-white p-4">
        {/* 검색 키워드 */}
        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">검색 키워드</Label>
          <div className="flex gap-2">
            <Input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="계약번호 / 고객명"
              className="w-[200px]"
            />
            <Button variant="outline" size="icon" onClick={handleSearch}>
              <Search size={16} />
            </Button>
          </div>
        </div>

        {/* 계약 상태 */}
        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">계약 상태</Label>
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(0); }}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">전체</SelectItem>
              <SelectItem value="계약중">계약중</SelectItem>
              <SelectItem value="해지">해지</SelectItem>
              <SelectItem value="대기">대기</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 장비 유/무 */}
        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">장비 유/무</Label>
          <Select value={equipmentPresence} onValueChange={(v) => { setEquipmentPresence(v); setPage(0); }}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">전체</SelectItem>
              <SelectItem value="유">유</SelectItem>
              <SelectItem value="무">무</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 장비 타입 */}
        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">장비 타입</Label>
          <Select value={equipmentTypeFilter} onValueChange={(v) => { setEquipmentTypeFilter(v); setPage(0); }}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">전체</SelectItem>
              <SelectItem value="VPU">VPU</SelectItem>
              <SelectItem value="CHU">CHU</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-xs font-medium uppercase tracking-wider text-gray-500">
              <th className="px-4 py-3 text-center w-[80px]">계약ID</th>
              <th className="px-4 py-3">회사명</th>
              <th className="px-4 py-3">고객명</th>
              <th className="px-4 py-3">등록일</th>
              <th className="px-4 py-3">계약상태</th>
              <th className="px-4 py-3">구장ID</th>
              <th className="px-4 py-3">장비타입</th>
              <th className="px-4 py-3">장비ID</th>
              <th className="px-4 py-3 text-center">관리</th>
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
              paged.map((contract, idx) => (
                <tr
                  key={contract.id}
                  className={`border-b border-gray-100 transition-colors hover:bg-gray-50 ${idx % 2 === 1 ? "bg-gray-50/50" : ""}`}
                >
                  <td className="px-4 py-3 text-center font-mono text-xs text-gray-600">
                    {contract.id}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {contract.companyName}
                  </td>
                  <td className="px-4 py-3 text-gray-700">{contract.customerName}</td>
                  <td className="px-4 py-3 text-gray-600">{contract.registeredAt}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={contract.status} />
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">
                    {contract.venueId}
                  </td>
                  <td className="px-4 py-3">
                    {contract.equipmentType ? (
                      <Badge variant="outline">{contract.equipmentType}</Badge>
                    ) : (
                      <span className="text-gray-300">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">
                    {contract.equipmentId || (
                      <span className="text-gray-300">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Button variant="outline" size="sm">
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
          <Button
            variant="outline"
            size="sm"
            disabled={page === 0}
            onClick={() => setPage(page - 1)}
          >
            이전
          </Button>
          <span className="text-sm text-gray-600">
            {page + 1} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages - 1}
            onClick={() => setPage(page + 1)}
          >
            다음
          </Button>
        </div>
      )}
    </div>
  );
}
