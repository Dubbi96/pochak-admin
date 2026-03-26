"use client";

import React, { useState } from "react";
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
import { Search, Eye } from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────

type ReportStatus = "RECEIVED" | "RESOLVED" | "REJECTED";
type ReportType = "SPAM" | "ABUSE" | "INAPPROPRIATE" | "COPYRIGHT" | "OTHER";

interface CommunityReport {
  id: number;
  status: ReportStatus;
  reportType: ReportType;
  postTitle: string;
  reporterName: string;
  receivedAt: string;
  handlerName: string | null;
  handledAt: string | null;
}

// ── Constants ────────────────────────────────────────────────────────

const REPORT_STATUS_LABELS: Record<ReportStatus, string> = {
  RECEIVED: "접수",
  RESOLVED: "처리완료",
  REJECTED: "거절",
};

const REPORT_STATUS_VARIANTS: Record<ReportStatus, "warning" | "success" | "secondary"> = {
  RECEIVED: "warning",
  RESOLVED: "success",
  REJECTED: "secondary",
};

const REPORT_TYPE_LABELS: Record<ReportType, string> = {
  SPAM: "스팸/광고",
  ABUSE: "욕설/비방",
  INAPPROPRIATE: "부적절 콘텐츠",
  COPYRIGHT: "저작권 침해",
  OTHER: "기타",
};

// ── Mock Data ────────────────────────────────────────────────────────

const MOCK_REPORTS: CommunityReport[] = [
  {
    id: 1, status: "RECEIVED", reportType: "SPAM",
    postTitle: "00 아카데미 홍보 게시물", reporterName: "김민수",
    receivedAt: "2026-03-22", handlerName: null, handledAt: null,
  },
  {
    id: 2, status: "RESOLVED", reportType: "ABUSE",
    postTitle: "경기 후기 댓글 관련", reporterName: "이수진",
    receivedAt: "2026-03-20", handlerName: "관리자A", handledAt: "2026-03-21",
  },
  {
    id: 3, status: "RECEIVED", reportType: "INAPPROPRIATE",
    postTitle: "부적절한 이미지 포함 게시물", reporterName: "박정호",
    receivedAt: "2026-03-19", handlerName: null, handledAt: null,
  },
  {
    id: 4, status: "REJECTED", reportType: "COPYRIGHT",
    postTitle: "하이라이트 영상 무단 전재 의심", reporterName: "최예린",
    receivedAt: "2026-03-18", handlerName: "관리자B", handledAt: "2026-03-19",
  },
  {
    id: 5, status: "RESOLVED", reportType: "OTHER",
    postTitle: "허위 구인 게시글 신고", reporterName: "정태우",
    receivedAt: "2026-03-15", handlerName: "관리자A", handledAt: "2026-03-16",
  },
];

// ── Page Component ───────────────────────────────────────────────────

export default function CommunityReportsPage() {
  const [reports] = useState<CommunityReport[]>(MOCK_REPORTS);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [reportTypeFilter, setReportTypeFilter] = useState("ALL");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const filteredReports = reports.filter((r) => {
    if (statusFilter !== "ALL" && r.status !== statusFilter) return false;
    if (reportTypeFilter !== "ALL" && r.reportType !== reportTypeFilter) return false;
    if (dateFrom && r.receivedAt < dateFrom) return false;
    if (dateTo && r.receivedAt > dateTo) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">커뮤니티 신고 관리</h1>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-end gap-4 rounded-lg border border-gray-200 bg-white p-4">
        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">상태</Label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">전체</SelectItem>
              <SelectItem value="RECEIVED">접수</SelectItem>
              <SelectItem value="RESOLVED">처리완료</SelectItem>
              <SelectItem value="REJECTED">거절</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">신고유형</Label>
          <Select value={reportTypeFilter} onValueChange={setReportTypeFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">전체</SelectItem>
              <SelectItem value="SPAM">스팸/광고</SelectItem>
              <SelectItem value="ABUSE">욕설/비방</SelectItem>
              <SelectItem value="INAPPROPRIATE">부적절 콘텐츠</SelectItem>
              <SelectItem value="COPYRIGHT">저작권 침해</SelectItem>
              <SelectItem value="OTHER">기타</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">접수일 (기간)</Label>
          <div className="flex items-center gap-2">
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-[140px]"
            />
            <span className="text-gray-400">~</span>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-[140px]"
            />
          </div>
        </div>

        <Button
          variant="outline"
          onClick={() => {
            setStatusFilter("ALL");
            setReportTypeFilter("ALL");
            setDateFrom("");
            setDateTo("");
          }}
        >
          초기화
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-xs font-medium uppercase tracking-wider text-gray-500">
              <th className="px-4 py-3 text-center w-[60px]">NO</th>
              <th className="px-4 py-3 text-center">상태</th>
              <th className="px-4 py-3">신고유형</th>
              <th className="px-4 py-3">게시물 제목</th>
              <th className="px-4 py-3">신고자</th>
              <th className="px-4 py-3">접수일</th>
              <th className="px-4 py-3">처리자</th>
              <th className="px-4 py-3">처리일</th>
            </tr>
          </thead>
          <tbody>
            {filteredReports.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-gray-400">
                  데이터가 없습니다.
                </td>
              </tr>
            ) : (
              filteredReports.map((report, idx) => (
                <tr
                  key={report.id}
                  className={`border-b border-gray-100 transition-colors hover:bg-gray-50 ${idx % 2 === 1 ? "bg-gray-50/50" : ""}`}
                >
                  <td className="px-4 py-3 text-center text-gray-500">{idx + 1}</td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant={REPORT_STATUS_VARIANTS[report.status]}>
                      {REPORT_STATUS_LABELS[report.status]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {REPORT_TYPE_LABELS[report.reportType]}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">{report.postTitle}</td>
                  <td className="px-4 py-3 text-gray-600">{report.reporterName}</td>
                  <td className="px-4 py-3 text-gray-500">{report.receivedAt}</td>
                  <td className="px-4 py-3 text-gray-600">{report.handlerName ?? "-"}</td>
                  <td className="px-4 py-3 text-gray-500">{report.handledAt ?? "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
