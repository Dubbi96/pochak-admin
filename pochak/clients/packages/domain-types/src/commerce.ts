export type ProductType = "SUBSCRIPTION" | "PPV" | "COIN_PACK" | "MERCHANDISE";

export interface Product {
  id: string;
  name: string;
  description?: string;
  type: ProductType;
  priceKrw: number;
  originalPriceKrw?: number;
  thumbnailUrl?: string;
  isActive: boolean;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface Wallet {
  id: string;
  userId: string;
  coinBalance: number;
  updatedAt: string;
}

export type PurchaseStatus = "PENDING" | "COMPLETED" | "FAILED" | "CANCELLED" | "REFUNDED";

export type PaymentMethod = "CARD" | "BANK_TRANSFER" | "VIRTUAL_ACCOUNT" | "PHONE" | "COIN";

export interface Purchase {
  id: string;
  userId: string;
  productId: string;
  productName: string;
  status: PurchaseStatus;
  paymentMethod: PaymentMethod;
  amountKrw: number;
  transactionId?: string;
  paidAt?: string;
  createdAt: string;
}

export type EntitlementType = "SUBSCRIPTION" | "PPV" | "VOD_ACCESS" | "LIVE_ACCESS";

export interface Entitlement {
  id: string;
  userId: string;
  type: EntitlementType;
  resourceId: string;
  purchaseId: string;
  grantedAt: string;
  expiresAt?: string;
  isActive: boolean;
}

export type RefundStatus = "REQUESTED" | "APPROVED" | "REJECTED" | "COMPLETED";

export interface Refund {
  id: string;
  purchaseId: string;
  userId: string;
  status: RefundStatus;
  reason: string;
  amountKrw: number;
  requestedAt: string;
  processedAt?: string;
  processedBy?: string;
}
