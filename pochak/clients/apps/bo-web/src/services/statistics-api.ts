/**
 * Statistics API service
 * Calls real admin API via gateway.
 */

import { gatewayApi } from "@/lib/api-client";

// ── Types ──────────────────────────────────────────────────────────

export interface KpiCard {
  label: string;
  value: number;
  unit?: string;
  change?: number; // percentage change from previous period
}

export interface ChartDataPoint {
  label: string;
  value: number;
}

export interface MonthlyTrendRow {
  month: string;
  newSignups: number;
  activeUsers: number;
  churnUsers: number;
  retention: number; // percentage
}

export interface UserStatistics {
  kpi: {
    totalUsers: KpiCard;
    newSignups: KpiCard;
    activeUsers: KpiCard;
    churnRate: KpiCard;
  };
  signupTrend: ChartDataPoint[];
  genderDistribution: ChartDataPoint[];
  ageDistribution: ChartDataPoint[];
  typeDistribution: ChartDataPoint[];
  monthlyTrend: MonthlyTrendRow[];
}

export interface ViewContentItem {
  id: number;
  title: string;
  sport: string;
  views: number;
  watchTime: string;
  type: "LIVE" | "VOD";
  date: string;
  thumbnail?: string;
}

export interface DailyViewPoint {
  date: string;
  views: number;
}

export interface ContentBreakdownItem {
  sport: string;
  liveViews: number;
  vodViews: number;
  totalViews: number;
  avgWatchMin: number;
}

export interface ViewStatistics {
  kpi: {
    totalViews: KpiCard;
    avgDuration: KpiCard;
    peakConcurrent: KpiCard;
    topContent: KpiCard;
  };
  dailyViews: DailyViewPoint[];
  contentBreakdown: ContentBreakdownItem[];
  liveContent: ViewContentItem[];
  vodContent: ViewContentItem[];
}

export interface SalesPaymentItem {
  method: string;
  amount: number;
  count: number;
}

export interface SalesPurchaseItem {
  type: string;
  count: number;
  amount: number;
}

export interface SalesProductItem {
  name: string;
  category: string;
  sold: number;
  revenue: number;
}

export interface ProductBreakdownItem {
  name: string;
  category: string;
  sold: number;
  revenue: number;
  refunds: number;
}

export interface SalesStatistics {
  kpi: {
    totalRevenue: KpiCard;
    avgTransaction: KpiCard;
    refundRate: KpiCard;
    mrr: KpiCard;
  };
  monthlyRevenue: ChartDataPoint[];
  payments: SalesPaymentItem[];
  purchases: SalesPurchaseItem[];
  products: SalesProductItem[];
  productBreakdown: ProductBreakdownItem[];
}

// ── User Statistics ────────────────────────────────────────────────

export async function getUserStatistics(
  dateFrom?: string,
  dateTo?: string
): Promise<UserStatistics> {
  const params: Record<string, string> = {};
  if (dateFrom) params.dateFrom = dateFrom;
  if (dateTo) params.dateTo = dateTo;

  return gatewayApi.get<UserStatistics>("/api/v1/admin/statistics/users", params);
}

// ── View Statistics ────────────────────────────────────────────────

export async function getViewStatistics(
  dateFrom?: string,
  dateTo?: string
): Promise<ViewStatistics> {
  const params: Record<string, string> = {};
  if (dateFrom) params.dateFrom = dateFrom;
  if (dateTo) params.dateTo = dateTo;

  return gatewayApi.get<ViewStatistics>("/api/v1/admin/statistics/views", params);
}

// ── Sales Statistics ───────────────────────────────────────────────

export async function getSalesStatistics(
  year?: number,
  month?: number
): Promise<SalesStatistics> {
  const params: Record<string, string> = {};
  if (year) params.year = String(year);
  if (month) params.month = String(month);

  return gatewayApi.get<SalesStatistics>("/api/v1/admin/statistics/sales", params);
}

// ── CSV Export Helper ──────────────────────────────────────────────

export async function exportToCsv(
  filename: string,
  headers: string[],
  rows: string[][]
): Promise<void> {
  const BOM = "\uFEFF";
  const csvContent =
    BOM +
    [headers.join(","), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(","))].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
