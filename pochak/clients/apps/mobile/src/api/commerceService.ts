import apiClient from './client';
import {
  Product,
  PurchaseRecord,
  PaymentMethod,
  ProductDetailCard,
  mockProducts,
  mockPurchases,
  mockProductDetailCards,
  paymentMethods,
} from '../services/commerceApi';

// ─── Response types ───────────────────────────────────────────────

export interface EntitlementInfo {
  contentId: string;
  hasAccess: boolean;
  reason?: 'SUBSCRIPTION' | 'PASS' | 'COMPETITION_TICKET' | 'FREE';
  expiresAt?: string;
}

export interface PurchaseRequest {
  productId: string;
  paymentMethod: PaymentMethod;
}

export interface PurchaseResponse {
  success: boolean;
  purchaseId: string;
  productName: string;
  amount: number;
}

// ─── Extensible interface ─────────────────────────────────────────
// Future migration: swap CommerceService to call pochak-commerce service.
// Payment gateway integration, coupon system, etc. extend this interface.

export interface SubscriptionInfo {
  planName: string | null;
  expiresAt: string | null;
  isActive: boolean;
}

export interface ICommerceService {
  /** Get all available products */
  getProducts(): Promise<Product[]>;
  /** Get product detail cards with tab categories */
  getProductDetails(): Promise<ProductDetailCard[]>;
  /** Purchase a product */
  purchase(request: PurchaseRequest): Promise<PurchaseResponse>;
  /** Check if user has entitlement (viewing rights) for specific content */
  getEntitlement(contentId: string): Promise<EntitlementInfo>;
  /** Get user's current subscription */
  getSubscription(): Promise<SubscriptionInfo>;
  /** Get user's purchase history */
  getPurchaseHistory(): Promise<PurchaseRecord[]>;
  /** Get available payment methods */
  getPaymentMethods(): Promise<{ method: PaymentMethod; icon: string; balance?: string }[]>;
}

// ─── Concrete implementation ──────────────────────────────────────

class CommerceService implements ICommerceService {
  async getProducts(): Promise<Product[]> {
    try {
      const res = await apiClient.get('/commerce/products');
      return res.data.data || res.data;
    } catch {
      console.warn('[Commerce] Products API unavailable, using mock');
      return mockProducts;
    }
  }

  async getProductDetails(): Promise<ProductDetailCard[]> {
    try {
      const res = await apiClient.get('/commerce/products/details');
      return res.data.data || res.data;
    } catch {
      console.warn('[Commerce] Product details API unavailable, using mock');
      return mockProductDetailCards;
    }
  }

  async purchase(request: PurchaseRequest): Promise<PurchaseResponse> {
    try {
      const res = await apiClient.post('/commerce/purchase', {
        productId: request.productId,
        paymentMethod: request.paymentMethod,
      });
      return res.data.data || res.data;
    } catch {
      console.warn('[Commerce] Purchase API unavailable, using mock');
      const product = mockProducts.find(p => p.id === request.productId);
      return {
        success: true,
        purchaseId: `mock-${Date.now()}`,
        productName: product?.name ?? '알 수 없는 상품',
        amount: product?.price ?? 0,
      };
    }
  }

  async getEntitlement(contentId: string): Promise<EntitlementInfo> {
    try {
      const res = await apiClient.get(`/commerce/entitlement/${contentId}`);
      return res.data.data || res.data;
    } catch {
      console.warn('[Commerce] Entitlement API unavailable, using mock');
      return {
        contentId,
        hasAccess: true,
        reason: 'FREE',
      };
    }
  }

  /** Get user's current subscription info */
  async getSubscription(): Promise<SubscriptionInfo> {
    try {
      const res = await apiClient.get('/commerce/subscription');
      return res.data.data || res.data;
    } catch {
      console.warn('[Commerce] Subscription API unavailable, using mock');
      return { planName: null, expiresAt: null, isActive: false };
    }
  }

  async getPurchaseHistory(): Promise<PurchaseRecord[]> {
    try {
      const res = await apiClient.get('/commerce/purchases');
      return res.data.data || res.data;
    } catch {
      console.warn('[Commerce] Purchase history API unavailable, using mock');
      return mockPurchases;
    }
  }

  async getPaymentMethods(): Promise<{ method: PaymentMethod; icon: string; balance?: string }[]> {
    try {
      const res = await apiClient.get('/commerce/payment-methods');
      return res.data.data || res.data;
    } catch {
      console.warn('[Commerce] Payment methods API unavailable, using mock');
      return paymentMethods;
    }
  }
}

export const commerceService: ICommerceService = new CommerceService();
