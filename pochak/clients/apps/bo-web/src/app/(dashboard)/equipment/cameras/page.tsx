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
import type { Camera, CameraFilter } from "@/types/camera";
import type { PageResponse } from "@/types/common";
import { getCameras, createCamera } from "@/services/operation-api";
import { adminApi } from "@/lib/api-client";

// ── Camera Modal ───────────────────────────────────────────────────────────────

interface CameraModalProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

function CameraModal({ open, onClose, onSaved }: CameraModalProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState("PTZ");
  const [serialNumber, setSerialNumber] = useState("");
  const [isPanorama, setIsPanorama] = useState(false);
  const [pixellotId, setPixellotId] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setName("");
      setType("PTZ");
      setSerialNumber("");
      setIsPanorama(false);
      setPixellotId("");
    }
  }, [open]);

  const handleSave = async () => {
    if (!name.trim() || !serialNumber.trim()) return;

    setSaving(true);
    try {
      await createCamera({
        name: name.trim(),
        type,
        serialNumber: serialNumber.trim(),
        isPanorama,
        pixellotId: pixellotId.trim() || undefined,
      });
      onSaved();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>카메라 등록</DialogTitle>
          <DialogDescription>새로운 카메라를 등록합니다.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* 카메라명 */}
          <div className="space-y-1.5">
            <Label>
              카메라명 <span className="text-red-500">*</span>
            </Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="카메라명을 입력하세요"
            />
          </div>

          {/* 타입 */}
          <div className="space-y-1.5">
            <Label>장비 타입</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PTZ">PTZ</SelectItem>
                <SelectItem value="FIXED">FIXED</SelectItem>
                <SelectItem value="PANORAMA">PANORAMA</SelectItem>
                <SelectItem value="MOBILE">MOBILE</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 시리얼번호 */}
          <div className="space-y-1.5">
            <Label>
              시리얼번호 <span className="text-red-500">*</span>
            </Label>
            <Input
              value={serialNumber}
              onChange={(e) => setSerialNumber(e.target.value)}
              placeholder="SN-XXX-XXXXX"
            />
          </div>

          {/* 파노라마 여부 */}
          <div className="space-y-1.5">
            <Label>파노라마 여부</Label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsPanorama(!isPanorama)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${isPanorama ? "bg-emerald-500" : "bg-gray-200"}`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform ${isPanorama ? "translate-x-5" : "translate-x-0"}`}
                />
              </button>
              <span className="text-sm text-gray-600">
                {isPanorama ? "예" : "아니오"}
              </span>
            </div>
          </div>

          {/* Pixellot ID */}
          <div className="space-y-1.5">
            <Label>Pixellot ID</Label>
            <Input
              value={pixellotId}
              onChange={(e) => setPixellotId(e.target.value)}
              placeholder="PXL-CAM-XXX"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            취소
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || !name.trim() || !serialNumber.trim()}
          >
            {saving ? "저장 중..." : "저장"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Cameras List Page ──────────────────────────────────────────────────────────

export default function CamerasPage() {
  const [data, setData] = useState<PageResponse<Camera> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);

  // Filters
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [keyword, setKeyword] = useState("");

  // Modal
  const [modalOpen, setModalOpen] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const filters: CameraFilter = {
        type: typeFilter === "ALL" ? undefined : typeFilter,
        keyword: keyword || undefined,
      };

      // Try real API first, fall back to mock
      // TODO(Phase 4B): remove mock fallback once backend is stable
      const apiParams: Record<string, string> = { page: String(page) };
      if (typeFilter !== "ALL") apiParams.type = typeFilter;
      if (keyword) apiParams.keyword = keyword;

      const apiResult = await adminApi.get<PageResponse<Camera>>(
        "/admin/api/v1/equipment/cameras",
        apiParams
      );
      if (apiResult) {
        setData(apiResult);
        return;
      }

      // Mock fallback
      const result = await getCameras(filters, page);
      setData(result);
    } finally {
      setLoading(false);
    }
  }, [typeFilter, keyword, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearch = () => {
    setPage(0);
    fetchData();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">카메라 관리</h1>
        <Button onClick={() => setModalOpen(true)}>
          <Plus size={16} className="mr-1.5" />
          등록
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-end gap-4 rounded-lg border border-gray-200 bg-white p-4">
        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">장비 타입</Label>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">전체</SelectItem>
              <SelectItem value="PTZ">PTZ</SelectItem>
              <SelectItem value="FIXED">FIXED</SelectItem>
              <SelectItem value="PANORAMA">PANORAMA</SelectItem>
              <SelectItem value="MOBILE">MOBILE</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">카메라 이름 검색</Label>
          <div className="flex gap-2">
            <Input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="카메라 이름"
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
              <th className="px-4 py-3 text-center w-[60px]">NO</th>
              <th className="px-4 py-3">CAMERA ID</th>
              <th className="px-4 py-3">카메라 명</th>
              <th className="px-4 py-3">타입</th>
              <th className="px-4 py-3">구장 명</th>
              <th className="px-4 py-3">PIXELLOT_ID</th>
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
              data.content.map((camera, idx) => (
                <tr
                  key={camera.id}
                  className={`border-b border-gray-100 transition-colors hover:bg-gray-50 ${idx % 2 === 1 ? "bg-gray-50/50" : ""}`}
                >
                  <td className="px-4 py-3 text-center text-gray-500">
                    {page * (data?.size ?? 20) + idx + 1}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">
                    {camera.cameraId}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {camera.name}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline">{camera.type}</Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {camera.venueName || (
                      <span className="text-gray-300">미연결</span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">
                    {camera.pixellotId || (
                      <span className="text-gray-300">-</span>
                    )}
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
      <CameraModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={fetchData}
      />
    </div>
  );
}
