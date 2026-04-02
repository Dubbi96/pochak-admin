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
import {
  DateRangePicker,
  type DateRange,
} from "@/components/filter/date-range-picker";
import { Plus, Search, GripVertical, Trash2 } from "lucide-react";
import { FileUpload } from "@/components/common/file-upload";
import type { PageResponse } from "@/types/common";
import {
  createBanner,
  updateBanner,
  updateBannerOrders,
  deleteBanner,
  type Banner,
  type BannerFilter,
  type BannerCreateRequest,
  type PublishStatus,
} from "@/services/site-api";
import { adminApi } from "@/lib/api-client";
import { useToast } from "@/lib/use-toast";

// ── Banner Modal ──────────────────────────────────────────────────

interface BannerModalProps {
  open: boolean;
  onClose: () => void;
  banner: Banner | null;
  onSaved: () => void;
  onDelete: (id: number) => void;
}

function BannerModal({ open, onClose, banner, onSaved, onDelete }: BannerModalProps) {
  const [title, setTitle] = useState("");
  const [pcImageUrl, setPcImageUrl] = useState("");
  const [mobileImageUrl, setMobileImageUrl] = useState("");
  const [pcImageFile, setPcImageFile] = useState<File | null>(null);
  const [mobileImageFile, setMobileImageFile] = useState<File | null>(null);
  const [linkUrl, setLinkUrl] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState<PublishStatus>("PUBLISHED");
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (banner) {
      setTitle(banner.title);
      setPcImageUrl(banner.pcImageUrl);
      setMobileImageUrl(banner.mobileImageUrl);
      setLinkUrl(banner.linkUrl);
      setStartDate(banner.startDate);
      setEndDate(banner.endDate);
      setStatus(banner.status);
    } else {
      setTitle("");
      setPcImageUrl("");
      setMobileImageUrl("");
      setLinkUrl("");
      setStartDate("");
      setEndDate("");
      setStatus("PUBLISHED");
    }
  }, [banner, open]);

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      const payload: BannerCreateRequest = {
        title: title.trim(),
        pcImageUrl: pcImageUrl.trim(),
        mobileImageUrl: mobileImageUrl.trim(),
        linkUrl: linkUrl.trim(),
        startDate,
        endDate,
        status,
      };
      if (banner) {
        await updateBanner(banner.id, payload);
        toast({ title: "배너가 수정되었습니다", variant: "default" });
      } else {
        await createBanner(payload);
        toast({ title: "배너가 등록되었습니다", variant: "default" });
      }
      onSaved();
      onClose();
    } catch {
      toast({ title: "저장에 실패했습니다", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{banner ? "배너 수정" : "배너 등록"}</DialogTitle>
          <DialogDescription>
            {banner ? "배너 정보를 수정합니다." : "새로운 배너를 등록합니다."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>제목 <span className="text-red-500">*</span></Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="배너 제목을 입력하세요" />
          </div>

          <FileUpload
            label="PC 이미지"
            currentUrl={pcImageUrl || undefined}
            description="권장 사이즈: 1920x400px"
            onChange={(file, previewUrl) => {
              setPcImageFile(file);
              // Phase 8: mock — use preview URL until S3 upload is wired
              setPcImageUrl(previewUrl ?? "");
            }}
          />

          <FileUpload
            label="모바일 이미지"
            currentUrl={mobileImageUrl || undefined}
            description="권장 사이즈: 750x400px"
            onChange={(file, previewUrl) => {
              setMobileImageFile(file);
              // Phase 8: mock — use preview URL until S3 upload is wired
              setMobileImageUrl(previewUrl ?? "");
            }}
          />

          <div className="space-y-1.5">
            <Label>링크 URL</Label>
            <Input value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="https://" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>시작일</Label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>종료일</Label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>게시상태</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as PublishStatus)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PUBLISHED">게시</SelectItem>
                <SelectItem value="UNPUBLISHED">미게시</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="flex justify-between sm:justify-between">
          {banner ? (
            <Button
              variant="destructive"
              onClick={() => { onDelete(banner.id); onClose(); }}
            >
              <Trash2 size={14} className="mr-1.5" />
              삭제
            </Button>
          ) : <div />}
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>취소</Button>
            <Button onClick={handleSave} disabled={saving || !title.trim()}>
              {saving ? "저장 중..." : "저장"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Delete Confirmation Dialog ────────────────────────────────────

function DeleteConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
}) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>삭제 확인</DialogTitle>
          <DialogDescription>
            &ldquo;{title}&rdquo;을(를) 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>취소</Button>
          <Button variant="destructive" onClick={onConfirm}>삭제</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Banners List Page ─────────────────────────────────────────────

export default function BannersPage() {
  const [data, setData] = useState<PageResponse<Banner> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);

  // Filters
  const [dateRange, setDateRange] = useState<DateRange>({ from: undefined, to: undefined });
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchKeyword, setSearchKeyword] = useState("");

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);

  // Order editing
  const [orderEdits, setOrderEdits] = useState<Record<number, number>>({});

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<Banner | null>(null);

  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const filters: BannerFilter = {
        dateFrom: dateRange.from?.toISOString(),
        dateTo: dateRange.to?.toISOString(),
        status: statusFilter === "ALL" ? "ALL" : (statusFilter as PublishStatus),
        searchKeyword: searchKeyword || undefined,
      };

      const apiParams: Record<string, string> = { page: String(page) };
      if (statusFilter !== "ALL") apiParams.status = statusFilter;
      if (filters.dateFrom) apiParams.dateFrom = filters.dateFrom;
      if (filters.dateTo) apiParams.dateTo = filters.dateTo;
      if (filters.searchKeyword) apiParams.searchKeyword = filters.searchKeyword;

      const apiResult = await adminApi.get<PageResponse<Banner>>(
        "/admin/api/v1/site/banners",
        apiParams
      );
      setData(apiResult);
      setOrderEdits({});
    } finally {
      setLoading(false);
    }
  }, [dateRange, statusFilter, searchKeyword, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearch = () => {
    setPage(0);
    fetchData();
  };

  const handleReset = () => {
    setDateRange({ from: undefined, to: undefined });
    setStatusFilter("ALL");
    setSearchKeyword("");
    setPage(0);
  };

  const handleDeleteRequest = (id: number) => {
    const banner = data?.content.find((b) => b.id === id);
    if (banner) setDeleteTarget(banner);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deleteBanner(deleteTarget.id);
      toast({ title: "배너가 삭제되었습니다", variant: "default" });
      fetchData();
    } catch {
      toast({ title: "삭제에 실패했습니다", variant: "destructive" });
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleCreate = () => {
    setEditingBanner(null);
    setModalOpen(true);
  };

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setModalOpen(true);
  };

  const handleOrderChange = (id: number, value: string) => {
    const num = parseInt(value, 10);
    if (!isNaN(num) && num > 0) {
      setOrderEdits((prev) => ({ ...prev, [id]: num }));
    }
  };

  const handleApplyOrders = async () => {
    if (!data) return;
    const orders = data.content.map((b) => ({
      id: b.id,
      order: orderEdits[b.id] ?? b.order,
    }));
    await updateBannerOrders(orders);
    fetchData();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">배너 관리</h1>
        <Button onClick={handleCreate}>
          <Plus size={16} className="mr-1.5" />
          등록
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-end gap-4 rounded-lg border border-gray-200 bg-white p-4">
        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">등록일자</Label>
          <DateRangePicker value={dateRange} onChange={setDateRange} />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">게시상태</Label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">전체</SelectItem>
              <SelectItem value="PUBLISHED">게시</SelectItem>
              <SelectItem value="UNPUBLISHED">미게시</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">직접 검색</Label>
          <Input
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="배너 제목 검색"
            className="w-[200px]"
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

      {/* Order Apply Button */}
      {Object.keys(orderEdits).length > 0 && (
        <div className="flex justify-end">
          <Button onClick={handleApplyOrders} variant="outline">
            순서 적용
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-xs font-medium uppercase tracking-wider text-gray-500">
              <th className="px-4 py-3 text-center w-[80px]">순서</th>
              <th className="px-4 py-3 text-center w-[60px]">NO</th>
              <th className="px-4 py-3">제목</th>
              <th className="px-4 py-3 text-center">이미지(PC)</th>
              <th className="px-4 py-3 text-center">이미지(모바일)</th>
              <th className="px-4 py-3 text-center">노출기간</th>
              <th className="px-4 py-3 text-center">게시상태</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                  로딩 중...
                </td>
              </tr>
            ) : !data || data.content.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                  데이터가 없습니다.
                </td>
              </tr>
            ) : (
              data.content.map((banner, idx) => (
                <tr
                  key={banner.id}
                  className={`border-b border-gray-100 transition-colors hover:bg-gray-50 cursor-pointer ${idx % 2 === 1 ? "bg-gray-50/50" : ""}`}
                  onClick={() => handleEdit(banner)}
                >
                  <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-center gap-1">
                      <GripVertical size={14} className="text-gray-300" />
                      <Input
                        type="number"
                        min={1}
                        value={orderEdits[banner.id] ?? banner.order}
                        onChange={(e) => handleOrderChange(banner.id, e.target.value)}
                        className="w-[50px] h-7 text-center text-xs"
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center text-gray-500">
                    {page * (data?.size ?? 20) + idx + 1}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">{banner.title}</td>
                  <td className="px-4 py-3 text-center text-gray-500 text-xs truncate max-w-[120px]">
                    {banner.pcImageUrl ? banner.pcImageUrl.split("/").pop() : "-"}
                  </td>
                  <td className="px-4 py-3 text-center text-gray-500 text-xs truncate max-w-[120px]">
                    {banner.mobileImageUrl ? banner.mobileImageUrl.split("/").pop() : "-"}
                  </td>
                  <td className="px-4 py-3 text-center text-gray-500 whitespace-nowrap text-xs">
                    {banner.startDate} ~ {banner.endDate}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant={banner.status === "PUBLISHED" ? "success" : "secondary"}>
                      {banner.status === "PUBLISHED" ? "게시" : "미게시"}
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
          <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)}>
            이전
          </Button>
          <span className="text-sm text-gray-600">{page + 1} / {data.totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= data.totalPages - 1} onClick={() => setPage(page + 1)}>
            다음
          </Button>
        </div>
      )}

      {/* Modal */}
      <BannerModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        banner={editingBanner}
        onSaved={fetchData}
        onDelete={handleDeleteRequest}
      />

      {/* Delete Confirmation */}
      <DeleteConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title={deleteTarget?.title ?? ""}
      />
    </div>
  );
}
