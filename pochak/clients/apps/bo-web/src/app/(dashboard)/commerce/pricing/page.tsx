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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Pencil } from "lucide-react";
import {
  updatePricing,
  type PricingItem,
  type PricingTab,
  type PricingUpdateRequest,
} from "@/services/commerce-admin-api";
import { adminApi } from "@/lib/api-client";

// ── Edit Modal ────────────────────────────────────────────────────

interface PricingEditModalProps {
  open: boolean;
  onClose: () => void;
  item: PricingItem | null;
  onSaved: () => void;
}

function PricingEditModal({ open, onClose, item, onSaved }: PricingEditModalProps) {
  const [ballAmount, setBallAmount] = useState("");
  const [wonAmount, setWonAmount] = useState("");
  const [status, setStatus] = useState<"PUBLISHED" | "UNPUBLISHED">("PUBLISHED");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (item) {
      setBallAmount(String(item.ballAmount));
      setWonAmount(String(item.wonAmount));
      setStatus(item.status);
    }
  }, [item, open]);

  const handleSave = async () => {
    if (!item || !ballAmount || !wonAmount) return;
    setSaving(true);
    try {
      const payload: PricingUpdateRequest = {
        ballAmount: Number(ballAmount),
        wonAmount: Number(wonAmount),
        status,
      };
      await updatePricing(item.id, payload);
      onSaved();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>요금 수정</DialogTitle>
          <DialogDescription>
            {item?.criteria ?? ""} 요금을 수정합니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>기준</Label>
            <Input value={item?.criteria ?? ""} disabled />
          </div>

          <div className="space-y-1.5">
            <Label>금액(뽈) <span className="text-red-500">*</span></Label>
            <Input type="number" min={0} value={ballAmount} onChange={(e) => setBallAmount(e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <Label>금액(원) <span className="text-red-500">*</span></Label>
            <Input type="number" min={0} value={wonAmount} onChange={(e) => setWonAmount(e.target.value)} />
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

// ── Pricing Table ─────────────────────────────────────────────────

function PricingTable({ tab }: { tab: PricingTab }) {
  const [items, setItems] = useState<PricingItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<PricingItem | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const apiResult = await adminApi.get<PricingItem[]>(
        "/admin/api/v1/commerce/pricing",
        { tab }
      );
      setItems(apiResult);
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleEdit = (item: PricingItem) => {
    setEditing(item);
    setModalOpen(true);
  };

  return (
    <>
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-xs font-medium uppercase tracking-wider text-gray-500">
              <th className="px-4 py-3 text-center w-[60px]">NO</th>
              <th className="px-4 py-3">기준</th>
              <th className="px-4 py-3 text-right">금액(뽈)</th>
              <th className="px-4 py-3 text-right">금액(원)</th>
              <th className="px-4 py-3 text-center">등록자</th>
              <th className="px-4 py-3 text-center">등록일자</th>
              <th className="px-4 py-3 text-center">게시상태</th>
              <th className="px-4 py-3 text-center w-[80px]">관리</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-gray-400">
                  로딩 중...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-gray-400">
                  데이터가 없습니다.
                </td>
              </tr>
            ) : (
              items.map((item, idx) => (
                <tr
                  key={item.id}
                  className={`border-b border-gray-100 transition-colors hover:bg-gray-50 ${idx % 2 === 1 ? "bg-gray-50/50" : ""}`}
                >
                  <td className="px-4 py-3 text-center text-gray-500">{idx + 1}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{item.criteria}</td>
                  <td className="px-4 py-3 text-right font-medium tabular-nums text-gray-900">
                    {item.ballAmount.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right font-medium tabular-nums text-gray-900">
                    {item.wonAmount.toLocaleString()}원
                  </td>
                  <td className="px-4 py-3 text-center text-gray-500">{item.createdBy}</td>
                  <td className="px-4 py-3 text-center text-gray-500">{item.createdAt}</td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant={item.status === "PUBLISHED" ? "success" : "secondary"}>
                      {item.status === "PUBLISHED" ? "게시" : "미게시"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(item)}
                      title="수정"
                    >
                      <Pencil size={14} />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <PricingEditModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        item={editing}
        onSaved={fetchData}
      />
    </>
  );
}

// ── Page ───────────────────────────────────────────────────────────

export default function PricingPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <h1 className="text-xl font-bold text-gray-900">요금관리</h1>

      <Tabs defaultValue="CLIP">
        <TabsList>
          <TabsTrigger value="CLIP">클립 요금</TabsTrigger>
          <TabsTrigger value="TEAM_CONTENT">팀 콘텐츠 요금</TabsTrigger>
        </TabsList>

        <TabsContent value="CLIP">
          <PricingTable tab="CLIP" />
        </TabsContent>

        <TabsContent value="TEAM_CONTENT">
          <PricingTable tab="TEAM_CONTENT" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
