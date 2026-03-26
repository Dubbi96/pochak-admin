// TODO: [Mock→Real API] Wire to real backend endpoints when promotion backend is ready. Keep mock for now.
/**
 * Promotion Management API service
 * Currently returns mock data. Will be replaced with real API calls.
 */

import type { PageResponse } from "@/types/common";

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

// ── Mock Data ──────────────────────────────────────────────────────

let MOCK_PROMOTIONS: Promotion[] = [
  {
    id: 1,
    name: "신규 가입 20% 할인",
    code: "WELCOME20",
    type: "COUPON",
    discountType: "PERCENTAGE",
    discountValue: 20,
    startDate: "2026-01-01",
    endDate: "2026-06-30",
    status: "ACTIVE",
    usageCount: 342,
    maxUsageTotal: 5000,
    maxUsagePerUser: 1,
    minPurchaseAmount: 3000,
    maxDiscountAmount: 5000,
    targetType: "ALL",
    targetIds: [],
    createdBy: "admin",
    createdAt: "2025-12-20",
  },
  {
    id: 2,
    name: "봄 시즌 1000원 할인",
    code: "SPRING1000",
    type: "COUPON",
    discountType: "FIXED",
    discountValue: 1000,
    startDate: "2026-03-01",
    endDate: "2026-05-31",
    status: "ACTIVE",
    usageCount: 128,
    maxUsageTotal: 2000,
    maxUsagePerUser: 3,
    minPurchaseAmount: 5000,
    maxDiscountAmount: null,
    targetType: "SPECIFIC_CATEGORY",
    targetIds: ["시즌권"],
    createdBy: "admin",
    createdAt: "2026-02-15",
  },
  {
    id: 3,
    name: "친구 초대 500뽈 지급",
    code: "INVITE500",
    type: "GIFT_BALL",
    discountType: "BALL_GRANT",
    discountValue: 500,
    startDate: "2026-01-01",
    endDate: "2026-12-31",
    status: "ACTIVE",
    usageCount: 89,
    maxUsageTotal: 10000,
    maxUsagePerUser: 5,
    minPurchaseAmount: 0,
    maxDiscountAmount: null,
    targetType: "ALL",
    targetIds: [],
    createdBy: "manager01",
    createdAt: "2025-12-28",
  },
  {
    id: 4,
    name: "설날 이벤트 30% 할인",
    code: "NEWYEAR30",
    type: "EVENT",
    discountType: "PERCENTAGE",
    discountValue: 30,
    startDate: "2026-01-25",
    endDate: "2026-02-05",
    status: "EXPIRED",
    usageCount: 1540,
    maxUsageTotal: 3000,
    maxUsagePerUser: 2,
    minPurchaseAmount: 5000,
    maxDiscountAmount: 10000,
    targetType: "ALL",
    targetIds: [],
    createdBy: "admin",
    createdAt: "2026-01-10",
  },
  {
    id: 5,
    name: "여름 대회 시즌권 할인",
    code: "SUMMER2026",
    type: "COUPON",
    discountType: "FIXED",
    discountValue: 3000,
    startDate: "2026-06-01",
    endDate: "2026-08-31",
    status: "DRAFT",
    usageCount: 0,
    maxUsageTotal: 1000,
    maxUsagePerUser: 1,
    minPurchaseAmount: 10000,
    maxDiscountAmount: null,
    targetType: "SPECIFIC_PRODUCT",
    targetIds: ["대회 시즌권"],
    createdBy: "admin",
    createdAt: "2026-03-10",
  },
  {
    id: 6,
    name: "크리스마스 200뽈 증정",
    code: "XMAS200",
    type: "GIFT_BALL",
    discountType: "BALL_GRANT",
    discountValue: 200,
    startDate: "2025-12-20",
    endDate: "2025-12-26",
    status: "EXPIRED",
    usageCount: 2300,
    maxUsageTotal: 5000,
    maxUsagePerUser: 1,
    minPurchaseAmount: 0,
    maxDiscountAmount: null,
    targetType: "ALL",
    targetIds: [],
    createdBy: "manager01",
    createdAt: "2025-12-10",
  },
];

let nextPromotionId = 7;

// ── Helpers ────────────────────────────────────────────────────────

function delay(ms = 300): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function generatePromoCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// ── Promotion APIs ────────────────────────────────────────────────

export async function getPromotions(
  filters: PromotionFilter,
  page = 0,
  size = 20
): Promise<PageResponse<Promotion>> {
  await delay();

  let filtered = [...MOCK_PROMOTIONS];

  if (filters.status !== "ALL") {
    filtered = filtered.filter((p) => p.status === filters.status);
  }
  if (filters.type !== "ALL") {
    filtered = filtered.filter((p) => p.type === filters.type);
  }
  if (filters.dateFrom) {
    filtered = filtered.filter((p) => p.startDate >= filters.dateFrom!);
  }
  if (filters.dateTo) {
    filtered = filtered.filter((p) => p.endDate <= filters.dateTo!);
  }
  if (filters.searchKeyword) {
    const kw = filters.searchKeyword.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(kw) ||
        p.code.toLowerCase().includes(kw)
    );
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

export async function getPromotionById(id: number): Promise<Promotion | null> {
  await delay();
  return MOCK_PROMOTIONS.find((p) => p.id === id) ?? null;
}

export async function createPromotion(data: PromotionCreateRequest): Promise<Promotion> {
  await delay();
  const promotion: Promotion = {
    id: nextPromotionId++,
    ...data,
    status: "DRAFT",
    usageCount: 0,
    createdBy: "admin",
    createdAt: new Date().toISOString().slice(0, 10),
  };
  MOCK_PROMOTIONS.push(promotion);
  return promotion;
}

export async function updatePromotion(
  id: number,
  data: PromotionCreateRequest
): Promise<Promotion> {
  await delay();
  const idx = MOCK_PROMOTIONS.findIndex((p) => p.id === id);
  if (idx === -1) throw new Error("Promotion not found");
  MOCK_PROMOTIONS[idx] = {
    ...MOCK_PROMOTIONS[idx],
    ...data,
  };
  return MOCK_PROMOTIONS[idx];
}

export async function updatePromotionStatus(
  id: number,
  status: PromotionStatus
): Promise<Promotion> {
  await delay();
  const idx = MOCK_PROMOTIONS.findIndex((p) => p.id === id);
  if (idx === -1) throw new Error("Promotion not found");
  MOCK_PROMOTIONS[idx] = { ...MOCK_PROMOTIONS[idx], status };
  return MOCK_PROMOTIONS[idx];
}

export async function deletePromotion(id: number): Promise<void> {
  await delay();
  MOCK_PROMOTIONS = MOCK_PROMOTIONS.filter((p) => p.id !== id);
}
