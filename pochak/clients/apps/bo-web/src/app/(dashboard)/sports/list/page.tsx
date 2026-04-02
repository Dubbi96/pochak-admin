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
import { Plus, Search, X, GripVertical, Image as ImageIcon } from "lucide-react";
import { FileUpload } from "@/components/common/file-upload";
import type { Sport } from "@/types/sport";
import type { PageResponse } from "@/types/common";
import {
  createSport,
  updateSport,
  updateSportOrder,
} from "@/services/content-api";
import { adminApi } from "@/lib/api-client";

// ── Sport Modal ────────────────────────────────────────────────────────────────

interface SportModalProps {
  open: boolean;
  onClose: () => void;
  sport: Sport | null;
  onSaved: () => void;
}

function SportModal({ open, onClose, sport, onSaved }: SportModalProps) {
  const [name, setName] = useState("");
  const [sportCode, setSportCode] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isActive, setIsActive] = useState(true);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (sport) {
      setName(sport.name);
      setSportCode(sport.sportCode);
      setImageUrl(sport.imageUrl || "");
      setIsActive(sport.isActive);
      setTags(sport.tags.map((t) => t.name));
    } else {
      setName("");
      setSportCode("");
      setImageUrl("");
      setIsActive(true);
      setTags([]);
    }
    setTagInput("");
  }, [sport, open]);

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing) return; // Korean IME composing — skip to avoid duplicate
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSave = async () => {
    if (!name.trim() || !sportCode.trim()) return;

    setSaving(true);
    try {
      const payload = {
        id: sport?.id ?? 0,
        name: name.trim(),
        sportCode: sportCode.trim().toUpperCase(),
        imageUrl: imageUrl.trim() || undefined,
        isActive,
        tags,
      };

      if (sport) {
        await updateSport(sport.id, payload);
      } else {
        await createSport(payload);
      }
      onSaved();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{sport ? "종목 수정" : "종목 등록"}</DialogTitle>
          <DialogDescription>
            {sport ? "종목 정보를 수정합니다." : "새로운 종목을 등록합니다."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* 종목명 */}
          <div className="space-y-1.5">
            <Label>
              종목명 <span className="text-red-500">*</span>
            </Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="종목명을 입력하세요"
            />
          </div>

          {/* 스포츠 코드 */}
          <div className="space-y-1.5">
            <Label>
              스포츠 코드 <span className="text-red-500">*</span>
            </Label>
            <Input
              value={sportCode}
              onChange={(e) => setSportCode(e.target.value.toUpperCase())}
              placeholder="영문 대문자 코드 (예: SOCCER)"
            />
          </div>

          {/* 이미지 업로드 */}
          {/* TODO: 추후 백엔드 S3 업로드 API 연동 시, file을 FormData로 전송하고 반환된 URL을 setImageUrl에 저장할 것 */}
          <FileUpload
            label="이미지"
            currentUrl={imageUrl || undefined}
            description="종목 아이콘 이미지"
            onChange={(file, previewUrl) => {
              setImageFile(file);
              setImageUrl(previewUrl ?? "");
            }}
          />

          {/* 게시 상태 */}
          <div className="space-y-1.5">
            <Label>게시 상태</Label>
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

          {/* 태그 관리 */}
          <div className="space-y-1.5">
            <Label>태그 관리</Label>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder="태그 입력 후 Enter"
                className="flex-1"
              />
              <Button type="button" size="sm" variant="outline" onClick={handleAddTag}>
                추가
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1 pr-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-0.5 rounded-full p-0.5 hover:bg-gray-300"
                    >
                      <X size={12} />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            취소
          </Button>
          <Button onClick={handleSave} disabled={saving || !name.trim() || !sportCode.trim()}>
            {saving ? "저장 중..." : "저장"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Sports List Page ───────────────────────────────────────────────────────────

export default function SportsListPage() {
  const [data, setData] = useState<PageResponse<Sport> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [keyword, setKeyword] = useState("");

  // Order editing
  const [orderMap, setOrderMap] = useState<Record<number, number>>({});
  const [orderChanged, setOrderChanged] = useState(false);

  const [error, setError] = useState<string | null>(null);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSport, setEditingSport] = useState<Sport | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const apiParams: Record<string, string> = { page: String(page) };
      if (statusFilter !== "ALL") apiParams.isActive = statusFilter === "ACTIVE" ? "true" : "false";
      if (keyword) apiParams.keyword = keyword;

      const apiResult = await adminApi.get<PageResponse<Sport>>(
        "/admin/api/v1/sports",
        apiParams
      );
      if (apiResult) {
        setData(apiResult);
        const map: Record<number, number> = {};
        apiResult.content.forEach((s) => { map[s.id] = s.displayOrder; });
        setOrderMap(map);
        setOrderChanged(false);
      }
    } catch {
      setError("데이터를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, keyword, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearch = () => {
    setPage(0);
    fetchData();
  };

  const handleOrderChange = (id: number, value: string) => {
    const num = parseInt(value, 10);
    if (!isNaN(num) && num > 0) {
      setOrderMap({ ...orderMap, [id]: num });
      setOrderChanged(true);
    }
  };

  const handleSaveOrder = async () => {
    const items = Object.entries(orderMap).map(([id, order]) => ({
      id: parseInt(id, 10),
      displayOrder: order,
    }));
    await updateSportOrder({ items });
    fetchData();
  };

  const handleRowClick = (sport: Sport) => {
    setEditingSport(sport);
    setModalOpen(true);
  };

  const handleCreate = () => {
    setEditingSport(null);
    setModalOpen(true);
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">종목 관리</h1>
        <Button onClick={handleCreate}>
          <Plus size={16} className="mr-1.5" />
          등록
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex flex-wrap items-end gap-4 rounded-lg border border-gray-200 bg-white p-4">
        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">게시 상태</Label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
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
          <Label className="text-xs text-gray-500">종목명 검색</Label>
          <div className="flex gap-2">
            <Input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="종목명"
              className="w-[200px]"
            />
            <Button variant="outline" size="icon" onClick={handleSearch}>
              <Search size={16} />
            </Button>
          </div>
        </div>
      </div>

      {/* Order Save Button */}
      {orderChanged && (
        <div className="flex justify-end">
          <Button onClick={handleSaveOrder} variant="secondary">
            순서 적용
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-xs font-medium uppercase tracking-wider text-gray-500">
              <th className="px-4 py-3 text-center w-[70px]">순서</th>
              <th className="px-4 py-3 text-center w-[60px]">NO</th>
              <th className="px-4 py-3">스포츠 코드</th>
              <th className="px-4 py-3">종목명</th>
              <th className="px-4 py-3 text-center w-[80px]">이미지</th>
              <th className="px-4 py-3 text-center">태그</th>
              <th className="px-4 py-3">등록자</th>
              <th className="px-4 py-3">등록 일자</th>
              <th className="px-4 py-3 text-center">게시상태</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} className="px-4 py-12 text-center text-gray-400">
                  로딩 중...
                </td>
              </tr>
            ) : !data || data.content.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-12 text-center text-gray-400">
                  데이터가 없습니다.
                </td>
              </tr>
            ) : (
              data.content.map((sport, idx) => (
                <tr
                  key={sport.id}
                  className={`border-b border-gray-100 transition-colors hover:bg-gray-50 cursor-pointer ${idx % 2 === 1 ? "bg-gray-50/50" : ""}`}
                  onClick={() => handleRowClick(sport)}
                >
                  <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-center gap-1">
                      <GripVertical size={14} className="text-gray-300" />
                      <Input
                        value={orderMap[sport.id] ?? sport.displayOrder}
                        onChange={(e) => handleOrderChange(sport.id, e.target.value)}
                        className="h-7 w-12 text-center text-xs"
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center text-gray-500">
                    {page * (data?.size ?? 20) + idx + 1}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">
                    {sport.sportCode}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {sport.name}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {sport.imageUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={sport.imageUrl}
                        alt={sport.name}
                        className="mx-auto h-8 w-8 rounded object-cover"
                      />
                    ) : (
                      <ImageIcon size={16} className="mx-auto text-gray-300" />
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {sport.tags.length > 0 ? (
                      <Badge variant="info">{sport.tags.length}개</Badge>
                    ) : (
                      <span className="text-gray-300">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{sport.createdBy}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {formatDate(sport.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant={sport.isActive ? "success" : "secondary"}>
                      {sport.isActive ? "활성화" : "비활성화"}
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
      <SportModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        sport={editingSport}
        onSaved={fetchData}
      />
    </div>
  );
}
