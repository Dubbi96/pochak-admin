// TODO: [Mock→Real API] Wire to real backend endpoints once statistics service is deployed. Keep mock for now.
/**
 * Statistics API service
 * Currently returns mock data. Will be replaced with real API calls.
 */

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

// ── Helpers ────────────────────────────────────────────────────────

function delay(ms = 200): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ── User Statistics ────────────────────────────────────────────────

export async function getUserStatistics(
  _dateFrom?: string,
  _dateTo?: string
): Promise<UserStatistics> {
  await delay();

  return {
    kpi: {
      totalUsers: { label: "전체 회원 수", value: 45820, unit: "명", change: 8.2 },
      newSignups: { label: "이번 달 신규 가입", value: 1284, unit: "명", change: 12.5 },
      activeUsers: { label: "활성 사용자", value: 8432, unit: "명", change: 5.2 },
      churnRate: { label: "이탈률", value: 3.2, unit: "%", change: -1.1 },
    },
    signupTrend: [
      { label: "1월", value: 820 },
      { label: "2월", value: 932 },
      { label: "3월", value: 1101 },
      { label: "4월", value: 1284 },
      { label: "5월", value: 1150 },
      { label: "6월", value: 1420 },
      { label: "7월", value: 1350 },
      { label: "8월", value: 1580 },
      { label: "9월", value: 1200 },
      { label: "10월", value: 1380 },
      { label: "11월", value: 1500 },
      { label: "12월", value: 1650 },
    ],
    genderDistribution: [
      { label: "남성", value: 5840 },
      { label: "여성", value: 3920 },
      { label: "기타", value: 180 },
    ],
    ageDistribution: [
      { label: "10대", value: 1250 },
      { label: "20대", value: 4320 },
      { label: "30대", value: 2890 },
      { label: "40대+", value: 1480 },
    ],
    typeDistribution: [
      { label: "회원", value: 7200 },
      { label: "비회원", value: 2100 },
      { label: "게스트", value: 640 },
    ],
    monthlyTrend: [
      { month: "2026-01", newSignups: 820, activeUsers: 7200, churnUsers: 35, retention: 95.2 },
      { month: "2026-02", newSignups: 932, activeUsers: 7800, churnUsers: 28, retention: 96.1 },
      { month: "2026-03", newSignups: 1284, activeUsers: 8432, churnUsers: 42, retention: 95.8 },
      { month: "2025-12", newSignups: 1650, activeUsers: 6900, churnUsers: 50, retention: 94.5 },
      { month: "2025-11", newSignups: 1500, activeUsers: 6500, churnUsers: 45, retention: 94.8 },
      { month: "2025-10", newSignups: 1380, activeUsers: 6200, churnUsers: 38, retention: 95.0 },
    ],
  };
}

// ── View Statistics ────────────────────────────────────────────────

export async function getViewStatistics(
  _dateFrom?: string,
  _dateTo?: string
): Promise<ViewStatistics> {
  await delay();

  return {
    kpi: {
      totalViews: { label: "총 조회 수", value: 89400, unit: "회", change: 10.1 },
      avgDuration: { label: "평균 시청 시간", value: 42, unit: "분", change: 5.3 },
      peakConcurrent: { label: "최대 동시접속", value: 3240, unit: "명", change: 18.7 },
      topContent: { label: "인기 콘텐츠 조회", value: 21000, unit: "회", change: 25.4 },
    },
    dailyViews: [
      { date: "03-13", views: 4200 },
      { date: "03-14", views: 5100 },
      { date: "03-15", views: 6800 },
      { date: "03-16", views: 7200 },
      { date: "03-17", views: 8900 },
      { date: "03-18", views: 12400 },
      { date: "03-19", views: 9800 },
    ],
    contentBreakdown: [
      { sport: "축구", liveViews: 12400, vodViews: 28700, totalViews: 41100, avgWatchMin: 48 },
      { sport: "농구", liveViews: 8200, vodViews: 12500, totalViews: 20700, avgWatchMin: 35 },
      { sport: "야구", liveViews: 6800, vodViews: 10200, totalViews: 17000, avgWatchMin: 52 },
      { sport: "배구", liveViews: 4500, vodViews: 6200, totalViews: 10700, avgWatchMin: 30 },
    ],
    liveContent: [
      { id: 1, title: "서울 vs 부산 프로축구", sport: "축구", views: 5420, watchTime: "1:32:15", type: "LIVE", date: "2026-03-18" },
      { id: 2, title: "인천 vs 대전 프로농구", sport: "농구", views: 3210, watchTime: "2:05:42", type: "LIVE", date: "2026-03-18" },
      { id: 3, title: "수원 vs 울산 프로배구", sport: "배구", views: 2890, watchTime: "1:48:30", type: "LIVE", date: "2026-03-17" },
      { id: 4, title: "전주 vs 광주 프로야구", sport: "야구", views: 4150, watchTime: "2:35:10", type: "LIVE", date: "2026-03-17" },
      { id: 5, title: "창원 vs 성남 프로축구", sport: "축구", views: 1980, watchTime: "1:45:20", type: "LIVE", date: "2026-03-16" },
      { id: 6, title: "제주 vs 포항 프로축구", sport: "축구", views: 2340, watchTime: "1:30:05", type: "LIVE", date: "2026-03-16" },
    ],
    vodContent: [
      { id: 101, title: "서울 vs 부산 하이라이트", sport: "축구", views: 12300, watchTime: "0:08:32", type: "VOD", date: "2026-03-18" },
      { id: 102, title: "인천 vs 대전 하이라이트", sport: "농구", views: 8900, watchTime: "0:06:15", type: "VOD", date: "2026-03-18" },
      { id: 103, title: "주간 베스트 골 모음", sport: "축구", views: 15400, watchTime: "0:12:45", type: "VOD", date: "2026-03-17" },
      { id: 104, title: "수원 vs 울산 하이라이트", sport: "배구", views: 6200, watchTime: "0:05:30", type: "VOD", date: "2026-03-17" },
      { id: 105, title: "전주 vs 광주 하이라이트", sport: "야구", views: 9100, watchTime: "0:07:20", type: "VOD", date: "2026-03-16" },
      { id: 106, title: "이달의 베스트 플레이", sport: "종합", views: 21000, watchTime: "0:15:10", type: "VOD", date: "2026-03-15" },
    ],
  };
}

