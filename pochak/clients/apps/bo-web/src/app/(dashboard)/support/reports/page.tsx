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
import { Search, Flag } from "lucide-react";
import type { PageResponse } from "@/types/common";
import {
  actionReport,
  type Report,
  type ReportFilter,
  type ReportStatus,
  type ReportCategory,
  REPORT_STATUS_LABELS,
  REPORT_CATEGORY_LABELS,
} from "@/services/support-api";
import { adminApi } from "@/lib/api-client";

// ── Status Badge ───────────────────────────────────────────────────

function reportStatusVariant(
  status: ReportStatus
): "default" | "success" | "secondary" | "destructive" | "warning" {
  switch (status) {
    case "PENDING":
      return "warning";
    case "REVIEWING":
      return "default";
    case "RESOLVED":
      return "success";
    case "DISMISSED":
      return "secondary";
  }
}

// ── Detail Modal ───────────────────────────────────────────────────

interface ReportModalProps {
  open: boolean;
  onClose: () => void;
  report: Report | null;
  onSaved: () => void;
}

function ReportModal({ open, onClose, report, onSaved }: ReportModalProps) {
  const [adminNote, setAdminNote] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (report) {
      setAdminNote(report.adminNote ?? "");
    }
  }, [report, open]);

  const handleAction = async (status: ReportStatus) => {
    if (!report) return;
    setSaving(true);
    try {
      await actionReport(report.id, {
        status,
        adminNote: adminNote.trim(),
      });
      onSaved();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  if (!report) return null;

  const isResolved =
    report.status === "RESOLVED" || report.status === "DISMISSED";

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>신고 상세</DialogTitle>
          <DialogDescription>
            신고 내용을 검토하고 처리합니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm">
            <div>
              <span className="text-gray-500">신고자</span>
              <p className="font-medium">{report.reporterUsername}</p>
            </div>
            <div>
              <span className="text-gray-500">대상</span>
              <p className="font-medium">
                {report.targetType} · {report.targetName}
              </p>
            </div>
            <div>
              <span className="text-gray-500">신고유형</span>
              <p className="font-medium">
                {REPORT_CATEGORY_LABELS[report.category]}
              </p>
            </div>
            <div>
              <span className="text-gray-500">상태</span>
              <Badge variant={reportStatusVariant(report.status)}>
                {REPORT_STATUS_LABELS[report.status]}
              </Badge>
            </div>
            <div>
              <span className="text-gray-500">접수일시</span>
              <p className="font-medium">
                {new Date(report.createdAt).toLocaleString("ko-KR")}
              </p>
            </div>
            {report.resolvedAt && (
              <div>
                <span className="text-gray-500">처리일시</span>
                <p className="font-medium">
                  {new Date(report.resolvedAt).toLocaleString("ko-KR")}
                </p>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <Label className="text-xs text-gray-500">신고 사유</Label>
            <div className="mt-1 rounded-md border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
              {report.description}
            </div>
          </div>

          {/* Admin Note */}
          <div className="space-y-1.5">
            <Label>처리 메모</Label>
            <Textarea
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              placeholder="처리 내역, 제재 내용 등을 기록하세요."
              rows={4}
              disabled={isResolved}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          {!isResolved && (
            <>
              <Button
                variant="outline"
                onClick={() => handleAction("REVIEWING")}
                disabled={saving || report.status === "REVIEWING"}
              >
                검토중으로 변경
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleAction("DISMISSED")}
                disabled={saving}
              >
                기각
              </Button>
              <Button
                onClick={() => handleAction("RESOLVED")}
                disabled={saving}
              >
                {saving ? "처리 중..." : "처리 완료"}
              </Button>
            </>
          )}
          <Button variant="outline" onClick={onClose}>
            닫기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Main Page ──────────────────────────────────────────────────────

export default function ReportsPage() {
  const [data, setData] = useState<PageResponse<Report> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);

  const [statusFilter, setStatusFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [targetTypeFilter, setTargetTypeFilter] = useState("ALL");
  const [searchKeyword, setSearchKeyword] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const filters: ReportFilter = {
        status:
          statusFilter === "ALL" ? null : (statusFilter as ReportStatus),
        category:
          categoryFilter === "ALL"
            ? null
            : (categoryFilter as ReportCategory),
        targetType:
          targetTypeFilter === "ALL" ? null : targetTypeFilter,
        searchKeyword: searchKeyword || undefined,
      };

      const apiParams: Record<string, string> = { page: String(page) };
      if (filters.status) apiParams.status = filters.status;
      if (filters.category) apiParams.category = filters.category;
      if (filters.targetType) apiParams.targetType = filters.targetType;
      if (filters.searchKeyword) apiParams.searchKeyword = filters.searchKeyword;

      const apiResult = await adminApi.get<PageResponse<Report>>(
        "/admin/api/v1/support/reports",
        apiParams
      );
      setData(apiResult);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, categoryFilter, targetTypeFilter, searchKeyword, page]);

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
    setTargetTypeFilter("ALL");
    setSearchKeyword("");
  };

  const handleRowClick = (report: Report) => {
    setSelectedReport(report);
    setModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">신고 관리</h1>
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
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">전체</SelectItem>
              <SelectItem value="PENDING">접수</SelectItem>
              <SelectItem value="REVIEWING">검토중</SelectItem>
              <SelectItem value="RESOLVED">처리완료</SelectItem>
              <SelectItem value="DISMISSED">기각</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">신고유형</Label>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[130px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">전체</SelectItem>
              <SelectItem value="ABUSE">욕설/혐오</SelectItem>
              <SelectItem value="SPAM">스팸/광고</SelectItem>
              <SelectItem value="ILLEGAL">불법콘텐츠</SelectItem>
              <SelectItem value="INAPPROPRIATE">부적절한내용</SelectItem>
              <SelectItem value="OTHER">기타</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">대상유형</Label>
          <Select value={targetTypeFilter} onValueChange={setTargetTypeFilter}>
            <SelectTrigger className="w-[110px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">전체</SelectItem>
              <SelectItem value="USER">회원</SelectItem>
              <SelectItem value="CONTENT">콘텐츠</SelectItem>
              <SelectItem value="COMMENT">댓글</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">직접 검색</Label>
          <Input
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="신고자/대상/내용"
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
              <th className="px-4 py-3 text-center w-[90px]">유형</th>
              <th className="px-4 py-3 text-center w-[70px]">대상</th>
              <th className="px-4 py-3">신고 대상</th>
              <th className="px-4 py-3 text-center w-[100px]">신고자</th>
              <th className="px-4 py-3 text-center w-[90px]">상태</th>
              <th className="px-4 py-3 text-center w-[150px]">접수일시</th>
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
              data.content.map((report, idx) => (
                <tr
                  key={report.id}
                  className={`border-b border-gray-100 transition-colors hover:bg-gray-50 cursor-pointer ${
                    idx % 2 === 1 ? "bg-gray-50/50" : ""
                  }`}
                  onClick={() => handleRowClick(report)}
                >
                  <td className="px-4 py-3 text-center text-gray-500">
                    {page * (data?.size ?? 20) + idx + 1}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center gap-1 text-xs text-gray-600">
                      <Flag size={12} />
                      {REPORT_CATEGORY_LABELS[report.category]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-xs text-gray-500">
                    {report.targetType === "USER"
                      ? "회원"
                      : report.targetType === "CONTENT"
                      ? "콘텐츠"
                      : "댓글"}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {report.targetName}
                    <p className="text-xs text-gray-400 mt-0.5 font-normal">
                      {report.description.slice(0, 50)}
                      {report.description.length > 50 ? "..." : ""}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-center text-gray-600">
                    {report.reporterUsername}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant={reportStatusVariant(report.status)}>
                      {REPORT_STATUS_LABELS[report.status]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-center text-gray-500 text-xs whitespace-nowrap">
                    {new Date(report.createdAt).toLocaleString("ko-KR", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
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
      <ReportModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        report={selectedReport}
        onSaved={fetchData}
      />
    </div>
  );
}
