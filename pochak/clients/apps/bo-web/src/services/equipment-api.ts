/**
 * Equipment Management API service (VPU Contracts, VPU Devices, CHU, Activation)
 * Calls real admin API via gateway.
 */

import type { PageResponse } from "@/types/common";
import { gatewayApi } from "@/lib/api-client";

// ── Types ──────────────────────────────────────────────────────────

export type PlatformType = "PIXELLOT" | "ARENA" | "UNDECIDED";

export type ActivationStatus =
  | "ACTIVATED"
  | "DEACTIVATED"
  | "ACTIVATING"
  | "ERROR"
  | "SUSPENDED"
  | "TERMINATED"
  | "TEST";

export interface VpuContract {
  id: number;
  platformType: PlatformType;
  modelName: string;
  vpuName: string;
  serialNumber: string;
  partner: string;
  activationStatus: ActivationStatus;
  vendor: string;
}

export interface VpuContractFilter {
  platformType?: string;
  activationStatus?: string;
  modelName?: string;
  vendor?: string;
  searchCondition?: string;
  keyword?: string;
}

export interface VpuDevice {
  id: number;
  name: string;
  modelName: string;
  serialNumber: string;
  activationStatus: ActivationStatus;
  platformType: PlatformType;
  vendor: string;
}

export interface VpuDeviceFilter {
  platformType?: string;
  activationStatus?: string;
  modelName?: string;
  searchCondition?: string;
  keyword?: string;
}

export interface RegisteredEquipment {
  equipmentType: string;
  vpuName: string;
  vpuSerial: string;
  venueId: string;
  registeredAt: string;
}

export type ChuStatus = "ACTIVE" | "INACTIVE" | "ERROR";

export interface ChuEntry {
  id: number;
  chuSerial: string;
  vpuName: string;
  status: ChuStatus;
  registeredAt: string;
}

export interface ActivationContract {
  id: string;
  companyName: string;
  customerName: string;
  registeredAt: string;
  status: "계약중" | "해지" | "대기";
  venueId: string;
  equipmentType: string;
  equipmentId: string;
}

export interface ActivationFilter {
  keyword?: string;
  status?: string;
  equipmentPresence?: string;
  equipmentType?: string;
}

// ── VPU Contract APIs ──────────────────────────────────────────────

export async function getVpuContracts(
  filters: VpuContractFilter,
  page = 0,
  size = 20
): Promise<PageResponse<VpuContract>> {
  const params: Record<string, string> = { page: String(page), size: String(size) };
  if (filters.platformType && filters.platformType !== "ALL") params.platformType = filters.platformType;
  if (filters.activationStatus && filters.activationStatus !== "ALL") params.activationStatus = filters.activationStatus;
  if (filters.modelName && filters.modelName !== "ALL") params.modelName = filters.modelName;
  if (filters.vendor && filters.vendor !== "ALL") params.vendor = filters.vendor;
  if (filters.keyword) {
    params.keyword = filters.keyword;
    if (filters.searchCondition) params.searchCondition = filters.searchCondition;
  }

  return gatewayApi.get<PageResponse<VpuContract>>("/api/v1/admin/equipment/vpu-contracts", params);
}

// ── VPU Device APIs ────────────────────────────────────────────────

export async function getVpuDevices(
  filters: VpuDeviceFilter,
  page = 0,
  size = 20
): Promise<PageResponse<VpuDevice>> {
  const params: Record<string, string> = { page: String(page), size: String(size) };
  if (filters.platformType && filters.platformType !== "ALL") params.platformType = filters.platformType;
  if (filters.activationStatus && filters.activationStatus !== "ALL") params.activationStatus = filters.activationStatus;
  if (filters.modelName && filters.modelName !== "ALL") params.modelName = filters.modelName;
  if (filters.keyword) {
    params.keyword = filters.keyword;
    if (filters.searchCondition) params.searchCondition = filters.searchCondition;
  }

  return gatewayApi.get<PageResponse<VpuDevice>>("/api/v1/admin/equipment/vpu-devices", params);
}

// ── CHU APIs ───────────────────────────────────────────────────────

export async function getRegisteredEquipment(
  page = 0,
  size = 20
): Promise<PageResponse<RegisteredEquipment>> {
  return gatewayApi.get<PageResponse<RegisteredEquipment>>(
    "/api/v1/admin/skylife/equipment",
    { page: String(page), size: String(size) }
  );
}

export async function getChus(
  page = 0,
  size = 20
): Promise<PageResponse<ChuEntry>> {
  return gatewayApi.get<PageResponse<ChuEntry>>(
    "/api/v1/admin/skylife/chus",
    { page: String(page), size: String(size) }
  );
}

export async function registerVpuChu(data: {
  equipmentType: string;
  vpuSerial: string;
  venueId: string;
  vpuName: string;
  chuSerials: string[];
}): Promise<void> {
  await gatewayApi.post("/api/v1/admin/skylife/register", data);
}

// ── Activation APIs ────────────────────────────────────────────────

export async function getActivationContracts(
  filters: ActivationFilter,
  page = 0,
  size = 20
): Promise<PageResponse<ActivationContract>> {
  const params: Record<string, string> = { page: String(page), size: String(size) };
  if (filters.keyword) params.keyword = filters.keyword;
  if (filters.status && filters.status !== "ALL") params.status = filters.status;
  if (filters.equipmentPresence && filters.equipmentPresence !== "ALL") params.equipmentPresence = filters.equipmentPresence;
  if (filters.equipmentType && filters.equipmentType !== "ALL") params.equipmentType = filters.equipmentType;

  return gatewayApi.get<PageResponse<ActivationContract>>("/api/v1/admin/skylife/activation", params);
}
