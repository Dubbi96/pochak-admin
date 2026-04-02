/**
 * Partner Admin API service
 * Manages partner approval, suspension, commission rates, settlements.
 */

import type { PageResponse } from "@/types/common";
import type {
  Partner,
  PartnerFilter,
  PartnerVenue,
  PartnerSettlement,
  PartnerStatus,
} from "@/types/partner";
import { gatewayApi } from "@/lib/api-client";

export const PARTNER_STATUS_LABELS: Record<PartnerStatus, string> = {
  PENDING: "승인대기",
  ACTIVE: "활성",
  SUSPENDED: "정지",
  REJECTED: "거절",
};

export async function getPartners(
  filter: PartnerFilter
): Promise<PageResponse<Partner>> {
  const params: Record<string, string> = {};
  if (filter.status) params.status = filter.status;
  if (filter.keyword) params.keyword = filter.keyword;
  if (filter.page !== undefined) params.page = String(filter.page);
  if (filter.size !== undefined) params.size = String(filter.size);

  return gatewayApi.get<PageResponse<Partner>>("/api/v1/admin/partners", params);
}

export async function getPartnerById(id: number): Promise<Partner> {
  return gatewayApi.get<Partner>(`/api/v1/admin/partners/${id}`);
}

export async function approvePartner(id: number): Promise<void> {
  await gatewayApi.post(`/api/v1/admin/partners/${id}/approve`);
}

export async function suspendPartner(
  id: number,
  reason: string
): Promise<void> {
  await gatewayApi.post(`/api/v1/admin/partners/${id}/suspend`, { reason });
}

export async function reactivatePartner(id: number): Promise<void> {
  await gatewayApi.post(`/api/v1/admin/partners/${id}/reactivate`);
}

export async function rejectPartner(
  id: number,
  reason: string
): Promise<void> {
  await gatewayApi.post(`/api/v1/admin/partners/${id}/reject`, { reason });
}

export async function updateCommissionRate(
  id: number,
  rate: number
): Promise<void> {
  await gatewayApi.patch(`/api/v1/admin/partners/${id}/commission`, {
    commissionRate: rate,
  });
}

export async function getPartnerVenues(
  partnerId: number
): Promise<PartnerVenue[]> {
  return gatewayApi.get<PartnerVenue[]>(
    `/api/v1/admin/partners/${partnerId}/venues`
  );
}

export async function getPartnerSettlements(
  partnerId: number,
  params?: { page?: number; size?: number }
): Promise<PageResponse<PartnerSettlement>> {
  const q: Record<string, string> = {};
  if (params?.page !== undefined) q.page = String(params.page);
  if (params?.size !== undefined) q.size = String(params.size);

  return gatewayApi.get<PageResponse<PartnerSettlement>>(
    `/api/v1/admin/partners/${partnerId}/settlements`,
    q
  );
}
