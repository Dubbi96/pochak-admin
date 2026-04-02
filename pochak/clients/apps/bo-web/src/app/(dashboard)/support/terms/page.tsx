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
import { Plus, Search } from "lucide-react";
import type { PageResponse } from "@/types/common";
import {
  getTermsList,
  createTerms,
  updateTerms,
  type Terms,
  type TermsFilter,
  type TermsCategory,
  type TermsCreateRequest,
  type PublishStatus,
  TERMS_CATEGORY_LABELS,
} from "@/services/site-api";
import { adminApi } from "@/lib/api-client";

// ── Terms Modal ───────────────────────────────────────────────────

interface TermsModalProps {
  open: boolean;
  onClose: () => void;
  terms: Terms | null;
  onSaved: () => void;
}

function TermsModal({ open, onClose, terms, onSaved }: TermsModalProps) {
  const [category, setCategory] = useState<TermsCategory>("SERVICE");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [version, setVersion] = useState(1);
  const [isRequired, setIsRequired] = useState(true);
  const [status, setStatus] = useState<PublishStatus>("PUBLISHED");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (terms) {
      setCategory(terms.category);
      setTitle(terms.title);
      setContent(terms.content);
      setVersion(terms.version);
      setIsRequired(terms.isRequired);
      setStatus(terms.status);
    } else {
      setCategory("SERVICE");
      setTitle("");
      setContent("");
      setVersion(1);
      setIsRequired(true);
      setStatus("PUBLISHED");
    }
  }, [terms, open]);

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      const payload: TermsCreateRequest = {
        category,
        title: title.trim(),
        content: content.trim(),
        version,
        isRequired,
        status,
      };
      if (terms) {
        await updateTerms(terms.id, payload);
      } else {
        await createTerms(payload);
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
          <DialogTitle>{terms ? "약관 수정" : "약관 등록"}</DialogTitle>
          <DialogDescription>
            {terms ? "약관 정보를 수정합니다." : "새로운 약관을 등록합니다."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>구분 <span className="text-red-500">*</span></Label>
            <Select value={category} onValueChange={(v) => setCategory(v as TermsCategory)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(TERMS_CATEGORY_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>제목 <span className="text-red-500">*</span></Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="약관 제목을 입력하세요" />
          </div>

          <div className="space-y-1.5">
            <Label>내용</Label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="약관 내용을 입력하세요"
              className="flex min-h-[200px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>버전</Label>
              <Input
                type="number"
                min={1}
                value={version}
                onChange={(e) => setVersion(parseInt(e.target.value, 10) || 1)}
              />
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

          <div className="space-y-1.5">
            <Label>필수여부</Label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsRequired(!isRequired)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${isRequired ? "bg-emerald-500" : "bg-gray-200"}`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform ${isRequired ? "translate-x-5" : "translate-x-0"}`}
                />
              </button>
              <span className="text-sm text-gray-600">
                {isRequired ? "필수" : "선택"}
              </span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>취소</Button>
          <Button onClick={handleSave} disabled={saving || !title.trim()}>
            {saving ? "저장 중..." : "저장"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Terms List Page ───────────────────────────────────────────────

export default function TermsPage() {
  const [data, setData] = useState<PageResponse<Terms> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);

  // Filters
  const [dateRange, setDateRange] = useState<DateRange>({ from: undefined, to: undefined });
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [searchKeyword, setSearchKeyword] = useState("");

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTerms, setEditingTerms] = useState<Terms | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const filters: TermsFilter = {
        dateFrom: dateRange.from?.toISOString(),
        dateTo: dateRange.to?.toISOString(),
        category: categoryFilter === "ALL" ? "ALL" : (categoryFilter as TermsCategory),
        searchKeyword: searchKeyword || undefined,
      };

      // Try real API first, fall back to mock
      // TODO(Phase 4B): remove mock fallback once backend is stable
      const apiParams: Record<string, string> = { page: String(page) };
      if (categoryFilter !== "ALL") apiParams.category = categoryFilter;
      if (filters.dateFrom) apiParams.dateFrom = filters.dateFrom;
      if (filters.dateTo) apiParams.dateTo = filters.dateTo;
      if (filters.searchKeyword) apiParams.searchKeyword = filters.searchKeyword;

      const apiResult = await adminApi.get<PageResponse<Terms>>(
        "/admin/api/v1/support/terms",
        apiParams
      );
      if (apiResult) {
        setData(apiResult);
        return;
      }

      // Mock fallback
      const result = await getTermsList(filters, page);
      setData(result);
    } finally {
      setLoading(false);
    }
  }, [dateRange, categoryFilter, searchKeyword, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearch = () => {
    setPage(0);
    fetchData();
  };

  const handleReset = () => {
    setDateRange({ from: undefined, to: undefined });
    setCategoryFilter("ALL");
    setSearchKeyword("");
  };

  const handleCreate = () => {
    setEditingTerms(null);
    setModalOpen(true);
  };

  const handleEdit = (terms: Terms) => {
    setEditingTerms(terms);
    setModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">약관 관리</h1>
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
          <Label className="text-xs text-gray-500">구분</Label>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">전체</SelectItem>
              {Object.entries(TERMS_CATEGORY_LABELS).map(([k, v]) => (
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
              <th className="px-4 py-3 text-center">버전</th>
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
              data.content.map((terms, idx) => (
                <tr
                  key={terms.id}
                  className={`border-b border-gray-100 transition-colors hover:bg-gray-50 cursor-pointer ${idx % 2 === 1 ? "bg-gray-50/50" : ""}`}
                  onClick={() => handleEdit(terms)}
                >
                  <td className="px-4 py-3 text-center text-gray-500">
                    {page * (data?.size ?? 20) + idx + 1}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant="info">
                      {TERMS_CATEGORY_LABELS[terms.category] ?? terms.category}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">{terms.title}</td>
                  <td className="px-4 py-3 text-center text-gray-600">v{terms.version}</td>
                  <td className="px-4 py-3 text-center text-gray-500">{terms.createdAt}</td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant={terms.status === "PUBLISHED" ? "success" : "secondary"}>
                      {terms.status === "PUBLISHED" ? "게시" : "미게시"}
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
      <TermsModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        terms={editingTerms}
        onSaved={fetchData}
      />
    </div>
  );
}
