"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
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
import { Search, MessageSquare } from "lucide-react";
import type { PageResponse } from "@/types/common";
import {
  getInquiries,
  replyToInquiry,
  updateInquiryStatus,
  type Inquiry,
  type InquiryFilter,
  type InquiryStatus,
  type InquiryCategory,
  INQUIRY_STATUS_LABELS,
  INQUIRY_CATEGORY_LABELS,
} from "@/services/support-api";
import { adminApi } from "@/lib/api-client";

// ── Status Badge Variant ───────────────────────────────────────────

function inquiryStatusVariant(
  status: InquiryStatus
): "default" | "success" | "secondary" | "destructive" | "warning" {
  switch (status) {
    case "PENDING":
      return "warning";
    case "IN_PROGRESS":
      return "default";
    case "RESOLVED":
      return "success";
    case "CLOSED":
      return "secondary";
  }
}

// ── Detail Modal ───────────────────────────────────────────────────

interface InquiryModalProps {
  open: boolean;
  onClose: () => void;
  inquiry: Inquiry | null;
  onSaved: () => void;
}

function InquiryModal({ open, onClose, inquiry, onSaved }: InquiryModalProps) {
  const [reply, setReply] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (inquiry) {
      setReply(inquiry.adminReply ?? "");
    }
  }, [inquiry, open]);

  const handleReply = async () => {
    if (!inquiry || !reply.trim()) return;
    setSaving(true);
    try {
      await replyToInquiry(inquiry.id, { reply: reply.trim() });
      onSaved();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const handleClose = async () => {
    if (!inquiry) return;
    setSaving(true);
    try {
      await updateInquiryStatus(inquiry.id, "CLOSED");
      onSaved();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  if (!inquiry) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>1:1 문의 상세</DialogTitle>
          <DialogDescription>
            문의 내용 확인 및 답변을 작성합니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm">
            <div>
              <span className="text-gray-500">회원ID</span>
              <p className="font-medium">{inquiry.username}</p>
            </div>
            <div>
              <span className="text-gray-500">분류</span>
              <p className="font-medium">
                {INQUIRY_CATEGORY_LABELS[inquiry.category]}
              </p>
            </div>
            <div>
              <span className="text-gray-500">상태</span>
              <Badge variant={inquiryStatusVariant(inquiry.status)}>
                {INQUIRY_STATUS_LABELS[inquiry.status]}
              </Badge>
            </div>
            <div>
              <span className="text-gray-500">접수일시</span>
              <p className="font-medium">
                {new Date(inquiry.createdAt).toLocaleString("ko-KR")}
              </p>
            </div>
          </div>

          {/* Title */}
          <div>
            <Label className="text-xs text-gray-500">제목</Label>
            <p className="mt-1 text-sm font-medium text-gray-900">
              {inquiry.title}
            </p>
          </div>

          {/* Content */}
          <div>
            <Label className="text-xs text-gray-500">문의 내용</Label>
            <div className="mt-1 rounded-md border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700 whitespace-pre-wrap">
              {inquiry.content}
            </div>
          </div>

          {/* Reply */}
          <div className="space-y-1.5">
            <Label>
              관리자 답변{" "}
              <span className="text-red-500">*</span>
            </Label>
            <Textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="회원에게 전달할 답변을 입력하세요."
              rows={5}
              disabled={inquiry.status === "CLOSED"}
            />
            {inquiry.repliedAt && (
              <p className="text-xs text-gray-400">
                마지막 답변:{" "}
                {new Date(inquiry.repliedAt).toLocaleString("ko-KR")}
              </p>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2">
          {inquiry.status !== "CLOSED" && (
            <Button variant="outline" onClick={handleClose} disabled={saving}>
              종료 처리
            </Button>
          )}
          <Button variant="outline" onClick={onClose}>
            취소
          </Button>
          <Button
            onClick={handleReply}
            disabled={saving || !reply.trim() || inquiry.status === "CLOSED"}
          >
            {saving ? "저장 중..." : "답변 저장"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Main Page ──────────────────────────────────────────────────────

export default function InquiriesPage() {
  const [data, setData] = useState<PageResponse<Inquiry> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);

  const [statusFilter, setStatusFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [searchKeyword, setSearchKeyword] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const filters: InquiryFilter = {
        status:
          statusFilter === "ALL" ? null : (statusFilter as InquiryStatus),
        category:
          categoryFilter === "ALL"
            ? null
            : (categoryFilter as InquiryCategory),
        searchKeyword: searchKeyword || undefined,
      };

      // Try real API first, fall back to mock
      // TODO(Phase 4B): remove mock fallback once backend is stable
      const apiParams: Record<string, string> = { page: String(page) };
      if (filters.status) apiParams.status = filters.status;
      if (filters.category) apiParams.category = filters.category;
      if (filters.searchKeyword) apiParams.searchKeyword = filters.searchKeyword;

      const apiResult = await adminApi.get<PageResponse<Inquiry>>(
        "/admin/api/v1/support/inquiries",
        apiParams
      );
      if (apiResult) {
        setData(apiResult);
        return;
      }

      // Mock fallback
      const result = await getInquiries(filters, page);
      setData(result);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, categoryFilter, searchKeyword, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearch = () => {
    setPage(0);
    fetchData();
  };

  const handleReset = () => {
    setStatusFilter("ALL");
    setCategoryFilter("ALL");
    setSearchKeyword("");
  };

  const handleRowClick = (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry);
    setModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">1:1 문의</h1>
        {data && (
          <span className="text-sm text-gray-500">
            전체 {data.totalElements}건
          </span>
        )}
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-end gap-4 rounded-lg border border-gray-200 bg-white p-4">
        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">처리상태</Label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[130px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">전체</SelectItem>
              <SelectItem value="PENDING">대기</SelectItem>
              <SelectItem value="IN_PROGRESS">처리중</SelectItem>
              <SelectItem value="RESOLVED">처리완료</SelectItem>
              <SelectItem value="CLOSED">종료</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">문의유형</Label>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">전체</SelectItem>
              <SelectItem value="ACCOUNT">계정</SelectItem>
              <SelectItem value="PAYMENT">결제</SelectItem>
              <SelectItem value="CONTENT">콘텐츠</SelectItem>
              <SelectItem value="TECHNICAL">기술</SelectItem>
              <SelectItem value="OTHER">기타</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">직접 검색</Label>
          <Input
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="회원ID, 제목 검색"
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
              <th className="px-4 py-3 text-center w-[80px]">유형</th>
              <th className="px-4 py-3">제목</th>
              <th className="px-4 py-3 text-center w-[100px]">회원ID</th>
              <th className="px-4 py-3 text-center w-[90px]">상태</th>
              <th className="px-4 py-3 text-center w-[150px]">접수일시</th>
              <th className="px-4 py-3 text-center w-[60px]">답변</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-12 text-center text-gray-400"
                >
                  로딩 중...
                </td>
              </tr>
            ) : !data || data.content.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-12 text-center text-gray-400"
                >
                  데이터가 없습니다.
                </td>
              </tr>
            ) : (
              data.content.map((inquiry, idx) => (
                <tr
                  key={inquiry.id}
                  className={`border-b border-gray-100 transition-colors hover:bg-gray-50 cursor-pointer ${
                    idx % 2 === 1 ? "bg-gray-50/50" : ""
                  }`}
                  onClick={() => handleRowClick(inquiry)}
                >
                  <td className="px-4 py-3 text-center text-gray-500">
                    {page * (data?.size ?? 20) + idx + 1}
                  </td>
                  <td className="px-4 py-3 text-center text-gray-600 text-xs">
                    {INQUIRY_CATEGORY_LABELS[inquiry.category]}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {inquiry.title}
                  </td>
                  <td className="px-4 py-3 text-center text-gray-600">
                    {inquiry.username}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant={inquiryStatusVariant(inquiry.status)}>
                      {INQUIRY_STATUS_LABELS[inquiry.status]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-center text-gray-500 text-xs whitespace-nowrap">
                    {new Date(inquiry.createdAt).toLocaleString("ko-KR", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {inquiry.adminReply ? (
                      <MessageSquare
                        size={16}
                        className="mx-auto text-emerald-500"
                      />
                    ) : (
                      <MessageSquare
                        size={16}
                        className="mx-auto text-gray-300"
                      />
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
      <InquiryModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        inquiry={selectedInquiry}
        onSaved={fetchData}
      />
    </div>
  );
}
