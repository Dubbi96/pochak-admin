/**
 * Commerce Management API service
 * Calls real admin API via gateway.
 */

import type { PageResponse } from "@/types/common";
import { gatewayApi } from "@/lib/api-client";

// ── Types ──────────────────────────────────────────────────────────

// Point History
export type PointType = "ALL" | "CHARGE" | "EARN" | "USE" | "CANCEL" | "EXPIRE";

export interface PointHistory {
  id: number;
  type: "CHARGE" | "EARN" | "USE" | "CANCEL" | "EXPIRE";
  paymentMethod: string;
  description: string;
  amount: number;
  userName: string;
  userEmail: string;
  processedAt: string;
}

export interface PointHistoryFilter {
  dateFrom?: string;
  dateTo?: string;
  type: PointType;
  searchType?: string;
  searchKeyword?: string;
}

// Season Pass
export type SeasonPassCategory = "ALL" | "INDIVIDUAL" | "TEAM" | "COMPETITION" | "LEAGUE";
export type PublishStatus = "ALL" | "PUBLISHED" | "UNPUBLISHED";

export type SeasonPassTier = "BASIC" | "PRO" | "PREMIUM";

export interface SeasonPass {
  id: number;
  category: "INDIVIDUAL" | "TEAM" | "COMPETITION" | "LEAGUE";
  name: string;
  amount: number;
  status: "PUBLISHED" | "UNPUBLISHED";
  createdAt: string;
  updatedBy: string;
  tier: SeasonPassTier;
  durationDays: number;
  features: string[];
  isActive: boolean;
}

export interface SeasonPassFilter {
  category: SeasonPassCategory;
  status: PublishStatus;
  searchKeyword?: string;
}

export interface SeasonPassCreateRequest {
  category: "INDIVIDUAL" | "TEAM" | "COMPETITION" | "LEAGUE";
  name: string;
  amount: number;
  status: "PUBLISHED" | "UNPUBLISHED";
  tier: SeasonPassTier;
  durationDays: number;
  features: string[];
}

// Ball Settings
export interface BallExchangeRate {
  id: number;
  ballPerWon: number;
  updatedBy: string;
  updatedAt: string;
}

export interface BallChargeOption {
  id: number;
  ballAmount: number;
  wonAmount: number;
  createdBy: string;
  createdAt: string;
}

export interface BallChargeOptionCreateRequest {
  ballAmount: number;
  wonAmount: number;
}

// Refund
export type RefundCategory = "ALL" | "CHARGE_REFUND";
export type RefundKind = "ALL" | "BALL" | "SEASON_PASS";
export type RefundStatus = "ALL" | "REQUESTED" | "COMPLETED" | "REJECTED";

export interface BulkBallGrantRequest {
  userIds: number[];
  amount: number;
  reason: string;
}

export interface BulkBallGrantUser {
  id: number;
  name: string;
  email: string;
  currentBall: number;
}

export interface Refund {
  id: number;
  status: "REQUESTED" | "COMPLETED" | "REJECTED";
  category: "CHARGE_REFUND";
  kind: "BALL" | "SEASON_PASS";
  requesterName: string;
  requesterEmail: string;
  requestedAt: string;
  processorName: string | null;
  processedAt: string | null;
  amount: number;
  wonAmount: number;
  reason: string;
  rejectReason: string | null;
  originalTransactionId: string;
  paymentMethod: string;
}

export interface RefundFilter {
  category: RefundCategory;
  kind: RefundKind;
  status: RefundStatus;
  searchKeyword?: string;
}

// Pricing
export type PricingTab = "CLIP" | "TEAM_CONTENT";

export interface PricingItem {
  id: number;
  tab: PricingTab;
  criteria: string;
  ballAmount: number;
  wonAmount: number;
  createdBy: string;
  createdAt: string;
  status: "PUBLISHED" | "UNPUBLISHED";
}

export interface PricingUpdateRequest {
  ballAmount: number;
  wonAmount: number;
  status: "PUBLISHED" | "UNPUBLISHED";
}

// ── Label Maps ─────────────────────────────────────────────────────

export const POINT_TYPE_LABELS: Record<string, string> = {
  ALL: "전체",
  CHARGE: "충전",
  EARN: "적립",
  USE: "사용",
  CANCEL: "취소내역",
  EXPIRE: "만료",
};

