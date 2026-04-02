"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import type { PageResponse } from "@/types/common";

// ── Types ──────────────────────────────────────────────────────────

interface RemainingPointUser {
  id: number;
  name: string;
  email: string;
  remainingBall: number;
  remainingPaid: number;
  remainingBonus: number;
  totalCharged: number;
}

interface RemainingPointStats {
  totalUsersWithBall: number;
  totalRemainingBall: number;
  totalRemainingPaid: number;
  totalRemainingBonus: number;
  totalChargedAmount: number;
  totalPaidChargedAmount: number;
  totalBonusChargedAmount: number;
}

// ── Mock Data ──────────────────────────────────────────────────────

const MOCK_STATS: RemainingPointStats = {
  totalUsersWithBall: 1842,
  totalRemainingBall: 9245300,
  totalRemainingPaid: 6832100,
  totalRemainingBonus: 2413200,
  totalChargedAmount: 28750000,
  totalPaidChargedAmount: 23500000,
  totalBonusChargedAmount: 5250000,
};

const MOCK_USERS: RemainingPointUser[] = [
  { id: 1, name: "김민수", email: "minsu@gmail.com", remainingBall: 5200, remainingPaid: 3800, remainingBonus: 1400, totalCharged: 15000 },
  { id: 2, name: "이수진", email: "sujin@naver.com", remainingBall: 1500, remainingPaid: 1000, remainingBonus: 500, totalCharged: 8000 },
  { id: 3, name: "박정호", email: "jh.park@gmail.com", remainingBall: 800, remainingPaid: 800, remainingBonus: 0, totalCharged: 3000 },
  { id: 4, name: "최예린", email: "yerin@icloud.com", remainingBall: 3400, remainingPaid: 2200, remainingBonus: 1200, totalCharged: 12000 },
  { id: 5, name: "정태우", email: "taewoo@kakao.com", remainingBall: 12000, remainingPaid: 10000, remainingBonus: 2000, totalCharged: 30000 },
  { id: 6, name: "한지은", email: "jieun@naver.com", remainingBall: 250, remainingPaid: 250, remainingBonus: 0, totalCharged: 1000 },
  { id: 7, name: "오성민", email: "sungmin@gmail.com", remainingBall: 7800, remainingPaid: 5500, remainingBonus: 2300, totalCharged: 20000 },
  { id: 8, name: "윤서현", email: "seohyun@gmail.com", remainingBall: 4200, remainingPaid: 3000, remainingBonus: 1200, totalCharged: 10000 },
  { id: 9, name: "송유진", email: "yujin@naver.com", remainingBall: 6100, remainingPaid: 4600, remainingBonus: 1500, totalCharged: 18000 },
  { id: 10, name: "강도현", email: "dohyun@gmail.com", remainingBall: 920, remainingPaid: 920, remainingBonus: 0, totalCharged: 5000 },
];

// ── Mock API ───────────────────────────────────────────────────────

async function getRemainingPoints(
  filters: { searchType: string; searchKeyword?: string },
  page = 0,
  size = 20
): Promise<PageResponse<RemainingPointUser>> {
  await new Promise((r) => setTimeout(r, 300));
  let filtered = [...MOCK_USERS];
  if (filters.searchKeyword) {
    const kw = filters.searchKeyword.toLowerCase();
    if (filters.searchType === "name") {
      filtered = filtered.filter((u) => u.name.toLowerCase().includes(kw));
    } else {
      filtered = filtered.filter((u) => u.email.toLowerCase().includes(kw));
    }
  }
  const start = page * size;
  const content = filtered.slice(start, start + size);
  return { content, totalElements: filtered.length, totalPages: Math.ceil(filtered.length / size), page, size };
}

// ── Component ──────────────────────────────────────────────────────

