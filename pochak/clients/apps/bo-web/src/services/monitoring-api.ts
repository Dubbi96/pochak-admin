/**
 * Monitoring API service (Equipment & Broadcast monitoring)
 * Calls real admin API via gateway.
 */

import { gatewayApi } from "@/lib/api-client";

// ── Types ──────────────────────────────────────────────────────────

export type EquipmentType = "CAMERA" | "VPU" | "ENCODER";
export type EquipmentStatus = "ONLINE" | "OFFLINE" | "ERROR";
export type BroadcastStatus = "LIVE" | "STANDBY" | "ERROR";
export type AlertSeverity = "INFO" | "WARNING" | "CRITICAL";

export interface Equipment {
  id: number;
  name: string;
  venueId: number;
  venueName: string;
  type: EquipmentType;
  status: EquipmentStatus;
  lastPing: string;
  firmwareVersion: string;
  ipAddress: string;
}

export interface Broadcast {
  id: number;
  name: string;
  venueId: number;
  venueName: string;
  startTime: string;
  viewerCount: number;
  bitrateMbps: number;
  status: BroadcastStatus;
  resolution: string;
}

export interface MonitoringAlert {
  id: number;
  timestamp: string;
  severity: AlertSeverity;
  message: string;
  equipmentName?: string;
  venueName?: string;
  acknowledged: boolean;
}

export interface MonitoringOverview {
  totalEquipment: number;
  onlineEquipment: number;
  offlineEquipment: number;
  errorEquipment: number;
  activeBroadcasts: number;
  normalBroadcasts: number;
  warningBroadcasts: number;
  storageUsedPercent: number;
  storageTotalTB: number;
  storageUsedTB: number;
  networkAvgMbps: number;
}

// ── Label Maps ─────────────────────────────────────────────────────

export const EQUIPMENT_TYPE_LABELS: Record<EquipmentType, string> = {
  CAMERA: "카메라",
  VPU: "VPU",
  ENCODER: "인코더",
};

export const EQUIPMENT_STATUS_LABELS: Record<EquipmentStatus, string> = {
  ONLINE: "온라인",
  OFFLINE: "오프라인",
  ERROR: "오류",
};

export const BROADCAST_STATUS_LABELS: Record<BroadcastStatus, string> = {
  LIVE: "방송중",
  STANDBY: "대기",
  ERROR: "오류",
};

export const ALERT_SEVERITY_LABELS: Record<AlertSeverity, string> = {
  INFO: "정보",
  WARNING: "경고",
  CRITICAL: "위험",
};

// ── APIs ───────────────────────────────────────────────────────────

export async function getMonitoringOverview(): Promise<MonitoringOverview> {
  return gatewayApi.get<MonitoringOverview>("/api/v1/admin/monitoring/overview");
}

export async function getEquipmentList(): Promise<Equipment[]> {
  return gatewayApi.get<Equipment[]>("/api/v1/admin/monitoring/equipment");
}

export async function getBroadcastList(): Promise<Broadcast[]> {
  return gatewayApi.get<Broadcast[]>("/api/v1/admin/monitoring/broadcasts");
}

export async function getMonitoringAlerts(): Promise<MonitoringAlert[]> {
  return gatewayApi.get<MonitoringAlert[]>("/api/v1/admin/monitoring/alerts");
}

export async function acknowledgeAlert(id: number): Promise<void> {
  return gatewayApi.put(`/api/v1/admin/monitoring/alerts/${id}/acknowledge`);
}
