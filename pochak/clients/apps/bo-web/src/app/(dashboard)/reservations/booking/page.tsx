"use client";

import React, { useState } from "react";
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

// ── Types ────────────────────────────────────────────────────────────

interface BookingEntry {
  id: number;
  venueName: string;
  ballCost: number;
  createdBy: string;
  createdAt: string;
  city: string;
  district: string;
  equipmentType: string;
}

// ── Mock Data ────────────────────────────────────────────────────────

const MOCK_BOOKINGS: BookingEntry[] = [
  { id: 1, venueName: "서울월드컵경기장 보조구장", ballCost: 500, createdBy: "관리자A", createdAt: "2026-03-20", city: "서울특별시", district: "마포구", equipmentType: "VPU-3000" },
  { id: 2, venueName: "부산아시아드 주경기장", ballCost: 800, createdBy: "관리자B", createdAt: "2026-03-18", city: "부산광역시", district: "연제구", equipmentType: "VPU-5000" },
  { id: 3, venueName: "대전한밭종합운동장", ballCost: 300, createdBy: "관리자A", createdAt: "2026-03-15", city: "대전광역시", district: "중구", equipmentType: "VPU-3000" },
  { id: 4, venueName: "인천축구전용경기장", ballCost: 600, createdBy: "관리자C", createdAt: "2026-03-12", city: "인천광역시", district: "남동구", equipmentType: "VPU-7000" },
  { id: 5, venueName: "광주월드컵경기장", ballCost: 450, createdBy: "관리자B", createdAt: "2026-03-10", city: "광주광역시", district: "서구", equipmentType: "VPU-3000" },
  { id: 6, venueName: "수원종합운동장", ballCost: 700, createdBy: "관리자A", createdAt: "2026-03-08", city: "경기도", district: "수원시", equipmentType: "VPU-5000" },
];

const CITY_DISTRICTS: Record<string, string[]> = {
  서울특별시: ["전체", "마포구", "강남구", "송파구", "종로구"],
  부산광역시: ["전체", "연제구", "해운대구", "수영구"],
  대전광역시: ["전체", "중구", "서구", "유성구"],
  인천광역시: ["전체", "남동구", "연수구", "부평구"],
  광주광역시: ["전체", "서구", "북구", "광산구"],
  경기도: ["전체", "수원시", "성남시", "용인시"],
};

const VENUE_OPTIONS = [
  "전체",
  ...MOCK_BOOKINGS.map((b) => b.venueName),
];

const EQUIPMENT_TYPES = ["전체", "VPU-3000", "VPU-5000", "VPU-7000"];

// ── Page ─────────────────────────────────────────────────────────────

export default function BookingPage() {
  const [page, setPage] = useState(0);
  const pageSize = 20;

  // Filters
  const [cityFilter, setCityFilter] = useState("ALL");
  const [districtFilter, setDistrictFilter] = useState("ALL");
  const [venueFilter, setVenueFilter] = useState("ALL");
  const [equipmentFilter, setEquipmentFilter] = useState("ALL");
  const [keyword, setKeyword] = useState("");

  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  // Available districts based on city
  const availableDistricts = cityFilter !== "ALL" ? CITY_DISTRICTS[cityFilter] ?? [] : [];

  // Filtered data
  const filtered = MOCK_BOOKINGS.filter((b) => {
    if (cityFilter !== "ALL" && b.city !== cityFilter) return false;
    if (districtFilter !== "ALL" && b.district !== districtFilter) return false;
    if (venueFilter !== "ALL" && b.venueName !== venueFilter) return false;
    if (equipmentFilter !== "ALL" && b.equipmentType !== equipmentFilter) return false;
    if (keyword && !b.venueName.toLowerCase().includes(keyword.toLowerCase())) return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageData = filtered.slice(page * pageSize, (page + 1) * pageSize);

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
          <Label className="text-xs text-gray-500">구장</Label>
          <Select value={venueFilter} onValueChange={setVenueFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {VENUE_OPTIONS.map((v) => (
                <SelectItem key={v} value={v === "전체" ? "ALL" : v}>
                  {v}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

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
            {pageData.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                  데이터가 없습니다.
                </td>
              </tr>
            ) : (
              pageData.map((booking, idx) => (
                <tr
                  key={booking.id}
                  className={`border-b border-gray-100 transition-colors hover:bg-gray-50 ${idx % 2 === 1 ? "bg-gray-50/50" : ""}`}
                >
                  <td className="px-4 py-3 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(booking.id)}
                      onChange={() => toggleOne(booking.id)}
                      className="rounded border-gray-300"
                    />
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">{booking.venueName}</td>
                  <td className="px-4 py-3 text-center font-medium text-emerald-600">
                    {booking.ballCost.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-center text-gray-600">{booking.createdBy}</td>
                  <td className="px-4 py-3 text-center text-gray-500 text-xs">{booking.createdAt}</td>
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
