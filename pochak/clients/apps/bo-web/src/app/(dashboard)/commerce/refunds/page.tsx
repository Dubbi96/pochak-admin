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
import { Search, CheckCircle, XCircle, Eye } from "lucide-react";
import type { PageResponse } from "@/types/common";
import {
  approveRefund,
  getRefunds,
  rejectRefund,
  REFUND_CATEGORY_LABELS,
  REFUND_KIND_LABELS,
  REFUND_STATUS_LABELS,
  type Refund,
  type RefundFilter,
  type RefundCategory,
  type RefundKind,
  type RefundStatus,
} from "@/services/commerce-admin-api";

const STATUS_BADGE_VARIANT: Record<string, "warning" | "success" | "destructive"> = {
  REQUESTED: "warning",
  COMPLETED: "success",
  REJECTED: "destructive",
};

export default function RefundsPage() {
  const [data, setData] = useState<PageResponse<Refund> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);

  // Filters
  const [category, setCategory] = useState<RefundCategory>("ALL");
  const [kind, setKind] = useState<RefundKind>("ALL");
  const [status, setStatus] = useState<RefundStatus>("ALL");
  const [searchKeyword, setSearchKeyword] = useState("");

  // Process dialog
  const [processOpen, setProcessOpen] = useState(false);
  const [processRefund, setProcessRefund] = useState<Refund | null>(null);
  const [processAction, setProcessAction] = useState<"approve" | "reject">("approve");
  const [rejectReason, setRejectReason] = useState("");
  const [processing, setProcessing] = useState(false);

  // Detail dialog
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailRefund, setDetailRefund] = useState<Refund | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const filters: RefundFilter = {
        category,
        kind,
        status,
        searchKeyword: searchKeyword || undefined,
      };

      const apiResult = await getRefunds(
        {
          category,
          kind,
          status,
          searchKeyword: filters.searchKeyword,
        },
        page,
        20
      );
      setData(apiResult);
    } finally {
      setLoading(false);
    }
  }, [category, kind, status, searchKeyword, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearch = () => {
    setPage(0);
    fetchData();
  };

  const handleReset = () => {
    setCategory("ALL");
    setKind("ALL");
    setStatus("ALL");
    setSearchKeyword("");
  };

  const openProcessDialog = (refund: Refund, action: "approve" | "reject") => {
    setProcessRefund(refund);
    setProcessAction(action);
    setRejectReason("");
    setProcessOpen(true);
  };

  const handleProcess = async () => {
    if (!processRefund) return;
    setProcessing(true);
    try {
      if (processAction === "approve") {
        await approveRefund(processRefund.id);
      } else {
        await rejectRefund(processRefund.id, rejectReason || undefined);
      }
      setProcessOpen(false);
      fetchData();
    } finally {
      setProcessing(false);
    }
  };

  const openDetail = (refund: Refund) => {
    setDetailRefund(refund);
    setDetailOpen(true);
  };

  // Summary stats
  const requestedCount = data?.content.filter((r) => r.status === "REQUESTED").length ?? 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">환불 관리</h1>
          {requestedCount > 0 && (
            <p className="mt-1 text-sm text-amber-600">처리 대기 {requestedCount}건</p>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-end gap-4 rounded-lg border border-gray-200 bg-white p-4">
        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">구분</Label>
          <Select value={category} onValueChange={(v) => setCategory(v as RefundCategory)}>
            <SelectTrigger className="w-[130px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">전체</SelectItem>
              <SelectItem value="CHARGE_REFUND">충전환불</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">종류</Label>
          <Select value={kind} onValueChange={(v) => setKind(v as RefundKind)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">전체</SelectItem>
              <SelectItem value="BALL">뽈</SelectItem>
              <SelectItem value="SEASON_PASS">시즌권</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">접수상태</Label>
          <Select value={status} onValueChange={(v) => setStatus(v as RefundStatus)}>
            <SelectTrigger className="w-[130px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">전체</SelectItem>
              <SelectItem value="REQUESTED">환불신청</SelectItem>
              <SelectItem value="COMPLETED">환불완료</SelectItem>
              <SelectItem value="REJECTED">거절</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">직접검색</Label>
          <Input
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="접수자 이름 검색"
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
              <th className="px-4 py-3 text-center">상태</th>
              <th className="px-4 py-3 text-center">구분</th>
              <th className="px-4 py-3 text-center">종류</th>
              <th className="px-4 py-3 text-right">금액(뽈)</th>
              <th className="px-4 py-3 text-right">금액(원)</th>
              <th className="px-4 py-3">접수자</th>
              <th className="px-4 py-3 text-center">접수일자</th>
              <th className="px-4 py-3">처리자</th>
              <th className="px-4 py-3 text-center">처리일자</th>
              <th className="px-4 py-3 text-center w-[140px]">처리</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={11} className="px-4 py-12 text-center text-gray-400">
                  로딩 중...
                </td>
              </tr>
            ) : !data || data.content.length === 0 ? (
              <tr>
                <td colSpan={11} className="px-4 py-12 text-center text-gray-400">
                  데이터가 없습니다.
                </td>
              </tr>
            ) : (
              data.content.map((item, idx) => (
                <tr
                  key={item.id}
                  className={`border-b border-gray-100 transition-colors hover:bg-gray-50 ${idx % 2 === 1 ? "bg-gray-50/50" : ""} ${item.status === "REQUESTED" ? "bg-amber-50/30" : ""}`}
                >
                  <td className="px-4 py-3 text-center text-gray-500">
                    {page * (data?.size ?? 20) + idx + 1}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant={STATUS_BADGE_VARIANT[item.status]}>
                      {REFUND_STATUS_LABELS[item.status]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-center text-gray-600">
                    {REFUND_CATEGORY_LABELS[item.category]}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant="outline">{REFUND_KIND_LABELS[item.kind]}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right font-medium tabular-nums text-gray-900">
                    {item.amount.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-gray-600">
                    {item.wonAmount.toLocaleString()}원
                  </td>
                  <td className="px-4 py-3 text-gray-900">{item.requesterName}</td>
                  <td className="px-4 py-3 text-center text-gray-500">{item.requestedAt}</td>
                  <td className="px-4 py-3 text-gray-500">{item.processorName ?? "-"}</td>
                  <td className="px-4 py-3 text-center text-gray-500">{item.processedAt ?? "-"}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openDetail(item)}
                        title="상세"
                      >
                        <Eye size={14} />
                      </Button>
                      {item.status === "REQUESTED" && (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-emerald-600 hover:text-emerald-700"
                            onClick={() => openProcessDialog(item, "approve")}
                            title="승인"
                          >
                            <CheckCircle size={14} />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-500 hover:text-red-700"
                            onClick={() => openProcessDialog(item, "reject")}
                            title="거절"
                          >
                            <XCircle size={14} />
                          </Button>
                        </>
                      )}
                    </div>
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

      {/* Refund Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>환불 상세 정보</DialogTitle>
          </DialogHeader>
          {detailRefund && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">접수자</p>
                  <p className="text-sm font-medium text-gray-900">{detailRefund.requesterName}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">이메일</p>
                  <p className="text-sm text-gray-700">{detailRefund.requesterEmail}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">상태</p>
                  <Badge variant={STATUS_BADGE_VARIANT[detailRefund.status]}>
                    {REFUND_STATUS_LABELS[detailRefund.status]}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">종류</p>
                  <Badge variant="outline">{REFUND_KIND_LABELS[detailRefund.kind]}</Badge>
                </div>
              </div>

              {/* Amount Breakdown */}
              <div className="rounded-md border border-gray-200 bg-gray-50 p-3">
                <p className="text-xs font-medium text-gray-500 mb-2">금액 내역</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">환불 뽈:</span>
                    <span className="font-medium tabular-nums text-gray-900">{detailRefund.amount.toLocaleString()}뽈</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">환불 금액:</span>
                    <span className="font-medium tabular-nums text-gray-900">{detailRefund.wonAmount.toLocaleString()}원</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">결제수단:</span>
                    <span className="text-gray-700">{detailRefund.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">거래번호:</span>
                    <span className="text-gray-700 text-xs">{detailRefund.originalTransactionId}</span>
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">접수일:</span>{" "}
                  <span className="text-gray-700">{detailRefund.requestedAt}</span>
                </div>
                {detailRefund.processedAt && (
                  <div>
                    <span className="text-gray-500">처리일:</span>{" "}
                    <span className="text-gray-700">{detailRefund.processedAt}</span>
                  </div>
                )}
                {detailRefund.processorName && (
                  <div>
                    <span className="text-gray-500">처리자:</span>{" "}
                    <span className="text-gray-700">{detailRefund.processorName}</span>
                  </div>
                )}
              </div>

              {/* Reason */}
              <div className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2">
                <p className="text-xs text-gray-500">환불 사유</p>
                <p className="text-sm text-gray-800">{detailRefund.reason}</p>
              </div>

              {detailRefund.rejectReason && (
                <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2">
                  <p className="text-xs font-medium text-red-700">거절 사유</p>
                  <p className="text-sm text-red-600">{detailRefund.rejectReason}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setDetailOpen(false)}>닫기</Button>
                {detailRefund.status === "REQUESTED" && (
                  <>
                    <Button
                      variant="outline"
                      className="text-red-600 border-red-200 hover:bg-red-50"
                      onClick={() => { setDetailOpen(false); openProcessDialog(detailRefund, "reject"); }}
                    >
                      거절
                    </Button>
                    <Button onClick={() => { setDetailOpen(false); openProcessDialog(detailRefund, "approve"); }}>
                      승인
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Process Dialog */}
      <Dialog open={processOpen} onOpenChange={setProcessOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>
              환불 {processAction === "approve" ? "승인" : "거절"}
            </DialogTitle>
            <DialogDescription>
              {processRefund && (
                <>
                  <span className="font-medium">{processRefund.requesterName}</span>님의 환불 요청을 {processAction === "approve" ? "승인" : "거절"}합니다.
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          {processRefund && (
            <div className="space-y-4">
              {/* Summary */}
              <div className="rounded-md border border-gray-200 bg-gray-50 p-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500">종류:</span>{" "}
                    <span className="text-gray-700">{REFUND_KIND_LABELS[processRefund.kind]}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">금액:</span>{" "}
                    <span className="font-medium text-gray-900">{processRefund.amount.toLocaleString()}뽈 ({processRefund.wonAmount.toLocaleString()}원)</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-500">사유:</span>{" "}
                    <span className="text-gray-700">{processRefund.reason}</span>
                  </div>
                </div>
              </div>

              {processAction === "approve" && (
                <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                  환불이 승인되면 {processRefund.wonAmount.toLocaleString()}원이 접수자에게 환불됩니다.
                </div>
              )}

              {processAction === "reject" && (
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-gray-700">거절 사유 <span className="text-red-500">*</span></Label>
                  <Textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="거절 사유를 입력해 주세요"
                    rows={3}
                  />
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2 pt-4">
            <Button variant="outline" onClick={() => setProcessOpen(false)}>
              취소
            </Button>
            {processAction === "approve" ? (
              <Button onClick={handleProcess} disabled={processing}>
                {processing ? "처리 중..." : "승인"}
              </Button>
            ) : (
              <Button
                variant="destructive"
                onClick={handleProcess}
                disabled={processing || !rejectReason.trim()}
              >
                {processing ? "처리 중..." : "거절"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