// ── Sales Statistics ───────────────────────────────────────────────

export async function getSalesStatistics(
  _year?: number,
  _month?: number
): Promise<SalesStatistics> {
  await delay();

  return {
    kpi: {
      totalRevenue: { label: "총 매출", value: 125400000, unit: "원", change: 18.5 },
      avgTransaction: { label: "평균 결제 금액", value: 18400, unit: "원", change: 3.2 },
      refundRate: { label: "환불율", value: 2.8, unit: "%", change: -0.5 },
      mrr: { label: "MRR", value: 42800000, unit: "원", change: 22.7 },
    },
    monthlyRevenue: [
      { label: "1월", value: 85000000 },
      { label: "2월", value: 92000000 },
      { label: "3월", value: 78000000 },
      { label: "4월", value: 105000000 },
      { label: "5월", value: 110000000 },
      { label: "6월", value: 98000000 },
      { label: "7월", value: 115000000 },
      { label: "8월", value: 125400000 },
      { label: "9월", value: 108000000 },
      { label: "10월", value: 120000000 },
      { label: "11월", value: 135000000 },
      { label: "12월", value: 142000000 },
    ],
    payments: [
      { method: "신용카드", amount: 68500000, count: 3240 },
      { method: "체크카드", amount: 22100000, count: 1580 },
      { method: "계좌이체", amount: 18300000, count: 890 },
      { method: "간편결제(카카오페이)", amount: 12400000, count: 1120 },
      { method: "간편결제(네이버페이)", amount: 4100000, count: 380 },
    ],
    purchases: [
      { type: "시즌권 (3일)", count: 2450, amount: 24500000 },
      { type: "시즌권 (7일)", count: 1820, amount: 27300000 },
      { type: "시즌권 (30일)", count: 980, amount: 29400000 },
      { type: "시즌권 (365일)", count: 320, amount: 38400000 },
      { type: "대회 패스", count: 540, amount: 5400000 },
      { type: "리그 패스", count: 280, amount: 3200000 },
    ],
    products: [
      { name: "프리미엄 시즌권 365", category: "시즌권", sold: 320, revenue: 38400000 },
      { name: "스탠다드 시즌권 30", category: "시즌권", sold: 980, revenue: 29400000 },
      { name: "위클리 시즌권 7", category: "시즌권", sold: 1820, revenue: 27300000 },
      { name: "데일리 시즌권 3", category: "시즌권", sold: 2450, revenue: 24500000 },
      { name: "K리그 패스", category: "리그", sold: 180, revenue: 2160000 },
      { name: "KBL 패스", category: "리그", sold: 100, revenue: 1040000 },
      { name: "전국체전 패스", category: "대회", sold: 340, revenue: 3400000 },
      { name: "U-18 대회 패스", category: "대회", sold: 200, revenue: 2000000 },
    ],
    productBreakdown: [
      { name: "프리미엄 시즌권 365", category: "시즌권", sold: 320, revenue: 38400000, refunds: 5 },
      { name: "스탠다드 시즌권 30", category: "시즌권", sold: 980, revenue: 29400000, refunds: 18 },
      { name: "위클리 시즌권 7", category: "시즌권", sold: 1820, revenue: 27300000, refunds: 32 },
      { name: "데일리 시즌권 3", category: "시즌권", sold: 2450, revenue: 24500000, refunds: 45 },
      { name: "K리그 패스", category: "리그", sold: 180, revenue: 2160000, refunds: 3 },
      { name: "KBL 패스", category: "리그", sold: 100, revenue: 1040000, refunds: 2 },
      { name: "전국체전 패스", category: "대회", sold: 340, revenue: 3400000, refunds: 8 },
      { name: "U-18 대회 패스", category: "대회", sold: 200, revenue: 2000000, refunds: 4 },
    ],
  };
}

// ── CSV Export Helper ──────────────────────────────────────────────

export function exportToCsv(filename: string, headers: string[], rows: string[][]) {
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