export const SEASON_PASS_CATEGORY_LABELS: Record<string, string> = {
  ALL: "전체",
  INDIVIDUAL: "개인",
  TEAM: "팀",
  COMPETITION: "대회",
  LEAGUE: "리그",
};

export const REFUND_CATEGORY_LABELS: Record<string, string> = {
  ALL: "전체",
  CHARGE_REFUND: "충전환불",
};

export const REFUND_KIND_LABELS: Record<string, string> = {
  ALL: "전체",
  BALL: "뽈",
  SEASON_PASS: "시즌권",
};

export const REFUND_STATUS_LABELS: Record<string, string> = {
  ALL: "전체",
  REQUESTED: "환불신청",
  COMPLETED: "환불완료",
  REJECTED: "거절",
};

export const SEASON_PASS_TIER_LABELS: Record<SeasonPassTier, string> = {
  BASIC: "BASIC",
  PRO: "PRO",
  PREMIUM: "PREMIUM",
};

export const SEASON_PASS_TIER_FEATURES: Record<SeasonPassTier, string[]> = {
  BASIC: ["클립 시청", "기본 하이라이트"],
  PRO: ["클립 시청", "기본 하이라이트", "풀경기 시청", "다운로드"],
  PREMIUM: ["클립 시청", "기본 하이라이트", "풀경기 시청", "다운로드", "프리미엄 콘텐츠", "광고제거"],
};

// ── Point History APIs ────────────────────────────────────────────

export async function getPointHistory(
  filters: PointHistoryFilter,
  page = 0,
  size = 20
): Promise<PageResponse<PointHistory>> {
  const params: Record<string, string> = { page: String(page), size: String(size) };
  if (filters.type !== "ALL") params.type = filters.type;
  if (filters.searchKeyword) {
    params.searchKeyword = filters.searchKeyword;
    params.searchType = filters.searchType || "name";
  }
  if (filters.dateFrom) params.dateFrom = filters.dateFrom;
  if (filters.dateTo) params.dateTo = filters.dateTo;

  return gatewayApi.get<PageResponse<PointHistory>>("/api/v1/admin/commerce/points/history", params);
}

// ── Season Pass APIs ──────────────────────────────────────────────

export async function getSeasonPasses(
  filters: SeasonPassFilter,
  page = 0,
  size = 20
): Promise<PageResponse<SeasonPass>> {
  const params: Record<string, string> = { page: String(page), size: String(size) };
  if (filters.category !== "ALL") params.category = filters.category;
  if (filters.status !== "ALL") params.status = filters.status;
  if (filters.searchKeyword) params.searchKeyword = filters.searchKeyword;

  return gatewayApi.get<PageResponse<SeasonPass>>("/api/v1/admin/commerce/season-passes", params);
}

export async function createSeasonPass(data: SeasonPassCreateRequest): Promise<SeasonPass> {
  return gatewayApi.post<SeasonPass>("/api/v1/admin/commerce/season-passes", data);
}

export async function updateSeasonPass(id: number, data: SeasonPassCreateRequest): Promise<SeasonPass> {
  return gatewayApi.put<SeasonPass>(`/api/v1/admin/commerce/season-passes/${id}`, data);
}

// ── Ball Settings APIs ────────────────────────────────────────────

export async function getBallExchangeRate(): Promise<BallExchangeRate> {
  return gatewayApi.get<BallExchangeRate>("/api/v1/admin/commerce/ball/exchange-rate");
}

export async function updateBallExchangeRate(ballPerWon: number): Promise<BallExchangeRate> {
  return gatewayApi.put<BallExchangeRate>("/api/v1/admin/commerce/ball/exchange-rate", { ballPerWon });
}

export async function getBallChargeOptions(): Promise<BallChargeOption[]> {
  return gatewayApi.get<BallChargeOption[]>("/api/v1/admin/commerce/ball/charge-options");
}

export async function createBallChargeOption(data: BallChargeOptionCreateRequest): Promise<BallChargeOption> {
  return gatewayApi.post<BallChargeOption>("/api/v1/admin/commerce/ball/charge-options", data);
}

export async function updateBallChargeOption(id: number, data: BallChargeOptionCreateRequest): Promise<BallChargeOption> {
  return gatewayApi.put<BallChargeOption>(`/api/v1/admin/commerce/ball/charge-options/${id}`, data);
}

export async function deleteBallChargeOption(id: number): Promise<void> {
  await gatewayApi.delete(`/api/v1/admin/commerce/ball/charge-options/${id}`);
}

