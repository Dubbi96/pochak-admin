"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Plus, Search, Bell } from "lucide-react";
import {
  createPushCampaign,
  cancelPushCampaign,
  type PushCampaign,
  type PushCampaignStatus,
  type PushCampaignCreateRequest,
  PUSH_STATUS_LABELS,
} from "@/services/site-api";
import { adminApi } from "@/lib/api-client";
import type { PageResponse } from "@/types/common";
import { useToast } from "@/lib/use-toast";

// ── Status Badge ──────────────────────────────────────────────────

const STATUS_VARIANT: Record<PushCampaignStatus, "default" | "secondary" | "outline" | "destructive"> = {
  DRAFT: "outline",
  SCHEDULED: "secondary",
  SENT: "default",
  CANCELLED: "destructive",
};

function StatusBadge({ status }: { status: PushCampaignStatus }) {
  return (
    <Badge variant={STATUS_VARIANT[status]}>
      {PUSH_STATUS_LABELS[status]}
    </Badge>
  );
}

// ── Cancel Confirmation Dialog ────────────────────────────────────

function CancelConfirmDialog({
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
          <DialogTitle>캠페인 취소 확인</DialogTitle>
          <DialogDescription>
            &ldquo;{title}&rdquo; 캠페인을 취소하시겠습니까? 이 작업은 되돌릴 수 없습니다.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>닫기</Button>
          <Button variant="destructive" onClick={onConfirm}>취소</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Create Dialog ─────────────────────────────────────────────────

function CreateCampaignDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}) {
  const [form, setForm] = useState<PushCampaignCreateRequest>({
    title: "",
    body: "",
    target: "ALL",
    scheduledAt: "",
    linkUrl: "",
  });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.body.trim()) {
      toast({ title: "제목과 내용을 입력해주세요.", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      await createPushCampaign(form);
      toast({ title: "캠페인이 생성되었습니다", variant: "default" });
      onOpenChange(false);
      onCreated();
      setForm({ title: "", body: "", target: "ALL", scheduledAt: "", linkUrl: "" });
    } catch {
      toast({ title: "캠페인 생성에 실패했습니다", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>푸시 캠페인 생성</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">제목</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="캠페인 제목을 입력하세요"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="body">내용</Label>
            <Textarea
              id="body"
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              placeholder="푸시 알림 내용을 입력하세요"
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label>대상</Label>
            <Select
              value={form.target}
              onValueChange={(v) => setForm({ ...form, target: v as "ALL" | "SEGMENT" })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">전체 사용자</SelectItem>
                <SelectItem value="SEGMENT">세그먼트</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="scheduledAt">예약 발송 시간</Label>
            <Input
              id="scheduledAt"
              type="datetime-local"
              value={form.scheduledAt}
              onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="linkUrl">링크 URL (선택)</Label>
            <Input
              id="linkUrl"
              value={form.linkUrl}
              onChange={(e) => setForm({ ...form, linkUrl: e.target.value })}
              placeholder="https://..."
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? "저장 중..." : "생성"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Page ──────────────────────────────────────────────────────────

export default function PushCampaignsPage() {
  const [data, setData] = useState<PageResponse<PushCampaign> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState<PushCampaignStatus | "ALL">("ALL");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  // Cancel confirmation
  const [cancelTarget, setCancelTarget] = useState<PushCampaign | null>(null);

  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const apiParams: Record<string, string> = { page: String(page) };
      if (statusFilter !== "ALL") apiParams.status = statusFilter;
      if (searchKeyword) apiParams.searchKeyword = searchKeyword;

      const apiResult = await adminApi.get<PageResponse<PushCampaign>>(
        "/admin/api/v1/site/push-campaigns",
        apiParams
      );
      setData(apiResult);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchKeyword, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCancelRequest = (campaign: PushCampaign) => {
    setCancelTarget(campaign);
  };

  const handleCancelConfirm = async () => {
    if (!cancelTarget) return;
    try {
      await cancelPushCampaign(cancelTarget.id);
      toast({ title: "캠페인이 취소되었습니다", variant: "default" });
      fetchData();
    } catch {
      toast({ title: "캠페인 취소에 실패했습니다", variant: "destructive" });
    } finally {
      setCancelTarget(null);
    }
  };

  const campaigns = data?.content ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell size={20} className="text-gray-700" />
          <h1 className="text-xl font-bold text-gray-900">푸시 캠페인</h1>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus size={16} className="mr-1.5" />
          캠페인 생성
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="flex items-center gap-4 py-4">
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v as PushCampaignStatus | "ALL"); setPage(0); }}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="상태" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">전체 상태</SelectItem>
              <SelectItem value="DRAFT">임시저장</SelectItem>
              <SelectItem value="SCHEDULED">예약</SelectItem>
              <SelectItem value="SENT">발송완료</SelectItem>
              <SelectItem value="CANCELLED">취소</SelectItem>
            </SelectContent>
          </Select>
          <div className="relative flex-1 max-w-[300px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              className="pl-9"
              placeholder="캠페인 제목 검색"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { setPage(0); fetchData(); } }}
            />
          </div>
          <Button size="sm" variant="outline" onClick={() => { setPage(0); fetchData(); }}>
            검색
          </Button>
        </CardContent>
      </Card>

      {/* Campaign Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-xs font-medium uppercase tracking-wider text-gray-500">
                  <th className="px-4 py-3 text-center w-[60px]">NO</th>
                  <th className="px-4 py-3">제목</th>
                  <th className="px-4 py-3">대상</th>
                  <th className="px-4 py-3 text-center">예약 시간</th>
                  <th className="px-4 py-3 text-right">발송 수</th>
                  <th className="px-4 py-3 text-right">오픈율</th>
                  <th className="px-4 py-3 text-center">상태</th>
                  <th className="px-4 py-3 text-center w-[100px]">관리</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-gray-400">
                      로딩 중...
                    </td>
                  </tr>
                ) : campaigns.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-gray-400">
                      캠페인이 없습니다.
                    </td>
                  </tr>
                ) : (
                  campaigns.map((c, idx) => (
                    <tr
                      key={c.id}
                      className={`border-b border-gray-100 transition-colors hover:bg-gray-50 ${idx % 2 === 1 ? "bg-gray-50/50" : ""}`}
                    >
                      <td className="px-4 py-3 text-center text-gray-500">
                        {page * (data?.size ?? 20) + idx + 1}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{c.title}</div>
                        <div className="text-xs text-gray-400 mt-0.5 truncate max-w-[300px]">{c.body}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {c.target === "ALL" ? "전체" : "세그먼트"}
                      </td>
                      <td className="px-4 py-3 text-center text-gray-500 text-xs">
                        {c.scheduledAt || "-"}
                      </td>
                      <td className="px-4 py-3 text-right font-medium">
                        {c.sentCount !== null ? c.sentCount.toLocaleString() : "-"}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-600">
                        {c.openRate !== null ? `${c.openRate}%` : "-"}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <StatusBadge status={c.status} />
                      </td>
                      <td className="px-4 py-3 text-center">
                        {(c.status === "DRAFT" || c.status === "SCHEDULED") && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-500 hover:text-red-600"
                            onClick={() => handleCancelRequest(c)}
                          >
                            취소
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

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

      {/* Create Dialog */}
      <CreateCampaignDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onCreated={fetchData}
      />

      {/* Cancel Confirmation Dialog */}
      <CancelConfirmDialog
        open={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        onConfirm={handleCancelConfirm}
        title={cancelTarget?.title ?? ""}
      />
    </div>
  );
}
