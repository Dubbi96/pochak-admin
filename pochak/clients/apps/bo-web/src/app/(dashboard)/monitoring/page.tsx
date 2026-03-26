"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Cpu,
  Radio,
  HardDrive,
  Wifi,
  AlertTriangle,
  CheckCircle2,
  Info,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import {
  getMonitoringOverview,
  getEquipmentList,
  getBroadcastList,
  getMonitoringAlerts,
  acknowledgeAlert,
  type Equipment,
  type Broadcast,
  type MonitoringAlert,
  type MonitoringOverview,
  type EquipmentStatus,
  type BroadcastStatus,
  type AlertSeverity,
  EQUIPMENT_TYPE_LABELS,
  EQUIPMENT_STATUS_LABELS,
  BROADCAST_STATUS_LABELS,
  ALERT_SEVERITY_LABELS,
} from "@/services/monitoring-api";
import { adminApi } from "@/lib/api-client";

// ── Helpers ────────────────────────────────────────────────────────

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function equipmentStatusDot(status: EquipmentStatus): string {
  switch (status) {
    case "ONLINE":
      return "bg-green-500";
    case "OFFLINE":
      return "bg-red-500";
    case "ERROR":
      return "bg-yellow-500";
  }
}

function broadcastStatusVariant(
  status: BroadcastStatus
): "default" | "destructive" | "secondary" | "success" | "warning" {
  switch (status) {
    case "LIVE":
      return "destructive";
    case "STANDBY":
      return "default";
    case "ERROR":
      return "warning";
  }
}

function alertSeverityIcon(severity: AlertSeverity) {
  switch (severity) {
    case "INFO":
      return <Info size={14} className="text-blue-500" />;
    case "WARNING":
      return <AlertTriangle size={14} className="text-yellow-500" />;
    case "CRITICAL":
      return <AlertCircle size={14} className="text-red-500" />;
  }
}

function alertSeverityBg(severity: AlertSeverity): string {
  switch (severity) {
    case "INFO":
      return "bg-blue-50 border-blue-200";
    case "WARNING":
      return "bg-yellow-50 border-yellow-200";
    case "CRITICAL":
      return "bg-red-50 border-red-200";
  }
}

// ── Overview Card ──────────────────────────────────────────────────

