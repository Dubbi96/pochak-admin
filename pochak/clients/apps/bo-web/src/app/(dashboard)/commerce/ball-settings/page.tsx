"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Save, Gift, Search, Package } from "lucide-react";
import {
  getBallExchangeRate,
  updateBallExchangeRate,
  getBallChargeOptions,
  createBallChargeOption,
  updateBallChargeOption,
  deleteBallChargeOption,
  getBulkBallGrantUsers,
  bulkGrantBalls,
  type BallExchangeRate,
  type BallChargeOption,
  type BallChargeOptionCreateRequest,
  type BulkBallGrantUser,
} from "@/services/commerce-admin-api";
import { adminApi } from "@/lib/api-client";

// ── Charge Option Modal ────────────────────────────────────────────

interface ChargeOptionModalProps {
  open: boolean;
  onClose: () => void;
  option: BallChargeOption | null;
  onSaved: () => void;
}

function ChargeOptionModal({ open, onClose, option, onSaved }: ChargeOptionModalProps) {
  const [ballAmount, setBallAmount] = useState("");
  const [wonAmount, setWonAmount] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (option) {
      setBallAmount(String(option.ballAmount));
      setWonAmount(String(option.wonAmount));
    } else {
      setBallAmount("");
      setWonAmount("");
    }
  }, [option, open]);

  const handleSave = async () => {
    if (!ballAmount || !wonAmount) return;
    setSaving(true);
    try {
      const payload: BallChargeOptionCreateRequest = {
        ballAmount: Number(ballAmount),
        wonAmount: Number(wonAmount),
      };
      if (option) {
        await updateBallChargeOption(option.id, payload);
      } else {
        await createBallChargeOption(payload);
      }
      onSaved();
      onClose();
    } catch (err) {
      console.error("[ChargeOptionModal] Failed to save:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{option ? "충전금액 수정" : "충전금액 등록"}</DialogTitle>
          <DialogDescription>
            {option ? "충전금액 설정을 수정합니다." : "새로운 충전금액을 등록합니다."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>충전금액(뽈) <span className="text-red-500">*</span></Label>
            <Input type="number" min={0} value={ballAmount} onChange={(e) => setBallAmount(e.target.value)} placeholder="뽈 금액을 입력하세요" />
          </div>

          <div className="space-y-1.5">
            <Label>금액(원) <span className="text-red-500">*</span></Label>
            <Input type="number" min={0} value={wonAmount} onChange={(e) => setWonAmount(e.target.value)} placeholder="원화 금액을 입력하세요" />
          </div>

          {ballAmount && wonAmount && Number(wonAmount) > 0 && (
            <div className="rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700">
              1뽈당 {(Number(wonAmount) / Number(ballAmount)).toFixed(1)}원 (할인율: {ballAmount && wonAmount ? `${Math.round((1 - (Number(wonAmount) / Number(ballAmount)) / 10) * 100)}%` : "-"})
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>취소</Button>
          <Button onClick={handleSave} disabled={saving || !ballAmount || !wonAmount}>
            {saving ? "저장 중..." : "저장"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Bulk Ball Grant Modal ──────────────────────────────────────────

interface BulkGrantModalProps {
  open: boolean;
  onClose: () => void;
}

function BulkGrantModal({ open, onClose }: BulkGrantModalProps) {
  const [users, setUsers] = useState<BulkBallGrantUser[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [granting, setGranting] = useState(false);

  useEffect(() => {
    if (open) {
      setSelectedUserIds([]);
      setAmount("");
      setReason("");
      setUserSearch("");
      loadUsers();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const loadUsers = async (keyword?: string) => {
    setLoadingUsers(true);
    try {
      const result = await getBulkBallGrantUsers(keyword);
      setUsers(result);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleSearchUsers = () => {
    loadUsers(userSearch || undefined);
  };

  const toggleUser = (userId: number) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const toggleAll = () => {
    if (selectedUserIds.length === users.length) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(users.map((u) => u.id));
    }
  };

  const handleGrant = async () => {
    if (selectedUserIds.length === 0 || !amount) return;
    setGranting(true);
    try {
      await bulkGrantBalls({
        userIds: selectedUserIds,
        amount: Number(amount),
        reason: reason || "관리자 일괄 지급",
      });
      onClose();
    } catch (err) {
      console.error("[BulkGrantModal] Failed to grant balls:", err);
    } finally {
      setGranting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>뽈 일괄 지급</DialogTitle>
          <DialogDescription>선택한 사용자에게 뽈을 일괄 지급합니다.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* User Search */}
          <div className="flex items-end gap-2">
            <div className="flex-1 space-y-1.5">
              <Label className="text-xs text-gray-500">사용자 검색</Label>
              <Input
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearchUsers()}
                placeholder="이름 또는 이메일 검색"
              />
            </div>
            <Button size="sm" onClick={handleSearchUsers}>
              <Search size={14} className="mr-1" />
              검색
            </Button>
          </div>

          {/* User List */}
          <div className="max-h-[240px] overflow-y-auto rounded-md border border-gray-200">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-gray-50">
                <tr className="border-b text-xs text-gray-500">
                  <th className="px-3 py-2 text-center w-[40px]">
                    <Checkbox
                      checked={users.length > 0 && selectedUserIds.length === users.length}
                      onCheckedChange={toggleAll}
                    />
                  </th>
                  <th className="px-3 py-2 text-left">이름</th>
                  <th className="px-3 py-2 text-left">이메일</th>
                  <th className="px-3 py-2 text-right">보유 뽈</th>
                </tr>
              </thead>
              <tbody>
                {loadingUsers ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-gray-400">로딩 중...</td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-gray-400">사용자가 없습니다.</td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer" onClick={() => toggleUser(user.id)}>
                      <td className="px-3 py-2 text-center">
                        <Checkbox checked={selectedUserIds.includes(user.id)} onCheckedChange={() => toggleUser(user.id)} />
                      </td>
                      <td className="px-3 py-2 font-medium text-gray-900">{user.name}</td>
                      <td className="px-3 py-2 text-gray-500">{user.email}</td>
                      <td className="px-3 py-2 text-right tabular-nums text-gray-700">{user.currentBall.toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {selectedUserIds.length > 0 && (
            <p className="text-sm text-blue-600">{selectedUserIds.length}명 선택됨</p>
          )}

          {/* Amount & Reason */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>지급 뽈 <span className="text-red-500">*</span></Label>
              <Input type="number" min={1} value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="지급할 뽈 금액" />
            </div>
            <div className="space-y-1.5">
              <Label>지급 사유</Label>
              <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="이벤트, 보상 등" />
            </div>
          </div>

          {selectedUserIds.length > 0 && amount && (
            <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
              총 {selectedUserIds.length}명에게 {Number(amount).toLocaleString()}뽈씩, 합계 {(selectedUserIds.length * Number(amount)).toLocaleString()}뽈 지급
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>취소</Button>
          <Button onClick={handleGrant} disabled={granting || selectedUserIds.length === 0 || !amount}>
            {granting ? "지급 중..." : "지급"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Page ───────────────────────────────────────────────────────────

export default function BallSettingsPage() {
  const [exchangeRate, setExchangeRate] = useState<BallExchangeRate | null>(null);
  const [chargeOptions, setChargeOptions] = useState<BallChargeOption[]>([]);
  const [loading, setLoading] = useState(true);

  // Exchange rate editing
  const [editingRate, setEditingRate] = useState(false);
  const [rateValue, setRateValue] = useState("");
  const [rateSaving, setRateSaving] = useState(false);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingOption, setEditingOption] = useState<BallChargeOption | null>(null);

  // Bulk grant modal
  const [bulkGrantOpen, setBulkGrantOpen] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Try real API first, fall back to mock
      // TODO(Phase 4B): remove mock fallback once backend is stable
      const [apiRate, apiOptions] = await Promise.all([
        adminApi.get<BallExchangeRate>("/admin/api/v1/commerce/ball-settings/exchange-rate"),
        adminApi.get<BallChargeOption[]>("/admin/api/v1/commerce/ball-settings/charge-options"),
      ]);
      if (apiRate && apiOptions) {
        setExchangeRate(apiRate);
        setChargeOptions(apiOptions);
        return;
      }

      // Mock fallback
      const [rate, options] = await Promise.all([
        getBallExchangeRate(),
        getBallChargeOptions(),
      ]);
      setExchangeRate(rate);
      setChargeOptions(options);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSaveRate = async () => {
    if (!rateValue) return;
    setRateSaving(true);
    try {
      const result = await updateBallExchangeRate(Number(rateValue));
      setExchangeRate(result);
      setEditingRate(false);
    } catch (err) {
      console.error("[BallSettings] Failed to save exchange rate:", err);
    } finally {
      setRateSaving(false);
    }
  };

  const handleStartEditRate = () => {
    if (exchangeRate) {
      setRateValue(String(exchangeRate.ballPerWon));
    }
    setEditingRate(true);
  };

  const handleCreateOption = () => {
    setEditingOption(null);
    setModalOpen(true);
  };

  const handleEditOption = (option: BallChargeOption) => {
    setEditingOption(option);
    setModalOpen(true);
  };

  const handleDeleteOption = async (id: number) => {
    if (!confirm("이 충전금액을 삭제하시겠습니까?")) return;
    try {
      await deleteBallChargeOption(id);
      fetchData();
    } catch (err) {
      console.error("[BallSettings] Failed to delete charge option:", err);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-xl font-bold text-gray-900">뽈 관리</h1>
        <div className="flex items-center justify-center py-12 text-gray-400">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">뽈 관리</h1>
        <Button onClick={() => setBulkGrantOpen(true)}>
          <Gift size={16} className="mr-1.5" />
          일괄 지급
        </Button>
      </div>

      {/* Exchange Rate Card */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900">뽈 설정값</h2>
          {!editingRate && (
            <Button variant="outline" size="sm" onClick={handleStartEditRate}>
              <Pencil size={14} className="mr-1.5" />
              수정
            </Button>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="font-medium">1뽈 =</span>
            {editingRate ? (
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={1}
                  value={rateValue}
                  onChange={(e) => setRateValue(e.target.value)}
                  className="w-[100px]"
                />
                <span>원</span>
                <Button size="sm" onClick={handleSaveRate} disabled={rateSaving || !rateValue}>
                  <Save size={14} className="mr-1" />
                  {rateSaving ? "저장 중..." : "저장"}
                </Button>
                <Button size="sm" variant="outline" onClick={() => setEditingRate(false)}>
                  취소
                </Button>
              </div>
            ) : (
              <span className="text-lg font-bold text-emerald-600">
                {exchangeRate?.ballPerWon?.toLocaleString() ?? "-"}원
              </span>
            )}
          </div>
        </div>

        {exchangeRate && (
          <p className="mt-2 text-xs text-gray-400">
            수정자: {exchangeRate.updatedBy} | 수정일: {exchangeRate.updatedAt}
          </p>
        )}
      </div>

      {/* Ball Packages Summary */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">뽈 패키지 요약</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          {chargeOptions.map((opt) => (
            <div key={opt.id} className="flex flex-col items-center rounded-lg border border-gray-200 bg-gray-50 p-3">
              <Package size={20} className="text-blue-500 mb-1" />
              <p className="text-lg font-bold text-gray-900">{opt.ballAmount.toLocaleString()}</p>
              <p className="text-xs text-gray-500">뽈</p>
              <p className="mt-1 text-sm font-medium text-emerald-600">{opt.wonAmount.toLocaleString()}원</p>
              {exchangeRate && (
                <p className="text-[10px] text-gray-400">
                  1뽈당 {(opt.wonAmount / opt.ballAmount).toFixed(1)}원
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Charge Options */}
      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-base font-semibold text-gray-900">사용자 뽈 충전금액 관리</h2>
          <Button size="sm" onClick={handleCreateOption}>
            <Plus size={14} className="mr-1.5" />
            등록
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-xs font-medium uppercase tracking-wider text-gray-500">
                <th className="px-4 py-3 text-center w-[60px]">NO</th>
                <th className="px-4 py-3 text-right">충전금액(뽈)</th>
                <th className="px-4 py-3 text-right">금액(원)</th>
                <th className="px-4 py-3 text-right">1뽈당 단가</th>
                <th className="px-4 py-3 text-center">등록자</th>
                <th className="px-4 py-3 text-center">등록일자</th>
                <th className="px-4 py-3 text-center w-[120px]">관리</th>
              </tr>
            </thead>
            <tbody>
              {chargeOptions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                    데이터가 없습니다.
                  </td>
                </tr>
              ) : (
                chargeOptions.map((option, idx) => (
                  <tr
                    key={option.id}
                    className={`border-b border-gray-100 transition-colors hover:bg-gray-50 ${idx % 2 === 1 ? "bg-gray-50/50" : ""}`}
                  >
                    <td className="px-4 py-3 text-center text-gray-500">{idx + 1}</td>
                    <td className="px-4 py-3 text-right font-medium tabular-nums text-gray-900">
                      {option.ballAmount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right font-medium tabular-nums text-gray-900">
                      {option.wonAmount.toLocaleString()}원
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-gray-500">
                      {(option.wonAmount / option.ballAmount).toFixed(1)}원
                    </td>
                    <td className="px-4 py-3 text-center text-gray-500">{option.createdBy}</td>
                    <td className="px-4 py-3 text-center text-gray-500">{option.createdAt}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditOption(option)}
                          title="수정"
                        >
                          <Pencil size={14} />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => handleDeleteOption(option.id)}
                          title="삭제"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Charge Option Modal */}
      <ChargeOptionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        option={editingOption}
        onSaved={fetchData}
      />

      {/* Bulk Grant Modal */}
      <BulkGrantModal
        open={bulkGrantOpen}
        onClose={() => setBulkGrantOpen(false)}
      />
    </div>
  );
}
