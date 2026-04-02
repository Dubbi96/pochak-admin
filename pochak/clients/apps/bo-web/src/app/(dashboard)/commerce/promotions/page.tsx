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
import { FileUpload } from "@/components/common/file-upload";
import { Pencil, Plus, Ban, RefreshCw, Copy } from "lucide-react";
import {
  getPromotions,
  createPromotion,
  updatePromotion,
  updatePromotionStatus,
  generatePromoCode,
  type Promotion,
  type PromotionType,
  type DiscountType,
  type PromotionStatus,
  type PromotionFilter,
  type PromotionCreateRequest,
  type PromotionTargetType,
  PROMOTION_TYPE_LABELS,
  DISCOUNT_TYPE_LABELS,
  PROMOTION_STATUS_LABELS,
  PROMOTION_TARGET_LABELS,
} from "@/services/promotion-api";
import { adminApi } from "@/lib/api-client";
import type { PageResponse } from "@/types/common";

// ── Status Badge Helper ─────────────────────────────────────────────

function StatusBadge({ status }: { status: PromotionStatus }) {
  const variant = status === "ACTIVE" ? "success" : status === "EXPIRED" ? "destructive" : "secondary";
  return <Badge variant={variant}>{PROMOTION_STATUS_LABELS[status]}</Badge>;
}

function DiscountDisplay({ type, value }: { type: DiscountType; value: number }) {
  if (type === "PERCENTAGE") return <>{value}%</>;
  if (type === "FIXED") return <>{value.toLocaleString()}원</>;
  return <>{value.toLocaleString()}뽈</>;
}

// ── Create/Edit Dialog ──────────────────────────────────────────────

interface PromotionDialogProps {
  open: boolean;
  onClose: () => void;
  editing: Promotion | null;
  onSaved: () => void;
}

