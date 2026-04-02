/**
 * Coupon/Promotion API service for mobile.
 * Calls real API via apiClient, falls back to mock data if unavailable.
 */

import apiClient from '../api/client';

// ── Types ──────────────────────────────────────────────────────────

export type CouponStatus = 'AVAILABLE' | 'USED' | 'EXPIRED';

export interface Coupon {
  id: string;
  title: string;
  code: string;
  discountLabel: string; // e.g. "20%" or "500뽈"
  description: string;
  minPurchaseAmount: number;
  expiryDate: string;
  status: CouponStatus;
  usedAt?: string;
}

// ── Mock Data ──────────────────────────────────────────────────────

const MOCK_COUPONS: Coupon[] = [
  {
    id: '1',
    title: '신규 가입 축하 쿠폰',
    code: 'WELCOME20',
    discountLabel: '20%',
    description: '첫 구매 시 20% 할인',
    minPurchaseAmount: 3000,
    expiryDate: '2026-06-30',
    status: 'AVAILABLE',
  },
  {
    id: '2',
    title: '봄 시즌 할인 쿠폰',
    code: 'SPRING1000',
    discountLabel: '1,000원',
    description: '시즌권 구매 시 1,000원 할인',
    minPurchaseAmount: 5000,
    expiryDate: '2026-05-31',
    status: 'AVAILABLE',
  },
  {
    id: '3',
    title: '친구 초대 뽈 쿠폰',
    code: 'INVITE500',
    discountLabel: '500뽈',
    description: '친구 초대 시 500뽈 지급',
    minPurchaseAmount: 0,
    expiryDate: '2026-12-31',
    status: 'AVAILABLE',
  },
  {
    id: '4',
    title: '첫 구매 감사 쿠폰',
    code: 'FIRST300',
    discountLabel: '300뽈',
    description: '첫 결제 감사 뽈 지급',
    minPurchaseAmount: 0,
    expiryDate: '2026-09-30',
    status: 'AVAILABLE',
  },
  {
    id: '5',
    title: '설날 이벤트 쿠폰',
    code: 'NEWYEAR30',
    discountLabel: '30%',
    description: '설날 이벤트 30% 할인',
    minPurchaseAmount: 5000,
    expiryDate: '2026-02-05',
    status: 'USED',
    usedAt: '2026-01-28',
  },
  {
    id: '6',
    title: '팀 콘텐츠 할인 쿠폰',
    code: 'TEAM2000',
    discountLabel: '2,000원',
    description: '팀 콘텐츠 구매 시 2,000원 할인',
    minPurchaseAmount: 5000,
    expiryDate: '2026-01-31',
    status: 'USED',
    usedAt: '2026-01-15',
  },
  {
    id: '7',
    title: '크리스마스 뽈 쿠폰',
    code: 'XMAS200',
    discountLabel: '200뽈',
    description: '크리스마스 200뽈 증정',
    minPurchaseAmount: 0,
    expiryDate: '2025-12-26',
    status: 'EXPIRED',
  },
  {
    id: '8',
    title: '연말 감사 할인',
    code: 'YEAREND15',
    discountLabel: '15%',
    description: '연말 감사 15% 할인',
    minPurchaseAmount: 3000,
    expiryDate: '2025-12-31',
    status: 'EXPIRED',
  },
];

// ── APIs ───────────────────────────────────────────────────────────

/**
 * Get user's coupons. Tries real API, falls back to mock data.
 */
export async function getMyCoupons(status?: string): Promise<Coupon[]> {
  try {
    const res = await apiClient.get('/coupons/my', {params: {status}});
    return res.data.data || res.data;
  } catch {
    return MOCK_COUPONS.filter(c => !status || c.status === status);
  }
}

/**
 * Register a coupon by code. Tries real API with structured error handling.
 */
export async function registerCouponCode(
  code: string,
): Promise<{success: boolean; coupon?: Coupon; error?: string}> {
  try {
    const res = await apiClient.post('/coupons/register', {code});
    const coupon = res.data.data || res.data;
    return {success: true, coupon};
  } catch (e: any) {
    // Real API returned a known error
    if (e.response?.status === 404) {
      return {success: false, error: '유효하지 않은 쿠폰 코드입니다.'};
    }
    if (e.response?.status === 409 || e.response?.status === 400) {
      return {
        success: false,
        error: e.response?.data?.message || '이미 등록된 쿠폰입니다.',
      };
    }

    // API unreachable — fall back to mock behaviour
    const upperCode = code.toUpperCase().trim();
    const existing = MOCK_COUPONS.find(c => c.code === upperCode);
    if (existing) {
      return {success: false, error: '이미 등록된 쿠폰입니다.'};
    }

    if (upperCode.length >= 4) {
      const newCoupon: Coupon = {
        id: String(Date.now()),
        title: '프로모션 쿠폰',
        code: upperCode,
        discountLabel: '10%',
        description: '프로모션 코드 입력 할인',
        minPurchaseAmount: 0,
        expiryDate: '2026-12-31',
        status: 'AVAILABLE',
      };
      MOCK_COUPONS.push(newCoupon);
      return {success: true, coupon: newCoupon};
    }

    return {success: false, error: '쿠폰 등록에 실패했습니다.'};
  }
}

/**
 * Use a coupon. Tries real API, falls back to mock.
 */
export async function useCoupon(
  couponId: string,
): Promise<{success: boolean; error?: string}> {
  try {
    await apiClient.post(`/coupons/${couponId}/use`);
    return {success: true};
  } catch (e: any) {
    if (e.response?.data?.message) {
      return {success: false, error: e.response.data.message};
    }
    // Mock fallback: mark the coupon as used
    const coupon = MOCK_COUPONS.find(c => c.id === couponId);
    if (coupon && coupon.status === 'AVAILABLE') {
      coupon.status = 'USED';
      coupon.usedAt = new Date().toISOString().split('T')[0];
      return {success: true};
    }
    return {success: false, error: '쿠폰 사용에 실패했습니다.'};
  }
}

/**
 * List all publicly available coupons.
 */
export async function getAvailableCoupons(): Promise<Coupon[]> {
  try {
    const res = await apiClient.get('/coupons/available');
    return res.data.data || res.data;
  } catch {
    return MOCK_COUPONS.filter(c => c.status === 'AVAILABLE');
  }
}
