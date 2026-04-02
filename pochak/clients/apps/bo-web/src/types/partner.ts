export type PartnerStatus = "PENDING" | "ACTIVE" | "SUSPENDED" | "REJECTED";

export interface Partner {
  id: number;
  companyName: string;
  representativeName: string;
  businessNumber: string;
  email: string;
  phone: string;
  address: string;
  status: PartnerStatus;
  commissionRate: number;
  venueCount: number;
  totalRevenue: number;
  monthlyRevenue: number;
  joinedAt: string;
  approvedAt: string | null;
  suspendedAt: string | null;
  suspendReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PartnerVenue {
  id: number;
  venueName: string;
  district: string;
  address: string;
  sportName: string;
  isActive: boolean;
  monthlyRevenue: number;
  totalBookings: number;
}

export interface PartnerSettlement {
  id: number;
  partnerId: number;
  period: string;
  totalRevenue: number;
  commissionRate: number;
  commissionAmount: number;
  netAmount: number;
  status: "PENDING" | "CONFIRMED" | "PAID";
  paidAt: string | null;
  createdAt: string;
}

export interface PartnerFilter {
  status?: PartnerStatus | null;
  keyword?: string;
  page?: number;
  size?: number;
}
