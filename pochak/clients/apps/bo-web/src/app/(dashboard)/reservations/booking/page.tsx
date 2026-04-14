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
import { Plus, Search } from "lucide-react";
import { getBookingVenues } from "@/services/reservation-admin-api";
import type { BookingVenue } from "@/services/reservation-admin-api";

// ── Constants ────────────────────────────────────────────────────────

const CITY_DISTRICTS: Record<string, string[]> = {
  서울특별시: ["마포구", "강남구", "송파구", "종로구"],
  부산광역시: ["연제구", "해운대구", "수영구"],
  대전광역시: ["중구", "서구", "유성구"],
  인천광역시: ["남동구", "연수구", "부평구"],
  광주광역시: ["서구", "북구", "광산구"],
  경기도: ["수원시", "성남시", "용인시"],
};

const EQUIPMENT_TYPES = ["전체", "VPU-3000", "VPU-5000", "VPU-7000"];

// ── Page ─────────────────────────────────────────────────────────────

export default function BookingPage() {
  const [page, setPage] = useState(0);
  const pageSize = 20;

  // API state
  const [venues, setVenues] = useState<BookingVenue[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [cityFilter, setCityFilter] = useState("ALL");
  const [districtFilter, setDistrictFilter] = useState("ALL");
  const [equipmentFilter, setEquipmentFilter] = useState("ALL");
  const [keyword, setKeyword] = useState("");

  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  // Available districts based on city
  const availableDistricts = cityFilter !== "ALL" ? CITY_DISTRICTS[cityFilter] ?? [] : [];

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const district = districtFilter !== "ALL" ? districtFilter : cityFilter !== "ALL" ? cityFilter : undefined;
      const result = await getBookingVenues(
        {
          district,
          equipmentType: equipmentFilter !== "ALL" ? equipmentFilter : undefined,
          searchKeyword: keyword || undefined,
        },
        page,
        pageSize
      );
      setVenues(result.content);
      setTotalPages(Math.max(1, result.totalPages));
    } catch {
      setError("데이터를 불러오지 못했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, [cityFilter, districtFilter, equipmentFilter, keyword, page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const pageData = venues;

  const toggleAll = () => {
    if (selectedIds.size === pageData.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(pageData.map((b) => b.id)));
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

  const handleCityChange = (value: string) => {
    setCityFilter(value);
    setDistrictFilter("ALL");
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">촬영예약(뽈)</h1>
        <Button>
          <Plus size={16} className="mr-1.5" />
          등록
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-end gap-4 rounded-lg border border-gray-200 bg-white p-4">
        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">시/도</Label>
          <Select value={cityFilter} onValueChange={handleCityChange}>
            <SelectTrigger className="w-[130px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">전체</SelectItem>
              {Object.keys(CITY_DISTRICTS).map((city) => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {cityFilter !== "ALL" && (
          <div className="space-y-1.5">
            <Label className="text-xs text-gray-500">시/군/구</Label>
            <Select value={districtFilter} onValueChange={setDistrictFilter}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">전체</SelectItem>
                {availableDistricts
                  .filter((d) => d !== "전체")
                  .map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">장비타입</Label>
          <Select value={equipmentFilter} onValueChange={setEquipmentFilter}>
            <SelectTrigger className="w-[130px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {EQUIPMENT_TYPES.map((t) => (
                <SelectItem key={t} value={t === "전체" ? "ALL" : t}>
                  {t}
                </SelectItem>
              ))}
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
              placeholder="구장명 검색"
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
              <th className="px-4 py-3">구장명</th>
              <th className="px-4 py-3 text-center w-[100px]">금액(뽈)</th>
              <th className="px-4 py-3 text-center w-[100px]">등록자</th>
              <th className="px-4 py-3 text-center w-[120px]">등록일자</th>
              <th className="px-4 py-3 text-center w-[80px]">관리</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-gray-400">로딩 중...</td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-red-400">{error}</td>
              </tr>
            ) : pageData.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                  데이터가 없습니다.
                </td>
              </tr>
            ) : (
              pageData.map((venue, idx) => (
                <tr
                  key={venue.id}
                  className={`border-b border-gray-100 transition-colors hover:bg-gray-50 ${idx % 2 === 1 ? "bg-gray-50/50" : ""}`}
                >
                  <td className="px-4 py-3 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(venue.id)}
                      onChange={() => toggleOne(venue.id)}
                      className="rounded border-gray-300"
                    />
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">{venue.venueName}</td>
                  <td className="px-4 py-3 text-center font-medium text-emerald-600">
                    {venue.ballCost.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-center text-gray-600">{venue.registeredBy}</td>
                  <td className="px-4 py-3 text-center text-gray-500 text-xs">{venue.registeredAt}</td>
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
