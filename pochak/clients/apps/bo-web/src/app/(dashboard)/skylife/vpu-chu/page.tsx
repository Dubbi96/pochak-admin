"use client";

import React, { useState, useEffect } from "react";
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
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import {
  getRegisteredEquipment,
  getChus,
  registerVpuChu,
} from "@/services/equipment-api";
import type { RegisteredEquipment, ChuEntry } from "@/services/equipment-api";

// ── CHU Status Badge ─────────────────────────────────────────────────────────

const CHU_STATUS_LABELS: Record<string, string> = {
  ACTIVE: "정상",
  INACTIVE: "비활성",
  ERROR: "오류",
};

function CHUStatusBadge({ status }: { status: ChuEntry["status"] }) {
  const variantMap: Record<string, "success" | "secondary" | "destructive"> = {
    ACTIVE: "success",
    INACTIVE: "secondary",
    ERROR: "destructive",
  };
  return <Badge variant={variantMap[status] ?? "secondary"}>{CHU_STATUS_LABELS[status] ?? status}</Badge>;
}

// ── Registration Form Tab ────────────────────────────────────────────────────

function RegistrationForm() {
  const [equipmentType, setEquipmentType] = useState("");
  const [vpuSerial, setVpuSerial] = useState("");
  const [venueId, setVenueId] = useState("");
  const [vpuName, setVpuName] = useState("");
  const [chuSerials, setChuSerials] = useState("");

  const isValid =
    equipmentType && vpuSerial.trim() && venueId.trim() && vpuName.trim() && chuSerials.trim();

  const handleReset = () => {
    setEquipmentType("");
    setVpuSerial("");
    setVenueId("");
    setVpuName("");
    setChuSerials("");
  };

  const handleSubmit = async () => {
    if (!isValid) return;
    try {
      const chuList = chuSerials
        .split(/[,\n]/)
        .map((s) => s.trim())
        .filter(Boolean);
      await registerVpuChu({
        equipmentType,
        vpuSerial: vpuSerial.trim(),
        venueId: venueId.trim(),
        vpuName: vpuName.trim(),
        chuSerials: chuList,
      });
      alert("장비 등록 요청이 전송되었습니다.");
      handleReset();
    } catch {
      alert("장비 등록에 실패하였습니다. 다시 시도해 주세요.");
    }
  };

  return (
    <div className="max-w-lg space-y-5 rounded-lg border border-gray-200 bg-white p-6">
      {/* 장비 타입 */}
      <div className="space-y-1.5">
        <Label>
          장비 타입 <span className="text-red-500">*</span>
        </Label>
        <Select value={equipmentType} onValueChange={setEquipmentType}>
          <SelectTrigger>
            <SelectValue placeholder="장비 타입을 선택하세요" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="VPU-200">VPU-200</SelectItem>
            <SelectItem value="VPU-300">VPU-300</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* VPU 시리얼번호 */}
      <div className="space-y-1.5">
        <Label>
          VPU 시리얼번호 <span className="text-red-500">*</span>
        </Label>
        <Input
          value={vpuSerial}
          onChange={(e) => setVpuSerial(e.target.value)}
          placeholder="VPU-SN-XXXXX"
        />
      </div>

      {/* Venue ID */}
      <div className="space-y-1.5">
        <Label>
          Venue ID <span className="text-red-500">*</span>
        </Label>
        <Input
          value={venueId}
          onChange={(e) => setVenueId(e.target.value)}
          placeholder="VEN-XXX"
        />
      </div>

      {/* VPU 이름 */}
      <div className="space-y-1.5">
        <Label>
          VPU 이름 <span className="text-red-500">*</span>
        </Label>
        <Input
          value={vpuName}
          onChange={(e) => setVpuName(e.target.value)}
          placeholder="VPU 이름을 입력하세요"
        />
      </div>

      {/* CHU 시리얼번호 */}
      <div className="space-y-1.5">
        <Label>
          CHU 시리얼번호 <span className="text-red-500">*</span>
        </Label>
        <Textarea
          value={chuSerials}
          onChange={(e) => setChuSerials(e.target.value)}
          placeholder="쉼표 또는 줄바꿈으로 구분하여 여러 개 입력&#10;예: CHU-SN-001, CHU-SN-002"
          rows={4}
        />
        <p className="text-xs text-gray-400">쉼표(,) 또는 줄바꿈으로 구분하여 여러 개 입력 가능</p>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button onClick={handleSubmit} disabled={!isValid}>
          등록
        </Button>
        <Button variant="outline" onClick={handleReset}>
          초기화
        </Button>
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function VpuChuPage() {
  const [equipment, setEquipment] = useState<RegisteredEquipment[]>([]);
  const [chus, setChus] = useState<ChuEntry[]>([]);
  const [equipmentLoading, setEquipmentLoading] = useState(false);
  const [chuLoading, setChuLoading] = useState(false);
  const [equipmentError, setEquipmentError] = useState<string | null>(null);
  const [chuError, setChuError] = useState<string | null>(null);

  const fetchEquipment = async () => {
    setEquipmentLoading(true);
    setEquipmentError(null);
    try {
      const result = await getRegisteredEquipment();
      setEquipment(result.content);
    } catch {
      setEquipmentError("데이터를 불러오지 못했습니다.");
    } finally {
      setEquipmentLoading(false);
    }
  };

  const fetchChus = async () => {
    setChuLoading(true);
    setChuError(null);
    try {
      const result = await getChus();
      setChus(result.content);
    } catch {
      setChuError("데이터를 불러오지 못했습니다.");
    } finally {
      setChuLoading(false);
    }
  };

  const handleTabChange = (value: string) => {
    if (value === "equipment-list") fetchEquipment();
    if (value === "chu-list") fetchChus();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">VPU CHU 등록</h1>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="register" onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="register">장비 등록</TabsTrigger>
          <TabsTrigger value="equipment-list">등록 장비 목록</TabsTrigger>
          <TabsTrigger value="chu-list">CHU 리스트</TabsTrigger>
        </TabsList>

        {/* ── 장비 등록 Tab ───────────────────────────────────────────────── */}
        <TabsContent value="register">
          <RegistrationForm />
        </TabsContent>

        {/* ── 등록 장비 목록 Tab ──────────────────────────────────────────── */}
        <TabsContent value="equipment-list">
          <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-xs font-medium uppercase tracking-wider text-gray-500">
                  <th className="px-4 py-3 text-center w-[60px]">NO</th>
                  <th className="px-4 py-3">장비타입</th>
                  <th className="px-4 py-3">VPU명</th>
                  <th className="px-4 py-3">VPU 시리얼</th>
                  <th className="px-4 py-3">Venue ID</th>
                  <th className="px-4 py-3">등록일</th>
                </tr>
              </thead>
              <tbody>
                {equipmentLoading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-gray-400">로딩 중...</td>
                  </tr>
                ) : equipmentError ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-red-400">{equipmentError}</td>
                  </tr>
                ) : equipment.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-gray-400">데이터가 없습니다.</td>
                  </tr>
                ) : equipment.map((eq, idx) => (
                  <tr
                    key={eq.vpuSerial}
                    className={`border-b border-gray-100 transition-colors hover:bg-gray-50 ${idx % 2 === 1 ? "bg-gray-50/50" : ""}`}
                  >
                    <td className="px-4 py-3 text-center text-gray-500">{idx + 1}</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline">{eq.equipmentType}</Badge>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">{eq.vpuName}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">{eq.vpuSerial}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">{eq.venueId}</td>
                    <td className="px-4 py-3 text-gray-600">{eq.registeredAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* ── CHU 리스트 Tab ──────────────────────────────────────────────── */}
        <TabsContent value="chu-list">
          <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-xs font-medium uppercase tracking-wider text-gray-500">
                  <th className="px-4 py-3 text-center w-[60px]">NO</th>
                  <th className="px-4 py-3">CHU 시리얼</th>
                  <th className="px-4 py-3">VPU명</th>
                  <th className="px-4 py-3">상태</th>
                  <th className="px-4 py-3">등록일</th>
                </tr>
              </thead>
              <tbody>
                {chuLoading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-gray-400">로딩 중...</td>
                  </tr>
                ) : chuError ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-red-400">{chuError}</td>
                  </tr>
                ) : chus.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-gray-400">데이터가 없습니다.</td>
                  </tr>
                ) : chus.map((chu, idx) => (
                  <tr
                    key={chu.chuSerial}
                    className={`border-b border-gray-100 transition-colors hover:bg-gray-50 ${idx % 2 === 1 ? "bg-gray-50/50" : ""}`}
                  >
                    <td className="px-4 py-3 text-center text-gray-500">{idx + 1}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">{chu.chuSerial}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{chu.vpuName}</td>
                    <td className="px-4 py-3">
                      <CHUStatusBadge status={chu.status} />
                    </td>
                    <td className="px-4 py-3 text-gray-600">{chu.registeredAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