// ── Refund APIs ───────────────────────────────────────────────────

export async function getRefunds(
  filters: RefundFilter,
  page = 0,
  size = 20
): Promise<PageResponse<Refund>> {
  const params: Record<string, string> = { page: String(page), size: String(size) };
  if (filters.category !== "ALL") params.category = filters.category;
  if (filters.kind !== "ALL") params.kind = filters.kind;
  if (filters.status !== "ALL") params.status = filters.status;
  if (filters.searchKeyword) params.searchKeyword = filters.searchKeyword;

  return gatewayApi.get<PageResponse<Refund>>("/api/v1/admin/commerce/refunds", params);
}

export async function approveRefund(id: number): Promise<Refund> {
  return gatewayApi.put<Refund>(`/api/v1/admin/commerce/refunds/${id}/process`, {
    approved: true,
  });
}

export async function rejectRefund(id: number, reason?: string): Promise<Refund> {
  return gatewayApi.put<Refund>(`/api/v1/admin/commerce/refunds/${id}/process`, {
    approved: false,
    adminNote: reason,
  });
}

export async function getRefundById(id: number): Promise<Refund> {
  return gatewayApi.get<Refund>(`/api/v1/admin/commerce/refunds/${id}`);
}

// ── Bulk Ball Grant APIs ────────────────────────────────────────────

export async function getBulkBallGrantUsers(searchKeyword?: string): Promise<BulkBallGrantUser[]> {
  const params: Record<string, string> = {};
  if (searchKeyword) params.search = searchKeyword;
  return gatewayApi.get<BulkBallGrantUser[]>("/api/v1/admin/commerce/ball/grant/users", params);
}

export async function bulkGrantBalls(request: BulkBallGrantRequest): Promise<void> {
  await gatewayApi.post("/api/v1/admin/commerce/ball/grant", request);
}

// ── Season Pass Activation API ──────────────────────────────────────

export async function toggleSeasonPassActive(id: number): Promise<SeasonPass> {
  return gatewayApi.put<SeasonPass>(`/api/v1/admin/commerce/season-passes/${id}/toggle-active`);
}

// ── Point History Export API ────────────────────────────────────────

export async function exportPointHistoryCsv(filters: PointHistoryFilter): Promise<string> {
  const params: Record<string, string> = {};
  if (filters.type !== "ALL") params.type = filters.type;
  if (filters.searchKeyword) {
    params.searchKeyword = filters.searchKeyword;
    params.searchType = filters.searchType || "name";
  }
  if (filters.dateFrom) params.dateFrom = filters.dateFrom;
  if (filters.dateTo) params.dateTo = filters.dateTo;

  return gatewayApi.getText("/api/v1/admin/commerce/points/history/export", params);
}

// ── Pricing APIs ──────────────────────────────────────────────────

export async function getPricing(tab: PricingTab): Promise<PricingItem[]> {
  return gatewayApi.get<PricingItem[]>("/api/v1/admin/commerce/pricing", { tab });
}

export async function updatePricing(id: number, data: PricingUpdateRequest): Promise<PricingItem> {
  return gatewayApi.put<PricingItem>(`/api/v1/admin/commerce/pricing/${id}`, data);
}

// ── Remaining Points APIs ─────────────────────────────────────────

export interface RemainingPointUser {
  id: number;
  name: string;
  email: string;
  remainingBall: number;
  remainingPaid: number;
  remainingBonus: number;
  totalCharged: number;
}

export interface RemainingPointStats {
  totalUsersWithBall: number;
  totalRemainingBall: number;
  totalRemainingPaid: number;
  totalRemainingBonus: number;
  totalChargedAmount: number;
  totalPaidChargedAmount: number;
  totalBonusChargedAmount: number;
}

export interface RemainingPointFilter {
  searchType?: string;
  searchKeyword?: string;
}

export async function getRemainingPointStats(): Promise<RemainingPointStats> {
  return gatewayApi.get<RemainingPointStats>("/api/v1/admin/commerce/points/remaining/stats");
}

export async function getRemainingPointUsers(
  filters: RemainingPointFilter,
  page = 0,
  size = 20
): Promise<PageResponse<RemainingPointUser>> {
  const params: Record<string, string> = { page: String(page), size: String(size) };
  if (filters.searchKeyword) {
    params.searchKeyword = filters.searchKeyword;
    params.searchType = filters.searchType || "name";
  }

  return gatewayApi.get<PageResponse<RemainingPointUser>>("/api/v1/admin/commerce/points/remaining/users", params);
}