export default function RemainingPointsPage() {
  const [data, setData] = useState<PageResponse<RemainingPointUser> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);

  // Filters
  const [searchType, setSearchType] = useState("name");
  const [searchKeyword, setSearchKeyword] = useState("");

  const stats = MOCK_STATS;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getRemainingPoints({ searchType, searchKeyword: searchKeyword || undefined }, page);
      setData(result);
    } finally {
      setLoading(false);
    }
  }, [searchType, searchKeyword, page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSearch = () => { setPage(0); fetchData(); };
  const handleReset = () => { setSearchType("name"); setSearchKeyword(""); };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">잔여뽈 관리</h1>
      </div>

      {/* KPI Cards - Row 1 */}
      <div className="grid grid-cols-4 gap-4">
        <div className="rounded-lg p-4" style={{ borderWidth: 1, borderStyle: "solid", borderColor: "var(--c-primary)", backgroundColor: "var(--c-primary-light)" }}>
          <p className="text-xs" style={{ color: "var(--c-primary)" }}>잔여 뽈 보유 회원</p>
          <p className="text-xl font-bold" style={{ color: "var(--c-primary)" }}>{stats.totalUsersWithBall.toLocaleString()}명</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-xs text-gray-500">전체 잔여 뽈</p>
          <p className="text-xl font-bold text-gray-900">{stats.totalRemainingBall.toLocaleString()}뽈</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-xs text-gray-500">남은 실결제</p>
          <p className="text-xl font-bold text-gray-900">{stats.totalRemainingPaid.toLocaleString()}뽈</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-xs text-gray-500">남은 보너스</p>
          <p className="text-xl font-bold text-gray-900">{stats.totalRemainingBonus.toLocaleString()}뽈</p>
        </div>
      </div>

      {/* KPI Cards - Row 2 */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-xs text-emerald-600">총 충전 총액</p>
          <p className="text-xl font-bold text-emerald-700">{stats.totalChargedAmount.toLocaleString()}뽈</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-xs text-gray-500">실결제 충전 총액</p>
          <p className="text-xl font-bold text-gray-900">{stats.totalPaidChargedAmount.toLocaleString()}뽈</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-xs text-gray-500">보너스 충전 총액</p>
          <p className="text-xl font-bold text-gray-900">{stats.totalBonusChargedAmount.toLocaleString()}뽈</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-end gap-4 rounded-lg border border-gray-200 bg-white p-4">
        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">검색 조건</Label>
          <Select value={searchType} onValueChange={setSearchType}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">이름</SelectItem>
              <SelectItem value="email">이메일</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">검색어</Label>
          <Input
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="검색어 입력"
            className="w-[220px]"
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

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-xs font-medium uppercase tracking-wider text-gray-500">
              <th className="px-4 py-3 text-center w-[60px]">NO</th>
              <th className="px-4 py-3">이름</th>
              <th className="px-4 py-3">이메일</th>
              <th className="px-4 py-3 text-right">잔여뽈</th>
              <th className="px-4 py-3 text-right">남은 실결제</th>
              <th className="px-4 py-3 text-right">남은 보너스</th>
              <th className="px-4 py-3 text-right">총 충전</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-gray-400">로딩 중...</td>
              </tr>
            ) : !data || data.content.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-gray-400">데이터가 없습니다.</td>
              </tr>
            ) : (
              data.content.map((item, idx) => (
                <tr key={item.id} className={`border-b border-gray-100 transition-colors hover:bg-gray-50 ${idx % 2 === 1 ? "bg-gray-50/50" : ""}`}>
                  <td className="px-4 py-3 text-center text-gray-500">{page * (data?.size ?? 20) + idx + 1}</td>
                  <td className="px-4 py-3 text-gray-900 font-medium">{item.name}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{item.email}</td>
                  <td className="px-4 py-3 text-right font-medium tabular-nums" style={{ color: "var(--c-primary)" }}>{item.remainingBall.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-gray-900">{item.remainingPaid.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-gray-600">{item.remainingBonus.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-gray-500">{item.totalCharged.toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)}>
            이전
          </Button>
          <span className="text-sm text-gray-600">{page + 1} / {data.totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= data.totalPages - 1} onClick={() => setPage(page + 1)}>
            다음
          </Button>
        </div>
      )}
    </div>
  );
}
