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
import { Plus, Search, Trash2 } from "lucide-react";
import type { PageResponse } from "@/types/common";
import {
  createNotice,
  updateNotice,
  deleteNotice,
  type Notice,
  type NoticeFilter,
  type NoticeCategory,
  type NoticeCreateRequest,
  type PublishStatus,
  NOTICE_CATEGORY_LABELS,
} from "@/services/site-api";
import { adminApi } from "@/lib/api-client";
import { useToast } from "@/lib/use-toast";

// ── Notice Modal ──────────────────────────────────────────────────

interface NoticeModalProps {
  open: boolean;
  onClose: () => void;
  notice: Notice | null;
  onSaved: () => void;
  onDelete: (id: number) => void;
}

function NoticeModal({ open, onClose, notice, onSaved, onDelete }: NoticeModalProps) {
  const [category, setCategory] = useState<NoticeCategory>("ALL");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState<PublishStatus>("PUBLISHED");
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (notice) {
      setCategory(notice.category);
      setTitle(notice.title);
      setContent(notice.content);
      setStartDate(notice.startDate);
      setEndDate(notice.endDate);
      setStatus(notice.status);
    } else {
      setCategory("ALL");
      setTitle("");
      setContent("");
      setStartDate("");
      setEndDate("");
      setStatus("PUBLISHED");
    }
  }, [notice, open]);

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      const payload: NoticeCreateRequest = {
        category,
        title: title.trim(),
        content: content.trim(),
        startDate,
        endDate,
        status,
      };
      if (notice) {
        await updateNotice(notice.id, payload);
        toast({ title: "공지사항이 수정되었습니다", variant: "default" });
      } else {
        await createNotice(payload);
        toast({ title: "공지사항이 등록되었습니다", variant: "default" });
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
          <DialogTitle>{notice ? "공지사항 수정" : "공지사항 등록"}</DialogTitle>
          <DialogDescription>
            {notice ? "공지사항을 수정합니다." : "새로운 공지사항을 등록합니다."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>구분 <span className="text-red-500">*</span></Label>
            <Select value={category} onValueChange={(v) => setCategory(v as NoticeCategory)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(NOTICE_CATEGORY_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>제목 <span className="text-red-500">*</span></Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="공지사항 제목을 입력하세요" />
          </div>

          <div className="space-y-1.5">
            <Label>내용</Label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="공지사항 내용을 입력하세요"
              className="flex min-h-[200px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
            />
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
          {notice ? (
            <Button
              variant="destructive"
              onClick={() => { onDelete(notice.id); onClose(); }}
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

// ── Notices List Page ─────────────────────────────────────────────

export default function NoticesPage() {
  const [data, setData] = useState<PageResponse<Notice> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);

  // Filters
  const [dateRange, setDateRange] = useState<DateRange>({ from: undefined, to: undefined });
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [searchKeyword, setSearchKeyword] = useState("");

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<Notice | null>(null);

  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const filters: NoticeFilter = {
        dateFrom: dateRange.from?.toISOString(),
        dateTo: dateRange.to?.toISOString(),
        status: statusFilter === "ALL" ? "ALL" : (statusFilter as PublishStatus),
        category: categoryFilter === "ALL" ? "ALL" : (categoryFilter as NoticeCategory),
        searchKeyword: searchKeyword || undefined,
      };

      const apiParams: Record<string, string> = { page: String(page) };
      if (statusFilter !== "ALL") apiParams.status = statusFilter;
      if (categoryFilter !== "ALL") apiParams.category = categoryFilter;
      if (filters.dateFrom) apiParams.dateFrom = filters.dateFrom;
      if (filters.dateTo) apiParams.dateTo = filters.dateTo;
      if (filters.searchKeyword) apiParams.searchKeyword = filters.searchKeyword;

      const apiResult = await adminApi.get<PageResponse<Notice>>(
        "/admin/api/v1/site/notices",
        apiParams
      );
      setData(apiResult);
    } finally {
      setLoading(false);
    }
  }, [dateRange, statusFilter, categoryFilter, searchKeyword, page]);

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
    setCategoryFilter("ALL");
    setSearchKeyword("");
    setPage(0);
  };

  const handleDeleteRequest = (id: number) => {
    const notice = data?.content.find((n) => n.id === id);
    if (notice) setDeleteTarget(notice);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deleteNotice(deleteTarget.id);
      toast({ title: "공지사항이 삭제되었습니다", variant: "default" });
      fetchData();
    } catch {
      toast({ title: "삭제에 실패했습니다", variant: "destructive" });
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleCreate = () => {
    setEditingNotice(null);
    setModalOpen(true);
  };

  const handleEdit = (notice: Notice) => {
    setEditingNotice(notice);
    setModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">공지사항 관리</h1>
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
          <Label className="text-xs text-gray-500">구분</Label>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(NOTICE_CATEGORY_LABELS).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">직접 검색</Label>
          <Input
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="제목 검색"
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

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-xs font-medium uppercase tracking-wider text-gray-500">
              <th className="px-4 py-3 text-center w-[60px]">NO</th>
              <th className="px-4 py-3 text-center">구분</th>
              <th className="px-4 py-3">제목</th>
              <th className="px-4 py-3 text-center">조회수</th>
              <th className="px-4 py-3 text-center">등록일</th>
              <th className="px-4 py-3 text-center">게시상태</th>
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
              data.content.map((notice, idx) => (
                <tr
                  key={notice.id}
                  className={`border-b border-gray-100 transition-colors hover:bg-gray-50 cursor-pointer ${idx % 2 === 1 ? "bg-gray-50/50" : ""}`}
                  onClick={() => handleEdit(notice)}
                >
                  <td className="px-4 py-3 text-center text-gray-500">
                    {page * (data?.size ?? 20) + idx + 1}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant="info">
                      {NOTICE_CATEGORY_LABELS[notice.category] ?? notice.category}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">{notice.title}</td>
                  <td className="px-4 py-3 text-center text-gray-500">
                    {notice.viewCount.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-center text-gray-500">{notice.createdAt}</td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant={notice.status === "PUBLISHED" ? "success" : "secondary"}>
                      {notice.status === "PUBLISHED" ? "게시" : "미게시"}
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
      <NoticeModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        notice={editingNotice}
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
