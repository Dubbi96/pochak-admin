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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Search } from "lucide-react";
import type { Venue, VenueFilter, OwnerType, VenueType } from "@/types/venue";
import type { PageResponse } from "@/types/common";
import { getVenues, createVenue, updateVenue } from "@/services/operation-api";
import { adminApi } from "@/lib/api-client";

// ── Label Helpers ──────────────────────────────────────────────────────────────

const ownerTypeLabels: Record<OwnerType, string> = {
  B2B: "단체폐쇄(B2B)",
  B2G: "단체개방(B2G)",
  B2C: "일반(B2C)",
};

const venueTypeLabels: Record<VenueType, string> = {
  FIXED: "고정형",
  MOBILE: "유동형",
};

// ── Venue Modal ────────────────────────────────────────────────────────────────

interface VenueModalProps {
  open: boolean;
  onClose: () => void;
  venue: Venue | null;
  onSaved: () => void;
}

function VenueModal({ open, onClose, venue, onSaved }: VenueModalProps) {
  const [name, setName] = useState("");
  const [ownerType, setOwnerType] = useState<OwnerType>("B2C");
  const [venueType, setVenueType] = useState<VenueType>("FIXED");
  const [zipCode, setZipCode] = useState("");
  const [address, setAddress] = useState("");
  const [addressDetail, setAddressDetail] = useState("");
  const [districtCode, setDistrictCode] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [pixellotClubId, setPixellotClubId] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (venue) {
      setName(venue.name);
      setOwnerType(venue.ownerType);
      setVenueType(venue.venueType);
      setZipCode(venue.zipCode);
      setAddress(venue.address);
      setAddressDetail(venue.addressDetail);
      setDistrictCode(venue.districtCode);
      setLatitude(venue.latitude?.toString() ?? "");
      setLongitude(venue.longitude?.toString() ?? "");
      setQrCode(venue.qrCode ?? "");
      setPixellotClubId(venue.pixellotClubId ?? "");
      setIsActive(venue.isActive);
    } else {
      setName("");
      setOwnerType("B2C");
      setVenueType("FIXED");
      setZipCode("");
      setAddress("");
      setAddressDetail("");
      setDistrictCode("");
      setLatitude("");
      setLongitude("");
      setQrCode("");
      setPixellotClubId("");
      setIsActive(true);
    }
  }, [venue, open]);

  const handleSave = async () => {
    if (!name.trim() || !address.trim()) return;

    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        ownerType,
        venueType,
        zipCode: zipCode.trim(),
        address: address.trim(),
        addressDetail: addressDetail.trim(),
        districtCode: districtCode.trim(),
        latitude: latitude ? parseFloat(latitude) : undefined,
        longitude: longitude ? parseFloat(longitude) : undefined,
        qrCode: qrCode.trim() || undefined,
        pixellotClubId: pixellotClubId.trim() || undefined,
        isActive,
      };

      if (venue) {
        await updateVenue(venue.id, payload);
      } else {
        await createVenue(payload);
      }
      onSaved();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{venue ? "구장 수정" : "구장 등록"}</DialogTitle>
          <DialogDescription>
            {venue ? "구장 정보를 수정합니다." : "새로운 구장을 등록합니다."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* 구장 명 */}
          <div className="space-y-1.5">
            <Label>
              구장 명 <span className="text-red-500">*</span>
            </Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="구장 이름을 입력하세요"
            />
          </div>

          {/* 구분 & 종류 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>구분</Label>
              <Select value={ownerType} onValueChange={(v) => setOwnerType(v as OwnerType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="B2B">단체폐쇄(B2B)</SelectItem>
                  <SelectItem value="B2G">단체개방(B2G)</SelectItem>
                  <SelectItem value="B2C">일반(B2C)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>종류</Label>
              <Select value={venueType} onValueChange={(v) => setVenueType(v as VenueType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FIXED">고정형</SelectItem>
                  <SelectItem value="MOBILE">유동형</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 주소 */}
          <div className="space-y-1.5">
            <Label>
              주소 <span className="text-red-500">*</span>
            </Label>
            <div className="flex gap-2">
              <Input
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                placeholder="우편번호"
                className="w-[120px]"
              />
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="주소"
                className="flex-1"
              />
            </div>
            <Input
              value={addressDetail}
              onChange={(e) => setAddressDetail(e.target.value)}
              placeholder="상세주소"
            />
          </div>

          {/* 시/군/구 코드 */}
          <div className="space-y-1.5">
            <Label>시/군/구 코드</Label>
            <Input
              value={districtCode}
              onChange={(e) => setDistrictCode(e.target.value)}
              placeholder="시군구 코드"
              className="w-[200px]"
            />
          </div>

          {/* 위도 / 경도 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>위도</Label>
              <Input
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                placeholder="37.5683"
              />
            </div>
            <div className="space-y-1.5">
              <Label>경도</Label>
              <Input
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                placeholder="126.8975"
              />
            </div>
          </div>

          {/* QR 코드 */}
          <div className="space-y-1.5">
            <Label>QR 코드</Label>
            <Input
              value={qrCode}
              onChange={(e) => setQrCode(e.target.value)}
              placeholder="QR 코드 값"
            />
          </div>

          {/* Pixellot Club ID */}
          <div className="space-y-1.5">
            <Label>Pixellot Club ID</Label>
            <Input
              value={pixellotClubId}
              onChange={(e) => setPixellotClubId(e.target.value)}
              placeholder="PXL-CLUB-XXX"
            />
          </div>

          {/* 활성화 상태 */}
          <div className="space-y-1.5">
            <Label>활성화 상태</Label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsActive(!isActive)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${isActive ? "bg-emerald-500" : "bg-gray-200"}`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform ${isActive ? "translate-x-5" : "translate-x-0"}`}
                />
              </button>
              <span className="text-sm text-gray-600">
                {isActive ? "활성화" : "비활성화"}
              </span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            취소
          </Button>
          <Button onClick={handleSave} disabled={saving || !name.trim() || !address.trim()}>
            {saving ? "저장 중..." : "저장"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Venues List Page ───────────────────────────────────────────────────────────

export default function VenuesListPage() {
  const [data, setData] = useState<PageResponse<Venue> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);

  // Filters
  const [ownerTypeFilter, setOwnerTypeFilter] = useState("ALL");
  const [venueTypeFilter, setVenueTypeFilter] = useState("ALL");
  const [venueName, setVenueName] = useState("");
  const [cameraName, setCameraName] = useState("");

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVenue, setEditingVenue] = useState<Venue | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const filters: VenueFilter = {
        ownerType: ownerTypeFilter === "ALL" ? null : (ownerTypeFilter as OwnerType),
        venueType: venueTypeFilter === "ALL" ? null : (venueTypeFilter as VenueType),
        venueName: venueName || undefined,
        cameraName: cameraName || undefined,
      };

      // Try real API first, fall back to mock
      // TODO(Phase 4B): remove mock fallback once backend is stable
      const apiParams: Record<string, string> = { page: String(page) };
      if (filters.ownerType) apiParams.ownerType = filters.ownerType;
      if (filters.venueType) apiParams.venueType = filters.venueType;
      if (filters.venueName) apiParams.venueName = filters.venueName;
      if (filters.cameraName) apiParams.cameraName = filters.cameraName;

      const apiResult = await adminApi.get<PageResponse<Venue>>(
        "/admin/api/v1/venues",
        apiParams
      );
      if (apiResult) {
        setData(apiResult);
        return;
      }

      // Mock fallback
      const result = await getVenues(filters, page);
      setData(result);
    } finally {
      setLoading(false);
    }
  }, [ownerTypeFilter, venueTypeFilter, venueName, cameraName, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearch = () => {
    setPage(0);
    fetchData();
  };

  const handleRowClick = (venue: Venue) => {
    setEditingVenue(venue);
    setModalOpen(true);
  };

  const handleCreate = () => {
    setEditingVenue(null);
    setModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">구장 관리</h1>
        <Button onClick={handleCreate}>
          <Plus size={16} className="mr-1.5" />
          등록
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-end gap-4 rounded-lg border border-gray-200 bg-white p-4">
        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">구분</Label>
          <Select value={ownerTypeFilter} onValueChange={setOwnerTypeFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">전체</SelectItem>
              <SelectItem value="B2B">단체폐쇄(B2B)</SelectItem>
              <SelectItem value="B2G">단체개방(B2G)</SelectItem>
              <SelectItem value="B2C">일반(B2C)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">종류</Label>
          <Select value={venueTypeFilter} onValueChange={setVenueTypeFilter}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">전체</SelectItem>
              <SelectItem value="FIXED">고정형</SelectItem>
              <SelectItem value="MOBILE">유동형</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">구장 이름</Label>
          <Input
            value={venueName}
            onChange={(e) => setVenueName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="구장 이름"
            className="w-[180px]"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">카메라 이름</Label>
          <Input
            value={cameraName}
            onChange={(e) => setCameraName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="카메라 이름"
            className="w-[180px]"
          />
        </div>

        <Button variant="outline" size="icon" onClick={handleSearch}>
          <Search size={16} />
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-xs font-medium uppercase tracking-wider text-gray-500">
              <th className="px-4 py-3 text-center w-[60px]">NO</th>
              <th className="px-4 py-3">구장 명</th>
              <th className="px-4 py-3">단체 이름</th>
              <th className="px-4 py-3">지점 이름</th>
              <th className="px-4 py-3 text-center">종류</th>
              <th className="px-4 py-3 text-center">카메라</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                  로딩 중...
                </td>
              </tr>
            ) : !data || data.content.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                  데이터가 없습니다.
                </td>
              </tr>
            ) : (
              data.content.map((venue, idx) => (
                <tr
                  key={venue.id}
                  className={`border-b border-gray-100 transition-colors hover:bg-gray-50 cursor-pointer ${idx % 2 === 1 ? "bg-gray-50/50" : ""}`}
                  onClick={() => handleRowClick(venue)}
                >
                  <td className="px-4 py-3 text-center text-gray-500">
                    {page * (data?.size ?? 20) + idx + 1}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {venue.name}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {venue.organizationName ? (
                      <span>
                        {venue.organizationName}{" "}
                        <Badge variant="outline" className="ml-1 text-[10px]">
                          {ownerTypeLabels[venue.ownerType]}
                        </Badge>
                      </span>
                    ) : (
                      <span className="text-gray-300">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {venue.branchName || <span className="text-gray-300">-</span>}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant={venue.venueType === "FIXED" ? "info" : "warning"}>
                      {venueTypeLabels[venue.venueType]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge
                      variant={venue.cameraLinkStatus === "LINKED" ? "success" : "secondary"}
                    >
                      {venue.cameraLinkStatus === "LINKED" ? "연결됨" : "미연결"}
                    </Badge>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
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
            {page + 1} / {data.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= data.totalPages - 1}
            onClick={() => setPage(page + 1)}
          >
            다음
          </Button>
        </div>
      )}

      {/* Modal */}
      <VenueModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        venue={editingVenue}
        onSaved={fetchData}
      />
    </div>
  );
}