// ── Season Pass History APIs ──────────────────────────────────────

export interface SeasonPassHistoryStats {
  totalCount: number;
  activeCount: number;
  expiredCount: number;
  cancelledRefundedCount: number;
  subscriptionActiveCount: number;
  totalRevenue: number;
  refundAmount: number;
  netRevenue: number;
  pgPayment: number;
  googlePlay: number;
  appStore: number;
}

export interface SeasonPassDailyRevenue {
  date: string;
  newPurchases: number;
  renewals: number;
  cancellations: number;
  revenue: number;
  refunds: number;
  netRevenue: number;
}

export interface SeasonPassHistoryItem {
  id: number;
  userName: string;
  userEmail: string;
  passName: string;
  productType: string;
  platform: string;
  status: "ACTIVE" | "EXPIRED" | "CANCELLED" | "REFUNDED";
  amount: number;
  purchasedAt: string;
  expiresAt: string;
}

export interface SeasonPassHistoryStatsFilter {
  period?: string;
  platform?: string;
  productType?: string;
  seasonPass?: string;
}

export interface SeasonPassHistoryListFilter {
  dateFrom?: string;
  dateTo?: string;
  searchKeyword?: string;
}

export async function getSeasonPassHistoryStats(
  filters: SeasonPassHistoryStatsFilter
): Promise<SeasonPassHistoryStats> {
  const params: Record<string, string> = {};
  if (filters.period && filters.period !== "ALL") params.period = filters.period;
  if (filters.platform && filters.platform !== "ALL") params.platform = filters.platform;
  if (filters.productType && filters.productType !== "ALL") params.productType = filters.productType;
  if (filters.seasonPass && filters.seasonPass !== "ALL") params.seasonPass = filters.seasonPass;

  return gatewayApi.get<SeasonPassHistoryStats>("/api/v1/admin/commerce/season-passes/history/stats", params);
}

export async function getSeasonPassDailyRevenue(
  filters: SeasonPassHistoryStatsFilter
): Promise<SeasonPassDailyRevenue[]> {
  const params: Record<string, string> = {};
  if (filters.period && filters.period !== "ALL") params.period = filters.period;
  if (filters.platform && filters.platform !== "ALL") params.platform = filters.platform;

  return gatewayApi.get<SeasonPassDailyRevenue[]>("/api/v1/admin/commerce/season-passes/history/daily", params);
}

export async function getSeasonPassHistoryList(
  filters: SeasonPassHistoryListFilter,
  page = 0,
  size = 20
): Promise<PageResponse<SeasonPassHistoryItem>> {
  const params: Record<string, string> = { page: String(page), size: String(size) };
  if (filters.dateFrom) params.dateFrom = filters.dateFrom;
  if (filters.dateTo) params.dateTo = filters.dateTo;
  if (filters.searchKeyword) params.searchKeyword = filters.searchKeyword;

  return gatewayApi.get<PageResponse<SeasonPassHistoryItem>>("/api/v1/admin/commerce/season-passes/history", params);
}

// ── Gift Ball APIs ────────────────────────────────────────────────

export interface GiftBall {
  id: number;
  name: string;
  dateFrom: string;
  dateTo: string;
  product: string;
  issuedCount: number;
  status: "INACTIVE" | "ACTIVE" | "PENDING" | "STOPPED" | "ENDED";
  usagePercent: number;
}

export interface GiftBallFilter {
  dateFrom?: string;
  dateTo?: string;
  status?: string;
  product?: string;
  searchName?: string;
}

export async function getGiftBallList(
  filters: GiftBallFilter,
  page = 0,
  size = 20
): Promise<PageResponse<GiftBall>> {
  const params: Record<string, string> = { page: String(page), size: String(size) };
  if (filters.dateFrom) params.dateFrom = filters.dateFrom;
  if (filters.dateTo) params.dateTo = filters.dateTo;
  if (filters.status && filters.status !== "ALL") params.status = filters.status;
  if (filters.product && filters.product !== "ALL") params.product = filters.product;
  if (filters.searchName) params.searchName = filters.searchName;

  return gatewayApi.get<PageResponse<GiftBall>>("/api/v1/admin/commerce/gift-balls", params);
}
