/**
 * Promotion Management API service
 * Calls real admin API via gateway.
 */

import type { PageResponse } from "@/types/common";
import { gatewayApi } from "@/lib/api-client";

// ── Types ──────────────────────────────────────────────────────────

export type PromotionType = "COUPON" | "EVENT" | "GIFT_BALL";
export type DiscountType = "PERCENTAGE" | "FIXED" | "BALL_GRANT";
export type PromotionStatus = "ACTIVE" | "EXPIRED" | "DRAFT";
export type PromotionTargetType = "ALL" | "SPECIFIC_PRODUCT" | "SPECIFIC_CATEGORY";

export interface Promotion {
  id: number;
  name: string;
  code: string;
  type: PromotionType;
  discountType: DiscountType;
  discountValue: number;
  startDate: string;
  endDate: string;
  status: PromotionStatus;
  usageCount: number;
  maxUsageTotal: number;
  maxUsagePerUser: number;
  minPurchaseAmount: number;
  maxDiscountAmount: number | null;
  targetType: PromotionTargetType;
  targetIds: string[];
  createdBy: string;
  createdAt: string;
}

export interface PromotionCreateRequest {
  name: string;
  code: string;
  type: PromotionType;
  discountType: DiscountType;
  discountValue: number;
  startDate: string;
  endDate: string;
  maxUsageTotal: number;
  maxUsagePerUser: number;
  minPurchaseAmount: number;
  maxDiscountAmount: number | null;
  targetType: PromotionTargetType;
  targetIds: string[];
}

export interface PromotionFilter {
  status: PromotionStatus | "ALL";
  type: PromotionType | "ALL";
  dateFrom?: string;
  dateTo?: string;
  searchKeyword?: string;
}

// ── Label Maps ─────────────────────────────────────────────────────

export const PROMOTION_TYPE_LABELS: Record<string, string> = {
  ALL: "전체",
  COUPON: "쿠폰",
  EVENT: "이벤트",
  GIFT_BALL: "뽈 지급",
};

export const DISCOUNT_TYPE_LABELS: Record<string, string> = {
  PERCENTAGE: "비율(%)",
  FIXED: "고정금액(원)",
  BALL_GRANT: "뽈 지급",
};

export const PROMOTION_STATUS_LABELS: Record<string, string> = {
  ALL: "전체",
  ACTIVE: "활성",
  EXPIRED: "만료",
  DRAFT: "초안",
};

export const PROMOTION_TARGET_LABELS: Record<string, string> = {
  ALL: "전체",
  SPECIFIC_PRODUCT: "특정 상품",
  SPECIFIC_CATEGORY: "특정 카테고리",
};

// ── Promotion APIs ────────────────────────────────────────────────

export async function getPromotions(
  filters: PromotionFilter,
  page = 0,
  size = 20
): Promise<PageResponse<Promotion>> {
  const params: Record<string, string> = { page: String(page), size: String(size) };
  if (filters.status !== "ALL") params.status = filters.status;
  if (filters.type !== "ALL") params.type = filters.type;
  if (filters.dateFrom) params.dateFrom = filters.dateFrom;
  if (filters.dateTo) params.dateTo = filters.dateTo;
  if (filters.searchKeyword) params.searchKeyword = filters.searchKeyword;

  return gatewayApi.get<PageResponse<Promotion>>("/api/v1/admin/promotions", params);
}

export async function getPromotionById(id: number): Promise<Promotion> {
  return gatewayApi.get<Promotion>(`/api/v1/admin/promotions/${id}`);
}

export async function createPromotion(data: PromotionCreateRequest): Promise<Promotion> {
  return gatewayApi.post<Promotion>("/api/v1/admin/promotions", data);
}

export async function updatePromotion(
  id: number,
  data: PromotionCreateRequest
): Promise<Promotion> {
  return gatewayApi.put<Promotion>(`/api/v1/admin/promotions/${id}`, data);
}

export async function updatePromotionStatus(
  id: number,
  status: PromotionStatus
): Promise<Promotion> {
  return gatewayApi.put<Promotion>(`/api/v1/admin/promotions/${id}/status`, { status });
}

export async function deletePromotion(id: number): Promise<void> {
  return gatewayApi.delete(`/api/v1/admin/promotions/${id}`);
}

export async function generatePromoCode(): Promise<string> {
  return gatewayApi.get<string>("/api/v1/admin/promotions/generate-code");
}
