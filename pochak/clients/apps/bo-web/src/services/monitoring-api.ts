// TODO: [Mock→Real API] Wire to real backend endpoints once monitoring service is deployed. Keep mock for now.
/**
 * Monitoring API service (Equipment & Broadcast monitoring)
 * Currently returns mock data. Will be replaced with real API calls.
 */

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

// ── Mock Data ──────────────────────────────────────────────────────

const MOCK_EQUIPMENT: Equipment[] = [
  { id: 1, name: "AI-CAM-01", venueId: 1, venueName: "강남 풋살파크", type: "CAMERA", status: "ONLINE", lastPing: "2026-03-19T14:30:00", firmwareVersion: "v3.2.1", ipAddress: "192.168.1.101" },
  { id: 2, name: "PANO-01", venueId: 1, venueName: "강남 풋살파크", type: "CAMERA", status: "ONLINE", lastPing: "2026-03-19T14:30:00", firmwareVersion: "v3.2.1", ipAddress: "192.168.1.102" },
  { id: 3, name: "VPU-GN-01", venueId: 1, venueName: "강남 풋살파크", type: "VPU", status: "ONLINE", lastPing: "2026-03-19T14:30:00", firmwareVersion: "v2.1.0", ipAddress: "192.168.1.201" },
  { id: 4, name: "ENC-GN-01", venueId: 1, venueName: "강남 풋살파크", type: "ENCODER", status: "ONLINE", lastPing: "2026-03-19T14:30:00", firmwareVersion: "v1.5.3", ipAddress: "192.168.1.301" },
  { id: 5, name: "AI-CAM-02", venueId: 2, venueName: "인천 야구장", type: "CAMERA", status: "ONLINE", lastPing: "2026-03-19T14:28:00", firmwareVersion: "v3.2.1", ipAddress: "192.168.2.101" },
  { id: 6, name: "VPU-IC-01", venueId: 2, venueName: "인천 야구장", type: "VPU", status: "ONLINE", lastPing: "2026-03-19T14:28:00", firmwareVersion: "v2.1.0", ipAddress: "192.168.2.201" },
  { id: 7, name: "AI-CAM-03", venueId: 3, venueName: "잠실 체육관", type: "CAMERA", status: "OFFLINE", lastPing: "2026-03-19T12:15:00", firmwareVersion: "v3.1.0", ipAddress: "192.168.3.101" },
  { id: 8, name: "PANO-03", venueId: 3, venueName: "잠실 체육관", type: "CAMERA", status: "OFFLINE", lastPing: "2026-03-19T12:15:00", firmwareVersion: "v3.1.0", ipAddress: "192.168.3.102" },
  { id: 9, name: "VPU-JS-01", venueId: 3, venueName: "잠실 체육관", type: "VPU", status: "ERROR", lastPing: "2026-03-19T13:00:00", firmwareVersion: "v2.0.5", ipAddress: "192.168.3.201" },
  { id: 10, name: "ENC-JS-01", venueId: 3, venueName: "잠실 체육관", type: "ENCODER", status: "ONLINE", lastPing: "2026-03-19T14:29:00", firmwareVersion: "v1.5.3", ipAddress: "192.168.3.301" },
  { id: 11, name: "AI-CAM-04", venueId: 4, venueName: "수원 월드컵경기장", type: "CAMERA", status: "ONLINE", lastPing: "2026-03-19T14:30:00", firmwareVersion: "v3.2.1", ipAddress: "192.168.4.101" },
  { id: 12, name: "VPU-SW-01", venueId: 4, venueName: "수원 월드컵경기장", type: "VPU", status: "ONLINE", lastPing: "2026-03-19T14:30:00", firmwareVersion: "v2.1.0", ipAddress: "192.168.4.201" },
  { id: 13, name: "AI-CAM-07", venueId: 6, venueName: "대전 축구장", type: "CAMERA", status: "ERROR", lastPing: "2026-03-19T13:45:00", firmwareVersion: "v3.0.8", ipAddress: "192.168.6.101" },
  { id: 14, name: "ENC-DJ-01", venueId: 6, venueName: "대전 축구장", type: "ENCODER", status: "OFFLINE", lastPing: "2026-03-19T11:00:00", firmwareVersion: "v1.4.2", ipAddress: "192.168.6.301" },
];