function OverviewCard({
  label,
  mainValue,
  subValues,
  icon,
  color,
}: {
  label: string;
  mainValue: string;
  subValues?: { label: string; value: string; color?: string }[];
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex items-center gap-3 mb-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-lg ${color}`}
        >
          {icon}
        </div>
        <div>
          <p className="text-xs text-gray-500">{label}</p>
          <p className="text-xl font-bold text-gray-900">{mainValue}</p>
        </div>
      </div>
      {subValues && (
        <div className="flex gap-3 border-t border-gray-100 pt-2">
          {subValues.map((sv) => (
            <div key={sv.label} className="text-xs">
              <span className="text-gray-400">{sv.label} </span>
              <span className={sv.color || "text-gray-700 font-medium"}>
                {sv.value}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────

export default function MonitoringPage() {
  const router = useRouter();
  const [overview, setOverview] = useState<MonitoringOverview | null>(null);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [alerts, setAlerts] = useState<MonitoringAlert[]>([]);
  const [loading, setLoading] = useState(true);

  // Broadcast detail popup
  const [selectedBroadcast, setSelectedBroadcast] = useState<Broadcast | null>(null);

  const fetchAll = React.useCallback(async () => {
    setLoading(true);
    try {
      // Try real API first, fall back to mock
      // TODO(Phase 4B): remove mock fallback once backend is stable
      const [apiOv, apiEq, apiBc, apiAl] = await Promise.all([
        adminApi.get<MonitoringOverview>("/admin/api/v1/monitoring/overview"),
        adminApi.get<Equipment[]>("/admin/api/v1/monitoring/equipment"),
        adminApi.get<Broadcast[]>("/admin/api/v1/monitoring/broadcasts"),
        adminApi.get<MonitoringAlert[]>("/admin/api/v1/monitoring/alerts"),
      ]);
      if (apiOv && apiEq && apiBc && apiAl) {
        setOverview(apiOv);
        setEquipment(apiEq);
        setBroadcasts(apiBc);
        setAlerts(apiAl);
        return;
      }

      // Mock fallback
      const [ov, eq, bc, al] = await Promise.all([
        getMonitoringOverview(),
        getEquipmentList(),
        getBroadcastList(),
        getMonitoringAlerts(),
      ]);
      setOverview(ov);
      setEquipment(eq);
      setBroadcasts(bc);
      setAlerts(al);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 30000);
    return () => clearInterval(interval);
  }, [fetchAll]);

  const handleAcknowledge = async (id: number) => {
    try {
      await acknowledgeAlert(id);
      setAlerts((prev) =>
        prev.map((a) => (a.id === id ? { ...a, acknowledged: true } : a))
      );
    } catch (err) {
      console.error("[Monitoring] Failed to acknowledge alert:", err);
    }
  };

  if (loading || !overview) {
    return (
      <div className="space-y-6">
        <h1 className="text-xl font-bold text-gray-900">모니터링 대시보드</h1>
        <div className="py-20 text-center text-gray-400 text-sm">
          로딩 중...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <h1 className="text-xl font-bold text-gray-900">모니터링 대시보드</h1>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <OverviewCard
          label="전체 장비"
          mainValue={`${overview.totalEquipment}대`}
          subValues={[
            { label: "온라인", value: `${overview.onlineEquipment}`, color: "text-green-600 font-medium" },
            { label: "오프라인", value: `${overview.offlineEquipment}`, color: "text-red-600 font-medium" },
            { label: "오류", value: `${overview.errorEquipment}`, color: "text-yellow-600 font-medium" },
          ]}
          icon={<Cpu size={20} className="text-blue-600" />}
          color="bg-blue-50"
        />
        <OverviewCard
          label="활성 방송"
          mainValue={`${overview.activeBroadcasts}개`}
          subValues={[
            { label: "정상", value: `${overview.normalBroadcasts}`, color: "text-green-600 font-medium" },
            { label: "경고", value: `${overview.warningBroadcasts}`, color: "text-yellow-600 font-medium" },
          ]}
          icon={<Radio size={20} className="text-red-600" />}
          color="bg-red-50"
        />
        <OverviewCard
          label="스토리지"
          mainValue={`${overview.storageUsedPercent}% 사용중`}
          subValues={[
            { label: "사용", value: `${overview.storageUsedTB}TB` },
            { label: "전체", value: `${overview.storageTotalTB}TB` },
          ]}
          icon={<HardDrive size={20} className="text-emerald-600" />}
          color="bg-emerald-50"
        />
        <OverviewCard
          label="네트워크"
          mainValue={`${overview.networkAvgMbps}Mbps`}
          subValues={[{ label: "평균 대역폭", value: "정상", color: "text-green-600 font-medium" }]}
          icon={<Wifi size={20} className="text-purple-600" />}
          color="bg-purple-50"
        />
      </div>

      {/* Equipment Status Table */}
      <div>
        <h2 className="mb-3 text-base font-semibold text-gray-900">
          장비 현황
        </h2>
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-xs font-medium uppercase tracking-wider text-gray-500">
                <th className="px-4 py-3">장비명</th>
                <th className="px-4 py-3">구장</th>
                <th className="px-4 py-3 text-center">유형</th>
                <th className="px-4 py-3 text-center w-[100px]">상태</th>
                <th className="px-4 py-3 text-center">마지막 핑</th>
                <th className="px-4 py-3 text-center">펌웨어</th>
              </tr>
            </thead>
            <tbody>
              {equipment.map((eq, idx) => (
                <tr
                  key={eq.id}
                  className={`border-b border-gray-100 transition-colors hover:bg-gray-50 ${
                    idx % 2 === 1 ? "bg-gray-50/50" : ""
                  }`}
                >
                  <td className="px-4 py-3 font-medium text-gray-900">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-block h-2.5 w-2.5 rounded-full ${equipmentStatusDot(eq.status)}`}
                      />
                      {eq.name}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{eq.venueName}</td>
                  <td className="px-4 py-3 text-center text-gray-600 text-xs">
                    {EQUIPMENT_TYPE_LABELS[eq.type]}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge
                      variant={
                        eq.status === "ONLINE"
                          ? "success"
                          : eq.status === "ERROR"
                          ? "warning"
                          : "destructive"
                      }
                    >
                      {EQUIPMENT_STATUS_LABELS[eq.status]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-center text-gray-500 text-xs whitespace-nowrap">
                    {formatDateTime(eq.lastPing)}
                  </td>
                  <td className="px-4 py-3 text-center text-gray-500 text-xs">
                    {eq.firmwareVersion}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Broadcast Status Table */}
      <div>
        <h2 className="mb-3 text-base font-semibold text-gray-900">
          방송 현황
        </h2>
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-xs font-medium uppercase tracking-wider text-gray-500">
                <th className="px-4 py-3">방송명</th>
                <th className="px-4 py-3">구장</th>
                <th className="px-4 py-3 text-center">시작시간</th>
                <th className="px-4 py-3 text-center">시청자수</th>
                <th className="px-4 py-3 text-center">비트레이트</th>
                <th className="px-4 py-3 text-center">해상도</th>
                <th className="px-4 py-3 text-center w-[100px]">상태</th>
              </tr>
            </thead>
            <tbody>
              {broadcasts.map((bc, idx) => (
                <tr
                  key={bc.id}
                  className={`border-b border-gray-100 transition-colors hover:bg-gray-50 cursor-pointer ${
                    idx % 2 === 1 ? "bg-gray-50/50" : ""
                  }`}
                  onClick={() => setSelectedBroadcast(bc)}
                >
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {bc.name}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{bc.venueName}</td>
                  <td className="px-4 py-3 text-center text-gray-600 text-xs whitespace-nowrap">
                    {formatDateTime(bc.startTime)}
                  </td>
                  <td className="px-4 py-3 text-center text-gray-700 font-medium">
                    {bc.viewerCount > 0
                      ? bc.viewerCount.toLocaleString()
                      : "-"}
                  </td>
                  <td className="px-4 py-3 text-center text-gray-600 text-xs">
                    {bc.bitrateMbps > 0 ? `${bc.bitrateMbps}Mbps` : "-"}
                  </td>
                  <td className="px-4 py-3 text-center text-gray-600 text-xs">
                    {bc.resolution}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant={broadcastStatusVariant(bc.status)}>
                      {bc.status === "LIVE" && (
                        <span className="relative mr-1.5 flex h-2 w-2">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                          <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
                        </span>
                      )}
                      {BROADCAST_STATUS_LABELS[bc.status]}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Broadcast Detail Popup */}
      <Dialog
        open={selectedBroadcast !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedBroadcast(null);
        }}
      >
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>방송 상세 정보</DialogTitle>
          </DialogHeader>
          {selectedBroadcast && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                <div>
                  <span className="text-gray-500">방송명</span>
                  <p className="font-medium text-gray-900">{selectedBroadcast.name}</p>
                </div>
                <div>
                  <span className="text-gray-500">구장</span>
                  <p className="font-medium text-gray-900">{selectedBroadcast.venueName}</p>
                </div>
                <div>
                  <span className="text-gray-500">시작시간</span>
                  <p className="text-gray-700">{formatDateTime(selectedBroadcast.startTime)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">상태</span>
                  <Badge variant={broadcastStatusVariant(selectedBroadcast.status)}>
                    {BROADCAST_STATUS_LABELS[selectedBroadcast.status]}
                  </Badge>
                </div>
                <div>
                  <span className="text-gray-500">비트레이트</span>
                  <p className="text-gray-700">
                    {selectedBroadcast.bitrateMbps > 0
                      ? `${selectedBroadcast.bitrateMbps} Mbps`
                      : "-"}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">해상도</span>
                  <p className="text-gray-700">{selectedBroadcast.resolution}</p>
                </div>
                <div>
                  <span className="text-gray-500">시청자수</span>
                  <p className="font-medium text-gray-900">
                    {selectedBroadcast.viewerCount > 0
                      ? selectedBroadcast.viewerCount.toLocaleString()
                      : "-"}
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    setSelectedBroadcast(null);
                    router.push("/contents/live");
                  }}
                >
                  <ExternalLink size={14} className="mr-1.5" />
                  콘텐츠 페이지에서 보기
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Alert Log */}
      <div>
        <h2 className="mb-3 text-base font-semibold text-gray-900">
          알림 로그
        </h2>
        <div className="space-y-2">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`flex items-start gap-3 rounded-lg border p-3 transition-colors ${
                alert.acknowledged
                  ? "border-gray-200 bg-white opacity-60"
                  : alertSeverityBg(alert.severity)
              }`}
            >
              <div className="mt-0.5">{alertSeverityIcon(alert.severity)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <Badge
                    variant={
                      alert.severity === "CRITICAL"
                        ? "destructive"
                        : alert.severity === "WARNING"
                        ? "warning"
                        : "default"
                    }
                    className="text-[10px] px-1.5 py-0"
                  >
                    {ALERT_SEVERITY_LABELS[alert.severity]}
                  </Badge>
                  {alert.venueName && (
                    <span className="text-xs text-gray-500">
                      {alert.venueName}
                    </span>
                  )}
                  {alert.equipmentName && (
                    <span className="text-xs text-gray-400">
                      {alert.equipmentName}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-700">{alert.message}</p>
                <p className="mt-1 text-xs text-gray-400">
                  {formatDateTime(alert.timestamp)}
                </p>
              </div>
              {!alert.acknowledged && (
                <button
                  onClick={() => handleAcknowledge(alert.id)}
                  className="shrink-0 rounded-md border border-gray-200 bg-white px-2.5 py-1 text-xs text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  확인
                </button>
              )}
              {alert.acknowledged && (
                <CheckCircle2
                  size={16}
                  className="shrink-0 text-green-500 mt-0.5"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
