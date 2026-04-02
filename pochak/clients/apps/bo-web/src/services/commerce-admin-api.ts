/**
 * Commerce Management API service
 * Calls real admin API via gateway, with mock fallback.
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

// ── Mock Data ──────────────────────────────────────────────────────

const MOCK_POINT_HISTORY: PointHistory[] = [
  { id: 1, type: "CHARGE", paymentMethod: "카드결제", description: "뽈 충전 5,000뽈", amount: 5000, userName: "김민수", userEmail: "minsu@gmail.com", processedAt: "2026-01-15" },
  { id: 2, type: "USE", paymentMethod: "-", description: "클립 다운로드", amount: -300, userName: "이수진", userEmail: "sujin@naver.com", processedAt: "2026-01-16" },
  { id: 3, type: "EARN", paymentMethod: "-", description: "이벤트 적립", amount: 100, userName: "박정호", userEmail: "jh.park@gmail.com", processedAt: "2026-01-17" },
  { id: 4, type: "CANCEL", paymentMethod: "카드결제", description: "충전 취소", amount: -5000, userName: "김민수", userEmail: "minsu@gmail.com", processedAt: "2026-01-18" },
  { id: 5, type: "EXPIRE", paymentMethod: "-", description: "뽈 유효기간 만료", amount: -200, userName: "최예린", userEmail: "yerin@icloud.com", processedAt: "2026-01-20" },
  { id: 6, type: "CHARGE", paymentMethod: "계좌이체", description: "뽈 충전 10,000뽈", amount: 10000, userName: "정태우", userEmail: "taewoo@kakao.com", processedAt: "2026-02-01" },
  { id: 7, type: "USE", paymentMethod: "-", description: "시즌권 구매", amount: -3000, userName: "한지은", userEmail: "jieun@naver.com", processedAt: "2026-02-05" },
  { id: 8, type: "CHARGE", paymentMethod: "카드결제", description: "뽈 충전 1,000뽈", amount: 1000, userName: "오성민", userEmail: "sungmin@gmail.com", processedAt: "2026-02-10" },
  { id: 9, type: "USE", paymentMethod: "-", description: "팀 콘텐츠 구매", amount: -500, userName: "윤서현", userEmail: "seohyun@gmail.com", processedAt: "2026-02-15" },
  { id: 10, type: "EARN", paymentMethod: "-", description: "친구 초대 적립", amount: 500, userName: "송유진", userEmail: "yujin@naver.com", processedAt: "2026-03-01" },
];

let MOCK_SEASON_PASSES: SeasonPass[] = [
  { id: 1, category: "INDIVIDUAL", name: "3일 시즌권", amount: 1500, status: "PUBLISHED", createdAt: "2025-10-01", updatedBy: "admin", tier: "BASIC", durationDays: 3, features: ["클립 시청", "기본 하이라이트"], isActive: true },
  { id: 2, category: "INDIVIDUAL", name: "7일 시즌권", amount: 3000, status: "PUBLISHED", createdAt: "2025-10-01", updatedBy: "admin", tier: "BASIC", durationDays: 7, features: ["클립 시청", "기본 하이라이트"], isActive: true },
  { id: 3, category: "INDIVIDUAL", name: "30일 시즌권", amount: 10000, status: "PUBLISHED", createdAt: "2025-10-01", updatedBy: "admin", tier: "PRO", durationDays: 30, features: ["클립 시청", "기본 하이라이트", "풀경기 시청", "다운로드"], isActive: true },
  { id: 4, category: "INDIVIDUAL", name: "365일 시즌권", amount: 50000, status: "PUBLISHED", createdAt: "2025-10-01", updatedBy: "admin", tier: "PREMIUM", durationDays: 365, features: ["클립 시청", "기본 하이라이트", "풀경기 시청", "다운로드", "프리미엄 콘텐츠", "광고제거"], isActive: true },
  { id: 5, category: "TEAM", name: "팀 30일 시즌권", amount: 30000, status: "PUBLISHED", createdAt: "2025-11-01", updatedBy: "manager01", tier: "PRO", durationDays: 30, features: ["클립 시청", "기본 하이라이트", "풀경기 시청", "다운로드"], isActive: true },
  { id: 6, category: "TEAM", name: "팀 365일 시즌권", amount: 150000, status: "UNPUBLISHED", createdAt: "2025-11-01", updatedBy: "manager01", tier: "PREMIUM", durationDays: 365, features: ["클립 시청", "기본 하이라이트", "풀경기 시청", "다운로드", "프리미엄 콘텐츠", "광고제거"], isActive: false },
  { id: 7, category: "COMPETITION", name: "대회 시즌권", amount: 5000, status: "PUBLISHED", createdAt: "2025-12-01", updatedBy: "admin", tier: "BASIC", durationDays: 7, features: ["클립 시청", "기본 하이라이트"], isActive: true },
  { id: 8, category: "LEAGUE", name: "리그 시즌권", amount: 8000, status: "PUBLISHED", createdAt: "2026-01-01", updatedBy: "admin", tier: "PRO", durationDays: 90, features: ["클립 시청", "기본 하이라이트", "풀경기 시청", "다운로드"], isActive: true },
];

const MOCK_BALL_EXCHANGE_RATE: BallExchangeRate = {
  id: 1,
  ballPerWon: 10,
  updatedBy: "admin",
  updatedAt: "2026-01-01",
};

let MOCK_BALL_CHARGE_OPTIONS: BallChargeOption[] = [
  { id: 1, ballAmount: 1000, wonAmount: 10000, createdBy: "admin", createdAt: "2025-10-01" },
  { id: 2, ballAmount: 3000, wonAmount: 30000, createdBy: "admin", createdAt: "2025-10-01" },
  { id: 3, ballAmount: 5000, wonAmount: 50000, createdBy: "admin", createdAt: "2025-10-01" },
  { id: 4, ballAmount: 10000, wonAmount: 100000, createdBy: "manager01", createdAt: "2025-11-01" },
  { id: 5, ballAmount: 50000, wonAmount: 500000, createdBy: "admin", createdAt: "2026-01-15" },
];

let MOCK_REFUNDS: Refund[] = [
  { id: 1, status: "REQUESTED", category: "CHARGE_REFUND", kind: "BALL", requesterName: "김민수", requesterEmail: "minsu@gmail.com", requestedAt: "2026-02-20", processorName: null, processedAt: null, amount: 5000, wonAmount: 50000, reason: "단순 변심", rejectReason: null, originalTransactionId: "TXN-20260220-001", paymentMethod: "카드결제" },
  { id: 2, status: "COMPLETED", category: "CHARGE_REFUND", kind: "BALL", requesterName: "이수진", requesterEmail: "sujin@naver.com", requestedAt: "2026-02-18", processorName: "admin", processedAt: "2026-02-19", amount: 3000, wonAmount: 30000, reason: "서비스 불만족", rejectReason: null, originalTransactionId: "TXN-20260218-002", paymentMethod: "카드결제" },
  { id: 3, status: "REQUESTED", category: "CHARGE_REFUND", kind: "SEASON_PASS", requesterName: "박정호", requesterEmail: "jh.park@gmail.com", requestedAt: "2026-02-22", processorName: null, processedAt: null, amount: 10000, wonAmount: 100000, reason: "시즌권 미사용", rejectReason: null, originalTransactionId: "TXN-20260222-003", paymentMethod: "계좌이체" },
  { id: 4, status: "COMPLETED", category: "CHARGE_REFUND", kind: "SEASON_PASS", requesterName: "최예린", requesterEmail: "yerin@icloud.com", requestedAt: "2026-02-10", processorName: "manager01", processedAt: "2026-02-12", amount: 1500, wonAmount: 15000, reason: "단순 변심", rejectReason: null, originalTransactionId: "TXN-20260210-004", paymentMethod: "카드결제" },
  { id: 5, status: "REJECTED", category: "CHARGE_REFUND", kind: "BALL", requesterName: "정태우", requesterEmail: "taewoo@kakao.com", requestedAt: "2026-02-15", processorName: "admin", processedAt: "2026-02-16", amount: 10000, wonAmount: 100000, reason: "이미 사용된 뽈", rejectReason: "사용 내역이 확인되어 환불 불가", originalTransactionId: "TXN-20260215-005", paymentMethod: "계좌이체" },
  { id: 6, status: "REQUESTED", category: "CHARGE_REFUND", kind: "BALL", requesterName: "한지은", requesterEmail: "jieun@naver.com", requestedAt: "2026-03-01", processorName: null, processedAt: null, amount: 2000, wonAmount: 20000, reason: "오충전", rejectReason: null, originalTransactionId: "TXN-20260301-006", paymentMethod: "카드결제" },
];

let MOCK_PRICING: PricingItem[] = [
  { id: 1, tab: "CLIP", criteria: "일반 클립 (1분 이내)", ballAmount: 300, wonAmount: 3000, createdBy: "admin", createdAt: "2025-10-01", status: "PUBLISHED" },
  { id: 2, tab: "CLIP", criteria: "하이라이트 클립", ballAmount: 500, wonAmount: 5000, createdBy: "admin", createdAt: "2025-10-01", status: "PUBLISHED" },
  { id: 3, tab: "CLIP", criteria: "풀경기 클립", ballAmount: 1000, wonAmount: 10000, createdBy: "manager01", createdAt: "2025-11-01", status: "PUBLISHED" },
  { id: 4, tab: "CLIP", criteria: "프리미엄 클립", ballAmount: 2000, wonAmount: 20000, createdBy: "admin", createdAt: "2026-01-01", status: "UNPUBLISHED" },
  { id: 5, tab: "TEAM_CONTENT", criteria: "팀 경기 영상", ballAmount: 500, wonAmount: 5000, createdBy: "admin", createdAt: "2025-10-01", status: "PUBLISHED" },
  { id: 6, tab: "TEAM_CONTENT", criteria: "팀 하이라이트", ballAmount: 300, wonAmount: 3000, createdBy: "admin", createdAt: "2025-10-01", status: "PUBLISHED" },
  { id: 7, tab: "TEAM_CONTENT", criteria: "팀 시즌 패키지", ballAmount: 5000, wonAmount: 50000, createdBy: "manager01", createdAt: "2026-01-15", status: "PUBLISHED" },
];

const MOCK_BULK_GRANT_USERS: BulkBallGrantUser[] = [
  { id: 1, name: "김민수", email: "minsu@gmail.com", currentBall: 5200 },
  { id: 2, name: "이수진", email: "sujin@naver.com", currentBall: 1500 },
  { id: 3, name: "박정호", email: "jh.park@gmail.com", currentBall: 800 },
  { id: 4, name: "최예린", email: "yerin@icloud.com", currentBall: 3400 },
  { id: 5, name: "정태우", email: "taewoo@kakao.com", currentBall: 12000 },
  { id: 6, name: "한지은", email: "jieun@naver.com", currentBall: 250 },
  { id: 7, name: "오성민", email: "sungmin@gmail.com", currentBall: 7800 },
  { id: 8, name: "윤서현", email: "seohyun@gmail.com", currentBall: 4200 },
];

let nextSeasonPassId = 9;
let nextChargeOptionId = 6;
let nextRefundId = 7;

// ── Helpers ────────────────────────────────────────────────────────

function delay(ms = 300): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ── Point History APIs ────────────────────────────────────────────

export async function getPointHistory(
  filters: PointHistoryFilter,
  page = 0,
  size = 20
): Promise<PageResponse<PointHistory>> {
  // Try real API first
  const params: Record<string, string> = { page: String(page), size: String(size) };
  if (filters.type !== "ALL") params.type = filters.type;
  if (filters.searchKeyword) {
    params.searchKeyword = filters.searchKeyword;
    params.searchType = filters.searchType || "name";
  }

  const apiResult = await gatewayApi.get<PageResponse<PointHistory>>("/api/v1/admin/commerce/points/history", params);
  if (apiResult) return apiResult;

  // Mock fallback
  console.warn("[commerce-admin-api] Backend unavailable, using mock data");
  await delay();

  let filtered = [...MOCK_POINT_HISTORY];

  if (filters.type !== "ALL") {
    filtered = filtered.filter((p) => p.type === filters.type);
  }
  if (filters.searchKeyword) {
    const kw = filters.searchKeyword.toLowerCase();
    const field = filters.searchType || "name";
    filtered = filtered.filter((p) => {
      if (field === "name") return p.userName.toLowerCase().includes(kw);
      if (field === "email") return p.userEmail.toLowerCase().includes(kw);
      return true;
    });
  }

  const start = page * size;
  const content = filtered.slice(start, start + size);

  return {
    content,
    totalElements: filtered.length,
    totalPages: Math.ceil(filtered.length / size),
    page,
    size,
  };
}

// ── Season Pass APIs ──────────────────────────────────────────────

export async function getSeasonPasses(
  filters: SeasonPassFilter,
  page = 0,
  size = 20
): Promise<PageResponse<SeasonPass>> {
  // Try real API first
  const params: Record<string, string> = { page: String(page), size: String(size) };
  if (filters.category !== "ALL") params.category = filters.category;
  if (filters.status !== "ALL") params.status = filters.status;
  if (filters.searchKeyword) params.searchKeyword = filters.searchKeyword;

  const apiResult = await gatewayApi.get<PageResponse<SeasonPass>>("/api/v1/admin/commerce/season-passes", params);
  if (apiResult) return apiResult;

  // Mock fallback
  console.warn("[commerce-admin-api] Backend unavailable, using mock data");
  await delay();

  let filtered = [...MOCK_SEASON_PASSES];

  if (filters.category !== "ALL") {
    filtered = filtered.filter((s) => s.category === filters.category);
  }
  if (filters.status !== "ALL") {
    filtered = filtered.filter((s) => s.status === filters.status);
  }
  if (filters.searchKeyword) {
    const kw = filters.searchKeyword.toLowerCase();
    filtered = filtered.filter((s) => s.name.toLowerCase().includes(kw));
  }

  const start = page * size;
  const content = filtered.slice(start, start + size);

  return {
    content,
    totalElements: filtered.length,
    totalPages: Math.ceil(filtered.length / size),
    page,
    size,
  };
}

export async function createSeasonPass(data: SeasonPassCreateRequest): Promise<SeasonPass> {
  const apiResult = await gatewayApi.post<SeasonPass>("/api/v1/admin/commerce/season-passes", data);
  if (apiResult) return apiResult;
  console.warn("[commerce-admin-api] Backend unavailable, using mock data");
  await delay();
  const seasonPass: SeasonPass = {
    id: nextSeasonPassId++,
    ...data,
    createdAt: new Date().toISOString().slice(0, 10),
    updatedBy: "admin",
    isActive: true,
  };
  MOCK_SEASON_PASSES.push(seasonPass);
  return seasonPass;
}

export async function updateSeasonPass(id: number, data: SeasonPassCreateRequest): Promise<SeasonPass> {
  const apiResult = await gatewayApi.put<SeasonPass>(`/api/v1/admin/commerce/season-passes/${id}`, data);
  if (apiResult) return apiResult;
  console.warn("[commerce-admin-api] Backend unavailable, using mock data");
  await delay();
  const idx = MOCK_SEASON_PASSES.findIndex((s) => s.id === id);
  if (idx === -1) throw new Error("Season pass not found");
  MOCK_SEASON_PASSES[idx] = { ...MOCK_SEASON_PASSES[idx], ...data, updatedBy: "admin" };
  return MOCK_SEASON_PASSES[idx];
}

// ── Ball Settings APIs ────────────────────────────────────────────

export async function getBallExchangeRate(): Promise<BallExchangeRate> {
  const apiResult = await gatewayApi.get<BallExchangeRate>("/api/v1/admin/commerce/ball/exchange-rate");
  if (apiResult) return apiResult;
  console.warn("[commerce-admin-api] Backend unavailable, using mock data");
  await delay();
  return { ...MOCK_BALL_EXCHANGE_RATE };
}

export async function updateBallExchangeRate(ballPerWon: number): Promise<BallExchangeRate> {
  const apiResult = await gatewayApi.put<BallExchangeRate>("/api/v1/admin/commerce/ball/exchange-rate", { ballPerWon });
  if (apiResult) return apiResult;
  console.warn("[commerce-admin-api] Backend unavailable, using mock data");
  await delay();
  MOCK_BALL_EXCHANGE_RATE.ballPerWon = ballPerWon;
  MOCK_BALL_EXCHANGE_RATE.updatedAt = new Date().toISOString().slice(0, 10);
  MOCK_BALL_EXCHANGE_RATE.updatedBy = "admin";
  return { ...MOCK_BALL_EXCHANGE_RATE };
}

export async function getBallChargeOptions(): Promise<BallChargeOption[]> {
  const apiResult = await gatewayApi.get<BallChargeOption[]>("/api/v1/admin/commerce/ball/charge-options");
  if (apiResult) return apiResult;
  console.warn("[commerce-admin-api] Backend unavailable, using mock data");
  await delay();
  return [...MOCK_BALL_CHARGE_OPTIONS];
}

export async function createBallChargeOption(data: BallChargeOptionCreateRequest): Promise<BallChargeOption> {
  const apiResult = await gatewayApi.post<BallChargeOption>("/api/v1/admin/commerce/ball/charge-options", data);
  if (apiResult) return apiResult;
  console.warn("[commerce-admin-api] Backend unavailable, using mock data");
  await delay();
  const option: BallChargeOption = {
    id: nextChargeOptionId++,
    ...data,
    createdBy: "admin",
    createdAt: new Date().toISOString().slice(0, 10),
  };
  MOCK_BALL_CHARGE_OPTIONS.push(option);
  return option;
}

export async function updateBallChargeOption(id: number, data: BallChargeOptionCreateRequest): Promise<BallChargeOption> {
  const apiResult = await gatewayApi.put<BallChargeOption>(`/api/v1/admin/commerce/ball/charge-options/${id}`, data);
  if (apiResult) return apiResult;
  console.warn("[commerce-admin-api] Backend unavailable, using mock data");
  await delay();
  const idx = MOCK_BALL_CHARGE_OPTIONS.findIndex((o) => o.id === id);
  if (idx === -1) throw new Error("Charge option not found");
  MOCK_BALL_CHARGE_OPTIONS[idx] = { ...MOCK_BALL_CHARGE_OPTIONS[idx], ...data };
  return MOCK_BALL_CHARGE_OPTIONS[idx];
}

export async function deleteBallChargeOption(id: number): Promise<void> {
  const apiResult = await gatewayApi.delete(`/api/v1/admin/commerce/ball/charge-options/${id}`);
  if (apiResult !== null) return;
  console.warn("[commerce-admin-api] Backend unavailable, using mock data");
  await delay();
  MOCK_BALL_CHARGE_OPTIONS = MOCK_BALL_CHARGE_OPTIONS.filter((o) => o.id !== id);
}

// ── Refund APIs ───────────────────────────────────────────────────

export async function getRefunds(
  filters: RefundFilter,
  page = 0,
  size = 20
): Promise<PageResponse<Refund>> {
  // Try real API first
  const params: Record<string, string> = { page: String(page), size: String(size) };
  if (filters.category !== "ALL") params.category = filters.category;
  if (filters.kind !== "ALL") params.kind = filters.kind;
  if (filters.status !== "ALL") params.status = filters.status;
  if (filters.searchKeyword) params.searchKeyword = filters.searchKeyword;

  const apiResult = await gatewayApi.get<PageResponse<Refund>>("/api/v1/admin/commerce/refunds", params);
  if (apiResult) return apiResult;

  // Mock fallback
  console.warn("[commerce-admin-api] Backend unavailable, using mock data");
  await delay();

  let filtered = [...MOCK_REFUNDS];

  if (filters.category !== "ALL") {
    filtered = filtered.filter((r) => r.category === filters.category);
  }
  if (filters.kind !== "ALL") {
    filtered = filtered.filter((r) => r.kind === filters.kind);
  }
  if (filters.status !== "ALL") {
    filtered = filtered.filter((r) => r.status === filters.status);
  }
  if (filters.searchKeyword) {
    const kw = filters.searchKeyword.toLowerCase();
    filtered = filtered.filter((r) => r.requesterName.toLowerCase().includes(kw));
  }

  const start = page * size;
  const content = filtered.slice(start, start + size);

  return {
    content,
    totalElements: filtered.length,
    totalPages: Math.ceil(filtered.length / size),
    page,
    size,
  };
}

export async function approveRefund(id: number): Promise<Refund> {
  const apiResult = await gatewayApi.put<Refund>(`/api/v1/admin/commerce/refunds/${id}/approve`);
  if (apiResult) return apiResult;
  console.warn("[commerce-admin-api] Backend unavailable, using mock data");
  await delay();
  const refund = MOCK_REFUNDS.find((r) => r.id === id);
  if (!refund) throw new Error("Refund not found");
  refund.status = "COMPLETED";
  refund.processorName = "admin";
  refund.processedAt = new Date().toISOString().slice(0, 10);
  return { ...refund };
}

export async function rejectRefund(id: number, reason?: string): Promise<Refund> {
  const apiResult = await gatewayApi.put<Refund>(`/api/v1/admin/commerce/refunds/${id}/reject`, { reason });
  if (apiResult) return apiResult;
  console.warn("[commerce-admin-api] Backend unavailable, using mock data");
  await delay();
  const refund = MOCK_REFUNDS.find((r) => r.id === id);
  if (!refund) throw new Error("Refund not found");
  refund.status = "REJECTED";
  refund.processorName = "admin";
  refund.processedAt = new Date().toISOString().slice(0, 10);
  refund.rejectReason = reason ?? null;
  return { ...refund };
}

export async function getRefundById(id: number): Promise<Refund | null> {
  const apiResult = await gatewayApi.get<Refund>(`/api/v1/admin/commerce/refunds/${id}`);
  if (apiResult) return apiResult;
  console.warn("[commerce-admin-api] Backend unavailable, using mock data");
  await delay();
  return MOCK_REFUNDS.find((r) => r.id === id) ?? null;
}

// ── Bulk Ball Grant APIs ────────────────────────────────────────────

export async function getBulkBallGrantUsers(searchKeyword?: string): Promise<BulkBallGrantUser[]> {
  const params: Record<string, string> = {};
  if (searchKeyword) params.search = searchKeyword;
  const apiResult = await gatewayApi.get<BulkBallGrantUser[]>("/api/v1/admin/commerce/ball/grant/users", params);
  if (apiResult) return apiResult;
  console.warn("[commerce-admin-api] Backend unavailable, using mock data");
  await delay();
  if (!searchKeyword) return [...MOCK_BULK_GRANT_USERS];
  const kw = searchKeyword.toLowerCase();
  return MOCK_BULK_GRANT_USERS.filter(
    (u) => u.name.toLowerCase().includes(kw) || u.email.toLowerCase().includes(kw)
  );
}

export async function bulkGrantBalls(request: BulkBallGrantRequest): Promise<void> {
  const apiResult = await gatewayApi.post("/api/v1/admin/commerce/ball/grant", request);
  if (apiResult !== null) return;
  console.warn("[commerce-admin-api] Backend unavailable, using mock data");
  await delay();
}

// ── Season Pass Activation API ──────────────────────────────────────

export async function toggleSeasonPassActive(id: number): Promise<SeasonPass> {
  const apiResult = await gatewayApi.put<SeasonPass>(`/api/v1/admin/commerce/season-passes/${id}/toggle-active`);
  if (apiResult) return apiResult;
  console.warn("[commerce-admin-api] Backend unavailable, using mock data");
  await delay();
  const pass = MOCK_SEASON_PASSES.find((s) => s.id === id);
  if (!pass) throw new Error("Season pass not found");
  pass.isActive = !pass.isActive;
  return { ...pass };
}

// ── Point History Export API ────────────────────────────────────────

export async function exportPointHistoryCsv(filters: PointHistoryFilter): Promise<string> {
  await delay(500);
  // Return all filtered data as CSV
  let filtered = [...MOCK_POINT_HISTORY];
  if (filters.type !== "ALL") {
    filtered = filtered.filter((p) => p.type === filters.type);
  }
  const header = "NO,구분,결제수단,내역,금액(뽈),사용자,이메일,진행일자\n";
  const rows = filtered.map((p, i) =>
    `${i + 1},${POINT_TYPE_LABELS[p.type]},${p.paymentMethod},${p.description},${p.amount},${p.userName},${p.userEmail},${p.processedAt}`
  ).join("\n");
  return header + rows;
}

// ── Pricing APIs ──────────────────────────────────────────────────

export async function getPricing(tab: PricingTab): Promise<PricingItem[]> {
  const apiResult = await gatewayApi.get<PricingItem[]>("/api/v1/admin/commerce/pricing", { tab });
  if (apiResult) return apiResult;
  console.warn("[commerce-admin-api] Backend unavailable, using mock data");
  await delay();
  return MOCK_PRICING.filter((p) => p.tab === tab);
}

export async function updatePricing(id: number, data: PricingUpdateRequest): Promise<PricingItem> {
  const apiResult = await gatewayApi.put<PricingItem>(`/api/v1/admin/commerce/pricing/${id}`, data);
  if (apiResult) return apiResult;
  console.warn("[commerce-admin-api] Backend unavailable, using mock data");
  await delay();
  const idx = MOCK_PRICING.findIndex((p) => p.id === id);
  if (idx === -1) throw new Error("Pricing item not found");
  MOCK_PRICING[idx] = { ...MOCK_PRICING[idx], ...data };
  return MOCK_PRICING[idx];
}
