"use client";

import React, { useState } from "react";
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

// ── Types ────────────────────────────────────────────────────────────────────

interface RegisteredEquipment {
  equipmentType: string;
  vpuName: string;
  vpuSerial: string;
  venueId: string;
  registeredAt: string;
}

interface CHUEntry {
  chuSerial: string;
  vpuName: string;
  status: "정상" | "비활성" | "오류";
  registeredAt: string;
}

// ── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_EQUIPMENT: RegisteredEquipment[] = [
  {
    equipmentType: "VPU-200",
    vpuName: "서울FC 메인",
    vpuSerial: "VPU-SN-10001",
    venueId: "VEN-001",
    registeredAt: "2026-01-15",
  },
  {
    equipmentType: "VPU-300",
    vpuName: "부산 경기장 A",
    vpuSerial: "VPU-SN-10002",
    venueId: "VEN-002",
    registeredAt: "2026-01-28",
  },
  {
    equipmentType: "VPU-200",
    vpuName: "대전 메인구장",
    vpuSerial: "VPU-SN-10003",
    venueId: "VEN-003",
    registeredAt: "2026-02-10",
  },
  {
    equipmentType: "VPU-300",
    vpuName: "수원 체육관",
    vpuSerial: "VPU-SN-10004",
    venueId: "VEN-004",
    registeredAt: "2026-02-22",
  },
  {
    equipmentType: "VPU-200",
    vpuName: "인천 보조구장",
    vpuSerial: "VPU-SN-10005",
    venueId: "VEN-005",
    registeredAt: "2026-03-05",
  },
];

const MOCK_CHUS: CHUEntry[] = [
  { chuSerial: "CHU-SN-20001", vpuName: "서울FC 메인", status: "정상", registeredAt: "2026-01-15" },
  { chuSerial: "CHU-SN-20002", vpuName: "서울FC 메인", status: "정상", registeredAt: "2026-01-15" },
  { chuSerial: "CHU-SN-20003", vpuName: "부산 경기장 A", status: "정상", registeredAt: "2026-01-28" },
  { chuSerial: "CHU-SN-20004", vpuName: "부산 경기장 A", status: "비활성", registeredAt: "2026-01-28" },
  { chuSerial: "CHU-SN-20005", vpuName: "대전 메인구장", status: "정상", registeredAt: "2026-02-10" },
  { chuSerial: "CHU-SN-20006", vpuName: "수원 체육관", status: "오류", registeredAt: "2026-02-22" },
  { chuSerial: "CHU-SN-20007", vpuName: "수원 체육관", status: "정상", registeredAt: "2026-02-22" },
  { chuSerial: "CHU-SN-20008", vpuName: "인천 보조구장", status: "정상", registeredAt: "2026-03-05" },
];

// ── CHU Status Badge ─────────────────────────────────────────────────────────

function CHUStatusBadge({ status }: { status: CHUEntry["status"] }) {
  const variantMap: Record<CHUEntry["status"], "success" | "secondary" | "destructive"> = {
    "정상": "success",
    "비활성": "secondary",
    "오류": "destructive",
  };
  return <Badge variant={variantMap[status]}>{status}</Badge>;
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

  const handleSubmit = () => {
    if (!isValid) return;
    // TODO: API call
    alert("장비 등록 요청이 전송되었습니다.");
    handleReset();
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
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">VPU CHU 등록</h1>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="register">
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
                {MOCK_EQUIPMENT.map((eq, idx) => (
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
                {MOCK_CHUS.map((chu, idx) => (
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