function PromotionDialog({ open, onClose, editing, onSaved }: PromotionDialogProps) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [type, setType] = useState<PromotionType>("COUPON");
  const [discountType, setDiscountType] = useState<DiscountType>("PERCENTAGE");
  const [discountValue, setDiscountValue] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [maxUsageTotal, setMaxUsageTotal] = useState("");
  const [maxUsagePerUser, setMaxUsagePerUser] = useState("");
  const [minPurchaseAmount, setMinPurchaseAmount] = useState("");
  const [maxDiscountAmount, setMaxDiscountAmount] = useState("");
  const [targetType, setTargetType] = useState<PromotionTargetType>("ALL");
  const [targetIds, setTargetIds] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editing) {
      setName(editing.name);
      setCode(editing.code);
      setType(editing.type);
      setDiscountType(editing.discountType);
      setDiscountValue(String(editing.discountValue));
      setStartDate(editing.startDate);
      setEndDate(editing.endDate);
      setMaxUsageTotal(String(editing.maxUsageTotal));
      setMaxUsagePerUser(String(editing.maxUsagePerUser));
      setMinPurchaseAmount(String(editing.minPurchaseAmount));
      setMaxDiscountAmount(editing.maxDiscountAmount ? String(editing.maxDiscountAmount) : "");
      setTargetType(editing.targetType);
      setTargetIds(editing.targetIds.join(", "));
      setBannerUrl("");
      setBannerFile(null);
    } else {
      setName("");
      setCode("");
      setType("COUPON");
      setDiscountType("PERCENTAGE");
      setDiscountValue("");
      setStartDate("");
      setEndDate("");
      setMaxUsageTotal("");
      setMaxUsagePerUser("1");
      setMinPurchaseAmount("0");
      setMaxDiscountAmount("");
      setTargetType("ALL");
      setTargetIds("");
      setBannerUrl("");
      setBannerFile(null);
    }
  }, [editing, open]);

  // When promotion type changes, adjust discount type
  useEffect(() => {
    if (type === "GIFT_BALL") {
      setDiscountType("BALL_GRANT");
    } else if (discountType === "BALL_GRANT") {
      setDiscountType("PERCENTAGE");
    }
  }, [type, discountType]);

  const handleGenerateCode = () => {
    setCode(generatePromoCode());
  };

  const handleSave = async () => {
    if (!name || !code || !discountValue || !startDate || !endDate || !maxUsageTotal) return;
    setSaving(true);
    try {
      const payload: PromotionCreateRequest = {
        name,
        code,
        type,
        discountType,
        discountValue: Number(discountValue),
        startDate,
        endDate,
        maxUsageTotal: Number(maxUsageTotal),
        maxUsagePerUser: Number(maxUsagePerUser) || 1,
        minPurchaseAmount: Number(minPurchaseAmount) || 0,
        maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : null,
        targetType,
        targetIds: targetIds ? targetIds.split(",").map((s) => s.trim()).filter(Boolean) : [],
      };

      if (editing) {
        await updatePromotion(editing.id, payload);
      } else {
        await createPromotion(payload);
      }
      onSaved();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const isValid = name && code && discountValue && startDate && endDate && maxUsageTotal;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? "프로모션 수정" : "프로모션 등록"}</DialogTitle>
          <DialogDescription>
            {editing ? "프로모션 정보를 수정합니다." : "새로운 프로모션을 등록합니다."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* 프로모션명 */}
          <div className="space-y-1.5">
            <Label>프로모션명 <span className="text-red-500">*</span></Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="예: 신규 가입 20% 할인" />
          </div>

          {/* 배너 이미지 */}
          <FileUpload
            label="프로모션 배너 이미지"
            currentUrl={bannerUrl || undefined}
            onChange={(file, previewUrl) => {
              setBannerFile(file);
              setBannerUrl(previewUrl ?? "");
            }}
            description="프로모션 배너 이미지를 업로드하세요 (권장: 1200x300px)"
          />

          {/* 프로모션 코드 */}
          <div className="space-y-1.5">
            <Label>프로모션 코드 <span className="text-red-500">*</span></Label>
            <div className="flex gap-2">
              <Input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="WELCOME20" className="flex-1" />
              <Button type="button" variant="outline" size="sm" onClick={handleGenerateCode} title="자동 생성">
                <RefreshCw size={14} className="mr-1" /> 자동생성
              </Button>
            </div>
          </div>

          {/* 유형 */}
          <div className="space-y-1.5">
            <Label>유형 <span className="text-red-500">*</span></Label>
            <Select value={type} onValueChange={(v) => setType(v as PromotionType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="COUPON">쿠폰</SelectItem>
                <SelectItem value="EVENT">이벤트</SelectItem>
                <SelectItem value="GIFT_BALL">뽈 지급</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 할인 설정 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>할인유형 <span className="text-red-500">*</span></Label>
              <Select
                value={discountType}
                onValueChange={(v) => setDiscountType(v as DiscountType)}
                disabled={type === "GIFT_BALL"}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PERCENTAGE">비율(%)</SelectItem>
                  <SelectItem value="FIXED">고정금액(원)</SelectItem>
                  <SelectItem value="BALL_GRANT">뽈 지급</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>
                할인값 <span className="text-red-500">*</span>
                <span className="ml-1 text-xs text-gray-400">
                  {discountType === "PERCENTAGE" ? "(%)" : discountType === "FIXED" ? "(원)" : "(뽈)"}
                </span>
              </Label>
              <Input
                type="number"
                min={0}
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                placeholder={discountType === "PERCENTAGE" ? "20" : "1000"}
              />
            </div>
          </div>

          {/* 기간 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>시작일 <span className="text-red-500">*</span></Label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>종료일 <span className="text-red-500">*</span></Label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>

          {/* 사용조건 */}
          <div className="rounded-lg border border-gray-200 p-3 space-y-3">
            <p className="text-sm font-medium text-gray-700">사용 조건</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">최소결제금액(뽈)</Label>
                <Input type="number" min={0} value={minPurchaseAmount} onChange={(e) => setMinPurchaseAmount(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">최대할인금액(뽈)</Label>
                <Input type="number" min={0} value={maxDiscountAmount} onChange={(e) => setMaxDiscountAmount(e.target.value)} placeholder="미입력시 제한없음" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">1인당 최대사용횟수</Label>
                <Input type="number" min={1} value={maxUsagePerUser} onChange={(e) => setMaxUsagePerUser(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">전체 최대사용횟수 <span className="text-red-500">*</span></Label>
                <Input type="number" min={1} value={maxUsageTotal} onChange={(e) => setMaxUsageTotal(e.target.value)} />
              </div>
            </div>
          </div>

          {/* 적용 대상 */}
          <div className="space-y-1.5">
            <Label>적용 대상</Label>
            <Select value={targetType} onValueChange={(v) => setTargetType(v as PromotionTargetType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">전체</SelectItem>
                <SelectItem value="SPECIFIC_PRODUCT">특정 상품</SelectItem>
                <SelectItem value="SPECIFIC_CATEGORY">특정 카테고리</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {targetType !== "ALL" && (
            <div className="space-y-1.5">
              <Label>
                {targetType === "SPECIFIC_PRODUCT" ? "상품명" : "카테고리명"}{" "}
                <span className="text-xs text-gray-400">(쉼표로 구분)</span>
              </Label>
              <Input
                value={targetIds}
                onChange={(e) => setTargetIds(e.target.value)}
                placeholder={targetType === "SPECIFIC_PRODUCT" ? "대회 시즌권, 팀 시즌권" : "시즌권, 클립"}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>취소</Button>
          <Button onClick={handleSave} disabled={saving || !isValid}>
            {saving ? "저장 중..." : editing ? "수정" : "등록"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Page ────────────────────────────────────────────────────────────

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalElements, setTotalElements] = useState(0);

  // Filters
  const [statusFilter, setStatusFilter] = useState<PromotionStatus | "ALL">("ALL");
  const [typeFilter, setTypeFilter] = useState<PromotionType | "ALL">("ALL");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");

  // Dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Promotion | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const filters: PromotionFilter = {
        status: statusFilter,
        type: typeFilter,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        searchKeyword: searchKeyword || undefined,
      };

      // Try real API first, fall back to mock
      // TODO(Phase 4B): remove mock fallback once backend is stable
      const apiParams: Record<string, string> = {};
      if (statusFilter !== "ALL") apiParams.status = statusFilter;
      if (typeFilter !== "ALL") apiParams.type = typeFilter;
      if (dateFrom) apiParams.dateFrom = dateFrom;
      if (dateTo) apiParams.dateTo = dateTo;
      if (searchKeyword) apiParams.searchKeyword = searchKeyword;

      const apiResult = await adminApi.get<PageResponse<Promotion>>(
        "/admin/api/v1/commerce/promotions",
        apiParams
      );
      if (apiResult) {
        setPromotions(apiResult.content);
        setTotalElements(apiResult.totalElements);
        return;
      }

      // Mock fallback
      const result = await getPromotions(filters);
      setPromotions(result.content);
      setTotalElements(result.totalElements);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, typeFilter, dateFrom, dateTo, searchKeyword]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const handleEdit = (promo: Promotion) => {
    setEditing(promo);
    setDialogOpen(true);
  };

  const handleDeactivate = async (promo: Promotion) => {
    const newStatus: PromotionStatus = promo.status === "ACTIVE" ? "EXPIRED" : "ACTIVE";
    await updatePromotionStatus(promo.id, newStatus);
    fetchData();
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">프로모션 관리</h1>
        <Button onClick={handleCreate}>
          <Plus size={16} className="mr-1" /> 프로모션 등록
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3 rounded-lg border border-gray-200 bg-white p-4">
        <div className="space-y-1">
          <Label className="text-xs text-gray-500">상태</Label>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as PromotionStatus | "ALL")}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(["ALL", "ACTIVE", "EXPIRED", "DRAFT"] as const).map((s) => (
                <SelectItem key={s} value={s}>{PROMOTION_STATUS_LABELS[s]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label className="text-xs text-gray-500">유형</Label>
          <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as PromotionType | "ALL")}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(["ALL", "COUPON", "EVENT", "GIFT_BALL"] as const).map((t) => (
                <SelectItem key={t} value={t}>{PROMOTION_TYPE_LABELS[t]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label className="text-xs text-gray-500">시작일</Label>
          <Input type="date" className="w-[150px]" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
        </div>

        <div className="space-y-1">
          <Label className="text-xs text-gray-500">종료일</Label>
          <Input type="date" className="w-[150px]" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
        </div>

        <div className="space-y-1">
          <Label className="text-xs text-gray-500">검색</Label>
          <Input
            className="w-[200px]"
            placeholder="프로모션명 또는 코드"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
          />
        </div>
      </div>

      {/* Summary */}
      <p className="text-sm text-gray-500">
        전체 <span className="font-semibold text-gray-900">{totalElements}</span>건
      </p>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-xs font-medium uppercase tracking-wider text-gray-500">
              <th className="px-4 py-3 text-center w-[50px]">NO</th>
              <th className="px-4 py-3">프로모션명</th>
              <th className="px-4 py-3 text-center">코드</th>
              <th className="px-4 py-3 text-center">유형</th>
              <th className="px-4 py-3 text-center">할인유형</th>
              <th className="px-4 py-3 text-right">할인값</th>
              <th className="px-4 py-3 text-center">시작일</th>
              <th className="px-4 py-3 text-center">종료일</th>
              <th className="px-4 py-3 text-center">사용횟수</th>
              <th className="px-4 py-3 text-center">상태</th>
              <th className="px-4 py-3 text-center w-[100px]">관리</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={11} className="px-4 py-12 text-center text-gray-400">
                  로딩 중...
                </td>
              </tr>
            ) : promotions.length === 0 ? (
              <tr>
                <td colSpan={11} className="px-4 py-12 text-center text-gray-400">
                  데이터가 없습니다.
                </td>
              </tr>
            ) : (
              promotions.map((promo, idx) => (
                <tr
                  key={promo.id}
                  className={`border-b border-gray-100 transition-colors hover:bg-gray-50 ${idx % 2 === 1 ? "bg-gray-50/50" : ""}`}
                >
                  <td className="px-4 py-3 text-center text-gray-500">{idx + 1}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{promo.name}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center gap-1">
                      <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-mono text-gray-700">
                        {promo.code}
                      </code>
                      <button
                        onClick={() => handleCopyCode(promo.code)}
                        className="text-gray-400 hover:text-gray-600"
                        title="복사"
                      >
                        <Copy size={12} />
                      </button>
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-gray-600">
                    {PROMOTION_TYPE_LABELS[promo.type]}
                  </td>
                  <td className="px-4 py-3 text-center text-gray-600">
                    {DISCOUNT_TYPE_LABELS[promo.discountType]}
                  </td>
                  <td className="px-4 py-3 text-right font-medium tabular-nums text-gray-900">
                    <DiscountDisplay type={promo.discountType} value={promo.discountValue} />
                  </td>
                  <td className="px-4 py-3 text-center text-gray-500">{promo.startDate}</td>
                  <td className="px-4 py-3 text-center text-gray-500">{promo.endDate}</td>
                  <td className="px-4 py-3 text-center tabular-nums text-gray-600">
                    {promo.usageCount.toLocaleString()} / {promo.maxUsageTotal.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <StatusBadge status={promo.status} />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(promo)}
                        title="수정"
                      >
                        <Pencil size={14} />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeactivate(promo)}
                        title={promo.status === "ACTIVE" ? "비활성화" : "활성화"}
                        className={promo.status === "ACTIVE" ? "text-red-500 hover:text-red-600" : "text-green-500 hover:text-green-600"}
                      >
                        <Ban size={14} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <PromotionDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        editing={editing}
        onSaved={fetchData}
      />
    </div>
  );
}
