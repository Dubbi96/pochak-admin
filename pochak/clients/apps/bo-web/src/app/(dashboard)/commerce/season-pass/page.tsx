"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Plus, Search, Power, Check } from "lucide-react";
import type { PageResponse } from "@/types/common";
import {
  createSeasonPass,
  updateSeasonPass,
  toggleSeasonPassActive,
  SEASON_PASS_CATEGORY_LABELS,
  SEASON_PASS_TIER_LABELS,
  SEASON_PASS_TIER_FEATURES,
  type SeasonPass,
  type SeasonPassFilter,
  type SeasonPassCategory,
  type SeasonPassCreateRequest,
  type SeasonPassTier,
  type PublishStatus,
} from "@/services/commerce-admin-api";
import { adminApi } from "@/lib/api-client";

const TIER_BADGE_VARIANT: Record<SeasonPassTier, "secondary" | "info" | "warning"> = {
  BASIC: "secondary",
  PRO: "info",
  PREMIUM: "warning",
};

// ── Modal ──────────────────────────────────────────────────────────

interface SeasonPassModalProps {
  open: boolean;
  onClose: () => void;
  seasonPass: SeasonPass | null;
  onSaved: () => void;
}

function SeasonPassModal({ open, onClose, seasonPass, onSaved }: SeasonPassModalProps) {
  const [category, setCategory] = useState<SeasonPass["category"]>("INDIVIDUAL");
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState<"PUBLISHED" | "UNPUBLISHED">("PUBLISHED");
  const [tier, setTier] = useState<SeasonPassTier>("BASIC");
  const [durationDays, setDurationDays] = useState("");
  const [features, setFeatures] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (seasonPass) {
      setCategory(seasonPass.category);
      setName(seasonPass.name);
      setAmount(String(seasonPass.amount));
      setStatus(seasonPass.status);
      setTier(seasonPass.tier);
      setDurationDays(String(seasonPass.durationDays));
      setFeatures(seasonPass.features);
    } else {
      setCategory("INDIVIDUAL");
      setName("");
      setAmount("");
      setStatus("PUBLISHED");
      setTier("BASIC");
      setDurationDays("");
      setFeatures(SEASON_PASS_TIER_FEATURES.BASIC);
    }
  }, [seasonPass, open]);

  const handleTierChange = (newTier: SeasonPassTier) => {
    setTier(newTier);
    setFeatures(SEASON_PASS_TIER_FEATURES[newTier]);
  };

  const handleSave = async () => {
    if (!name.trim() || !amount || !durationDays) return;
    setSaving(true);
    try {
      const payload: SeasonPassCreateRequest = {
        category,
        name: name.trim(),
        amount: Number(amount),
        status,
        tier,
        durationDays: Number(durationDays),
        features,
      };
      if (seasonPass) {
        await updateSeasonPass(seasonPass.id, payload);
      } else {
        await createSeasonPass(payload);
      }
      onSaved();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{seasonPass ? "시즌권 수정" : "시즌권 등록"}</DialogTitle>
          <DialogDescription>
            {seasonPass ? "시즌권 정보를 수정합니다." : "새로운 시즌권을 등록합니다."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>구분 <span className="text-red-500">*</span></Label>
              <Select value={category} onValueChange={(v) => setCategory(v as SeasonPass["category"])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INDIVIDUAL">개인</SelectItem>
                  <SelectItem value="TEAM">팀</SelectItem>
                  <SelectItem value="COMPETITION">대회</SelectItem>
                  <SelectItem value="LEAGUE">리그</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>티어 <span className="text-red-500">*</span></Label>
              <Select value={tier} onValueChange={(v) => handleTierChange(v as SeasonPassTier)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BASIC">BASIC</SelectItem>
                  <SelectItem value="PRO">PRO</SelectItem>
                  <SelectItem value="PREMIUM">PREMIUM</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>시즌권 종류 <span className="text-red-500">*</span></Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="시즌권 이름을 입력하세요" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>금액(뽈) <span className="text-red-500">*</span></Label>
              <Input type="number" min={0} value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="금액을 입력하세요" />
            </div>

            <div className="space-y-1.5">
              <Label>기간(일) <span className="text-red-500">*</span></Label>
              <Input type="number" min={1} value={durationDays} onChange={(e) => setDurationDays(e.target.value)} placeholder="일수를 입력하세요" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>게시상태</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as "PUBLISHED" | "UNPUBLISHED")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PUBLISHED">게시</SelectItem>
                <SelectItem value="UNPUBLISHED">미게시</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Features */}
          <div className="space-y-1.5">
            <Label>포함 기능</Label>
            <div className="flex flex-wrap gap-1.5">
              {features.map((feat, i) => (
                <Badge key={i} variant="outline" className="text-xs">
                  <Check size={10} className="mr-1" />
                  {feat}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-gray-400">티어 변경 시 자동으로 기능이 설정됩니다.</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>취소</Button>
          <Button onClick={handleSave} disabled={saving || !name.trim() || !amount || !durationDays}>
            {saving ? "저장 중..." : "저장"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Page ───────────────────────────────────────────────────────────

export default function SeasonPassPage() {
  const [data, setData] = useState<PageResponse<SeasonPass> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);

  // Filters
  const [category, setCategory] = useState<SeasonPassCategory>("ALL");
  const [statusFilter, setStatusFilter] = useState<PublishStatus>("ALL");
  const [searchKeyword, setSearchKeyword] = useState("");

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<SeasonPass | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const filters: SeasonPassFilter = {
        category,
        status: statusFilter,
        searchKeyword: searchKeyword || undefined,
      };

      const apiParams: Record<string, string> = { page: String(page) };
      if (category !== "ALL") apiParams.category = category;
      if (statusFilter !== "ALL") apiParams.status = statusFilter;
      if (filters.searchKeyword) apiParams.searchKeyword = filters.searchKeyword;

      const apiResult = await adminApi.get<PageResponse<SeasonPass>>(
        "/admin/api/v1/commerce/season-pass",
        apiParams
      );
      setData(apiResult);
    } finally {
      setLoading(false);
    }
  }, [category, statusFilter, searchKeyword, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearch = () => {
    setPage(0);
    fetchData();
  };

  const handleReset = () => {
    setCategory("ALL");
    setStatusFilter("ALL");
    setSearchKeyword("");
  };

  const handleCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const handleEdit = (item: SeasonPass) => {
    setEditing(item);
    setModalOpen(true);
  };

  const handleToggleActive = async (e: React.MouseEvent, item: SeasonPass) => {
    e.stopPropagation();
    if (!confirm(`이 시즌권을 ${item.isActive ? "비활성화" : "활성화"} 하시겠습니까?`)) return;
    await toggleSeasonPassActive(item.id);
    fetchData();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">시즌권 관리</h1>
        <Button onClick={handleCreate}>
          <Plus size={16} className="mr-1.5" />
          등록
        </Button>
      </div>

      {/* Tier Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        {(["BASIC", "PRO", "PREMIUM"] as SeasonPassTier[]).map((tierKey) => {
          const passes = data?.content.filter((s) => s.tier === tierKey) ?? [];
          const activeCount = passes.filter((s) => s.isActive).length;
          return (
            <div key={tierKey} className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="flex items-center justify-between mb-2">
                <Badge variant={TIER_BADGE_VARIANT[tierKey]}>{SEASON_PASS_TIER_LABELS[tierKey]}</Badge>
                <span className="text-xs text-gray-400">{activeCount}/{passes.length} 활성</span>
              </div>
              <div className="space-y-1">
                {SEASON_PASS_TIER_FEATURES[tierKey].map((feat, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-xs text-gray-600">
                    <Check size={10} className="text-emerald-500 shrink-0" />
                    {feat}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-end gap-4 rounded-lg border border-gray-200 bg-white p-4">
        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">구분</Label>
          <Select value={category} onValueChange={(v) => setCategory(v as SeasonPassCategory)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">전체</SelectItem>
              <SelectItem value="INDIVIDUAL">개인</SelectItem>
              <SelectItem value="TEAM">팀</SelectItem>
              <SelectItem value="COMPETITION">대회</SelectItem>
              <SelectItem value="LEAGUE">리그</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">게시상태</Label>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as PublishStatus)}>
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
          <Label className="text-xs text-gray-500">직접검색</Label>
          <Input
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="시즌권 이름 검색"
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
              <th className="px-4 py-3 text-center">티어</th>
              <th className="px-4 py-3">시즌권 종류</th>
              <th className="px-4 py-3 text-right">금액(뽈)</th>
              <th className="px-4 py-3 text-center">기간</th>
              <th className="px-4 py-3 text-center">게시상태</th>
              <th className="px-4 py-3 text-center">활성화</th>
              <th className="px-4 py-3 text-center">등록일자</th>
              <th className="px-4 py-3 text-center">수정자</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={10} className="px-4 py-12 text-center text-gray-400">
                  로딩 중...
                </td>
              </tr>
            ) : !data || data.content.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-4 py-12 text-center text-gray-400">
                  데이터가 없습니다.
                </td>
              </tr>
            ) : (
              data.content.map((item, idx) => (
                <tr
                  key={item.id}
                  className={`border-b border-gray-100 transition-colors hover:bg-gray-50 cursor-pointer ${idx % 2 === 1 ? "bg-gray-50/50" : ""} ${!item.isActive ? "opacity-60" : ""}`}
                  onClick={() => handleEdit(item)}
                >
                  <td className="px-4 py-3 text-center text-gray-500">
                    {page * (data?.size ?? 20) + idx + 1}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant="outline">
                      {SEASON_PASS_CATEGORY_LABELS[item.category]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant={TIER_BADGE_VARIANT[item.tier]}>
                      {SEASON_PASS_TIER_LABELS[item.tier]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">{item.name}</td>
                  <td className="px-4 py-3 text-right font-medium tabular-nums text-gray-900">
                    {item.amount.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-center text-gray-600">
                    {item.durationDays}일
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant={item.status === "PUBLISHED" ? "success" : "secondary"}>
                      {item.status === "PUBLISHED" ? "게시" : "미게시"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Button
                      size="sm"
                      variant="ghost"
                      className={item.isActive ? "text-emerald-600" : "text-gray-400"}
                      onClick={(e) => handleToggleActive(e, item)}
                      title={item.isActive ? "비활성화" : "활성화"}
                    >
                      <Power size={14} />
                    </Button>
                  </td>
                  <td className="px-4 py-3 text-center text-gray-500">{item.createdAt}</td>
                  <td className="px-4 py-3 text-center text-gray-500">{item.updatedBy}</td>
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
      <SeasonPassModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        seasonPass={editing}
        onSaved={fetchData}
      />
    </div>
  );
}