const MOCK_BROADCASTS: Broadcast[] = [
  { id: 1, name: "강남 풋살 A조 1경기", venueId: 1, venueName: "강남 풋살파크", startTime: "2026-03-19T14:00:00", viewerCount: 1245, bitrateMbps: 8.5, status: "LIVE", resolution: "1080p" },
  { id: 2, name: "마포 3on3 예선", venueId: 5, venueName: "마포 체육관", startTime: "2026-03-19T10:00:00", viewerCount: 432, bitrateMbps: 6.2, status: "LIVE", resolution: "1080p" },
  { id: 3, name: "인천 야구 개막전", venueId: 2, venueName: "인천 야구장", startTime: "2026-03-19T18:00:00", viewerCount: 0, bitrateMbps: 0, status: "STANDBY", resolution: "4K" },
  { id: 4, name: "대전 시민 축구 결승", venueId: 6, venueName: "대전 축구장", startTime: "2026-03-19T15:00:00", viewerCount: 89, bitrateMbps: 2.1, status: "ERROR", resolution: "720p" },
  { id: 5, name: "잠실 배구 1라운드", venueId: 3, venueName: "잠실 체육관", startTime: "2026-03-20T14:00:00", viewerCount: 0, bitrateMbps: 0, status: "STANDBY", resolution: "1080p" },
];

const MOCK_ALERTS: MonitoringAlert[] = [
  { id: 1, timestamp: "2026-03-19T14:25:00", severity: "CRITICAL", message: "AI-CAM-07 장비 응답 없음 - 연결 오류 발생", equipmentName: "AI-CAM-07", venueName: "대전 축구장", acknowledged: false },
  { id: 2, timestamp: "2026-03-19T14:20:00", severity: "WARNING", message: "대전 시민 축구 결승 방송 비트레이트 저하 (2.1Mbps)", venueName: "대전 축구장", acknowledged: false },
  { id: 3, timestamp: "2026-03-19T13:45:00", severity: "CRITICAL", message: "VPU-JS-01 펌웨어 오류 감지 - 재부팅 필요", equipmentName: "VPU-JS-01", venueName: "잠실 체육관", acknowledged: false },
  { id: 4, timestamp: "2026-03-19T13:00:00", severity: "WARNING", message: "잠실 체육관 카메라 2대 오프라인 전환", venueName: "잠실 체육관", acknowledged: true },
  { id: 5, timestamp: "2026-03-19T12:30:00", severity: "INFO", message: "ENC-DJ-01 오프라인 전환 - 전원 차단 감지", equipmentName: "ENC-DJ-01", venueName: "대전 축구장", acknowledged: true },
  { id: 6, timestamp: "2026-03-19T11:15:00", severity: "WARNING", message: "스토리지 사용량 75% 초과 - 정리 필요", acknowledged: true },
  { id: 7, timestamp: "2026-03-19T10:00:00", severity: "INFO", message: "마포 체육관 방송 시작 - 3on3 챌린지 예선", venueName: "마포 체육관", acknowledged: true },
  { id: 8, timestamp: "2026-03-19T09:30:00", severity: "INFO", message: "강남 풋살파크 전 장비 온라인 확인 완료", venueName: "강남 풋살파크", acknowledged: true },
];

// ── Helpers ────────────────────────────────────────────────────────

function delay(ms = 300): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ── APIs ───────────────────────────────────────────────────────────

export async function getMonitoringOverview(): Promise<MonitoringOverview> {
  await delay(200);

  const online = MOCK_EQUIPMENT.filter((e) => e.status === "ONLINE").length;
  const offline = MOCK_EQUIPMENT.filter((e) => e.status === "OFFLINE").length;
  const error = MOCK_EQUIPMENT.filter((e) => e.status === "ERROR").length;
  const liveBroadcasts = MOCK_BROADCASTS.filter((b) => b.status === "LIVE");
  const errorBroadcasts = MOCK_BROADCASTS.filter((b) => b.status === "ERROR");

  return {
    totalEquipment: MOCK_EQUIPMENT.length,
    onlineEquipment: online,
    offlineEquipment: offline,
    errorEquipment: error,
    activeBroadcasts: liveBroadcasts.length + errorBroadcasts.length,
    normalBroadcasts: liveBroadcasts.length,
    warningBroadcasts: errorBroadcasts.length,
    storageUsedPercent: 68,
    storageTotalTB: 10,
    storageUsedTB: 6.8,
    networkAvgMbps: 156.3,
  };
}

export async function getEquipmentList(): Promise<Equipment[]> {
  await delay();
  return [...MOCK_EQUIPMENT];
}

export async function getBroadcastList(): Promise<Broadcast[]> {
  await delay();
  return [...MOCK_BROADCASTS];
}

export async function getMonitoringAlerts(): Promise<MonitoringAlert[]> {
  await delay(200);
  return [...MOCK_ALERTS];
}

export async function acknowledgeAlert(id: number): Promise<void> {
  await delay(150);
  const alert = MOCK_ALERTS.find((a) => a.id === id);
  if (alert) alert.acknowledged = true;
}
