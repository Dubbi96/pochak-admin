/**
 * Site Management API service (Banners, Notices, Terms)
 * Calls real admin API via gateway, with mock fallback.
 */

import type { PageResponse } from "@/types/common";
import { gatewayApi } from "@/lib/api-client";

// ── Types ──────────────────────────────────────────────────────────

export type PublishStatus = "PUBLISHED" | "UNPUBLISHED";

// Banner
export interface Banner {
  id: number;
  order: number;
  title: string;
  pcImageUrl: string;
  mobileImageUrl: string;
  linkUrl: string;
  startDate: string;
  endDate: string;
  status: PublishStatus;
  createdAt: string;
}

export interface BannerCreateRequest {
  title: string;
  pcImageUrl: string;
  mobileImageUrl: string;
  linkUrl: string;
  startDate: string;
  endDate: string;
  status: PublishStatus;
}

export interface BannerFilter {
  dateFrom?: string;
  dateTo?: string;
  status?: PublishStatus | "ALL";
  searchKeyword?: string;
}

// Notice
export type NoticeCategory =
  | "ALL"
  | "TEAM_ELITE"
  | "TEAM_GENERAL"
  | "ASSOCIATION"
  | "GROUP_OPEN"
  | "GROUP_CLOSED"
  | "COMPETITION"
  | "LEAGUE";

export interface Notice {
  id: number;
  category: NoticeCategory;
  title: string;
  content: string;
  viewCount: number;
  startDate: string;
  endDate: string;
  status: PublishStatus;
  createdAt: string;
}

export interface NoticeCreateRequest {
  category: NoticeCategory;
  title: string;
  content: string;
  startDate: string;
  endDate: string;
  status: PublishStatus;
}

export interface NoticeFilter {
  dateFrom?: string;
  dateTo?: string;
  status?: PublishStatus | "ALL";
  category?: NoticeCategory | "ALL";
  searchKeyword?: string;
}

// Terms
export type TermsCategory =
  | "SERVICE"
  | "LOCATION"
  | "ECOMMERCE"
  | "PRIVACY"
  | "PAID_PRODUCT"
  | "REFUND"
  | "DATA_COLLECTION"
  | "THIRD_PARTY"
  | "MARKETING";

export interface Terms {
  id: number;
  category: TermsCategory;
  title: string;
  content: string;
  version: number;
  isRequired: boolean;
  status: PublishStatus;
  createdAt: string;
}

export interface TermsCreateRequest {
  category: TermsCategory;
  title: string;
  content: string;
  version: number;
  isRequired: boolean;
  status: PublishStatus;
}

export interface TermsFilter {
  dateFrom?: string;
  dateTo?: string;
  category?: TermsCategory | "ALL";
  searchKeyword?: string;
}

// ── Label Maps ─────────────────────────────────────────────────────

export const NOTICE_CATEGORY_LABELS: Record<string, string> = {
  ALL: "전체",
  TEAM_ELITE: "팀엘리트",
  TEAM_GENERAL: "팀일반",
  ASSOCIATION: "협회",
  GROUP_OPEN: "단체개방",
  GROUP_CLOSED: "단체폐쇄",
  COMPETITION: "대회",
  LEAGUE: "리그",
};

export const TERMS_CATEGORY_LABELS: Record<string, string> = {
  SERVICE: "서비스이용약관",
  LOCATION: "위치기반",
  ECOMMERCE: "통신판매",
  PRIVACY: "개인정보처리방침",
  PAID_PRODUCT: "유료상품",
  REFUND: "환불",
  DATA_COLLECTION: "개인정보수집",
  THIRD_PARTY: "3자제공",
  MARKETING: "마케팅",
};

// ── Mock Data ──────────────────────────────────────────────────────

let MOCK_BANNERS: Banner[] = [
  { id: 1, order: 1, title: "2025 화랑대기 전경기 무료 LIVE", pcImageUrl: "https://placehold.co/1920x400/1E1E1E/00C853?text=Banner+1+PC", mobileImageUrl: "https://placehold.co/750x400/1E1E1E/00C853?text=Banner+1+Mobile", linkUrl: "/contents/live/live-1", startDate: "2025-10-20", endDate: "2025-10-30", status: "PUBLISHED", createdAt: "2025-10-18" },
  { id: 2, order: 2, title: "제5회 전국 리틀야구 생중계", pcImageUrl: "https://placehold.co/1920x400/1E1E1E/2196F3?text=Banner+2+PC", mobileImageUrl: "https://placehold.co/750x400/1E1E1E/2196F3?text=Banner+2+Mobile", linkUrl: "/contents/live/live-4", startDate: "2025-11-01", endDate: "2025-11-10", status: "PUBLISHED", createdAt: "2025-10-25" },
  { id: 3, order: 3, title: "제30회 서울시 협회장기 테니스", pcImageUrl: "https://placehold.co/1920x400/1E1E1E/FF9800?text=Banner+3+PC", mobileImageUrl: "https://placehold.co/750x400/1E1E1E/FF9800?text=Banner+3+Mobile", linkUrl: "/contents/live/live-5", startDate: "2025-11-05", endDate: "2025-11-15", status: "UNPUBLISHED", createdAt: "2025-10-28" },
  { id: 4, order: 4, title: "앱 업데이트 안내", pcImageUrl: "https://placehold.co/1920x400/1E1E1E/9C27B0?text=Banner+4+PC", mobileImageUrl: "https://placehold.co/750x400/1E1E1E/9C27B0?text=Banner+4+Mobile", linkUrl: "", startDate: "2026-01-01", endDate: "2026-01-31", status: "PUBLISHED", createdAt: "2025-12-15" },
  { id: 5, order: 5, title: "VIP 회원 혜택", pcImageUrl: "https://placehold.co/1920x400/1E1E1E/E91E63?text=Banner+5+PC", mobileImageUrl: "https://placehold.co/750x400/1E1E1E/E91E63?text=Banner+5+Mobile", linkUrl: "https://pochak.com/vip", startDate: "2026-02-01", endDate: "2026-03-31", status: "PUBLISHED", createdAt: "2026-01-20" },
];

let MOCK_NOTICES: Notice[] = [
  { id: 1, category: "ALL", title: "서비스 정기 점검 안내", content: "2025년 12월 1일 02:00~06:00 서비스 정기 점검이 진행됩니다.", viewCount: 1520, startDate: "2025-11-25", endDate: "2025-12-01", status: "PUBLISHED", createdAt: "2025-11-20" },
  { id: 2, category: "COMPETITION", title: "2026 봄 시즌 대회 일정 공지", content: "2026 봄 시즌 대회 일정을 안내드립니다. 자세한 내용은 대회관리 메뉴를 참고하세요.", viewCount: 890, startDate: "2026-01-01", endDate: "2026-04-30", status: "PUBLISHED", createdAt: "2025-12-10" },
  { id: 3, category: "TEAM_ELITE", title: "팀엘리트 전용 시설 이용 안내", content: "팀엘리트 등급 회원 전용 시설 이용 규정이 변경되었습니다.", viewCount: 340, startDate: "2026-01-15", endDate: "2026-06-30", status: "PUBLISHED", createdAt: "2026-01-10" },
  { id: 4, category: "ASSOCIATION", title: "협회 등록 절차 변경 안내", content: "2026년부터 협회 등록 절차가 간소화됩니다.", viewCount: 210, startDate: "2026-02-01", endDate: "2026-12-31", status: "UNPUBLISHED", createdAt: "2026-01-25" },
  { id: 5, category: "LEAGUE", title: "리그 참가비 결제 안내", content: "리그 참가비 결제 방법이 변경되었습니다. 카드 및 계좌이체 모두 가능합니다.", viewCount: 560, startDate: "2026-02-15", endDate: "2026-05-31", status: "PUBLISHED", createdAt: "2026-02-05" },
];

let MOCK_TERMS: Terms[] = [
  { id: 1, category: "SERVICE", title: "서비스 이용약관", content: "제1조 (목적) 이 약관은 POCHAK 서비스 이용에 관한 조건을 규정합니다...", version: 3, isRequired: true, status: "PUBLISHED", createdAt: "2025-06-01" },
  { id: 2, category: "PRIVACY", title: "개인정보처리방침", content: "POCHAK은 이용자의 개인정보를 중요시하며...", version: 4, isRequired: true, status: "PUBLISHED", createdAt: "2025-08-15" },
  { id: 3, category: "LOCATION", title: "위치기반서비스 이용약관", content: "제1조 (목적) 이 약관은 위치기반서비스 제공에 관한...", version: 2, isRequired: true, status: "PUBLISHED", createdAt: "2025-09-01" },
  { id: 4, category: "MARKETING", title: "마케팅 정보 수신 동의", content: "POCHAK에서 제공하는 이벤트, 혜택 등의 마케팅 정보를...", version: 1, isRequired: false, status: "PUBLISHED", createdAt: "2025-10-10" },
  { id: 5, category: "PAID_PRODUCT", title: "유료상품 이용약관", content: "시즌권, 뽈 등 유료 상품의 구매 및 이용에 관한...", version: 2, isRequired: true, status: "PUBLISHED", createdAt: "2025-11-01" },
  { id: 6, category: "REFUND", title: "환불 규정", content: "유료 상품의 환불은 아래 규정에 따라 처리됩니다...", version: 2, isRequired: true, status: "UNPUBLISHED", createdAt: "2025-12-01" },
  { id: 7, category: "DATA_COLLECTION", title: "개인정보 수집 및 이용 동의", content: "수집항목: 이름, 이메일, 휴대폰번호...", version: 3, isRequired: true, status: "PUBLISHED", createdAt: "2026-01-05" },
  { id: 8, category: "THIRD_PARTY", title: "개인정보 제3자 제공 동의", content: "POCHAK은 아래와 같이 개인정보를 제3자에게 제공합니다...", version: 1, isRequired: false, status: "PUBLISHED", createdAt: "2026-01-20" },
  { id: 9, category: "ECOMMERCE", title: "통신판매업자 정보", content: "상호: 주식회사 POCHAK / 대표: ...", version: 1, isRequired: true, status: "PUBLISHED", createdAt: "2026-02-01" },
];

let nextBannerId = 6;
let nextNoticeId = 6;
let nextTermsId = 10;

// ── Helpers ────────────────────────────────────────────────────────

function delay(ms = 300): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ── Banner APIs ────────────────────────────────────────────────────

export async function getBanners(
  filters: BannerFilter,
  page = 0,
  size = 20
): Promise<PageResponse<Banner>> {
  // Try real API first
  const params: Record<string, string> = { page: String(page), size: String(size) };
  if (filters.status && filters.status !== "ALL") params.status = filters.status;
  if (filters.searchKeyword) params.searchKeyword = filters.searchKeyword;

  const apiResult = await gatewayApi.get<PageResponse<Banner>>("/api/v1/admin/banners", params);
  if (apiResult) return apiResult;

  // Mock fallback
  console.warn("[site-api] Backend unavailable, using mock data");
  await delay();

  let filtered = [...MOCK_BANNERS].sort((a, b) => a.order - b.order);

  if (filters.status && filters.status !== "ALL") {
    filtered = filtered.filter((b) => b.status === filters.status);
  }
  if (filters.searchKeyword) {
    const kw = filters.searchKeyword.toLowerCase();
    filtered = filtered.filter((b) => b.title.toLowerCase().includes(kw));
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

export async function createBanner(data: BannerCreateRequest): Promise<Banner> {
  const apiResult = await gatewayApi.post<Banner>("/api/v1/admin/banners", data);
  if (apiResult) return apiResult;
  console.warn("[site-api] Backend unavailable, using mock data");
  await delay();
  const maxOrder = MOCK_BANNERS.reduce((max, b) => Math.max(max, b.order), 0);
  const banner: Banner = {
    id: nextBannerId++,
    order: maxOrder + 1,
    ...data,
    createdAt: new Date().toISOString().slice(0, 10),
  };
  MOCK_BANNERS.push(banner);
  return banner;
}

export async function updateBanner(
  id: number,
  data: BannerCreateRequest
): Promise<Banner> {
  const apiResult = await gatewayApi.put<Banner>(`/api/v1/admin/banners/${id}`, data);
  if (apiResult) return apiResult;
  console.warn("[site-api] Backend unavailable, using mock data");
  await delay();
  const idx = MOCK_BANNERS.findIndex((b) => b.id === id);
  if (idx === -1) throw new Error("Banner not found");
  MOCK_BANNERS[idx] = { ...MOCK_BANNERS[idx], ...data };
  return MOCK_BANNERS[idx];
}

export async function updateBannerOrders(
  orders: { id: number; order: number }[]
): Promise<void> {
  const apiResult = await gatewayApi.put("/api/v1/admin/banners/order", { items: orders });
  if (apiResult !== null) return;
  console.warn("[site-api] Backend unavailable, using mock data");
  await delay();
  for (const o of orders) {
    const banner = MOCK_BANNERS.find((b) => b.id === o.id);
    if (banner) banner.order = o.order;
  }
}

export async function deleteBanner(id: number): Promise<void> {
  const apiResult = await gatewayApi.delete(`/api/v1/admin/banners/${id}`);
  if (apiResult !== null) return;
  console.warn("[site-api] Backend unavailable, using mock data");
  await delay();
  MOCK_BANNERS = MOCK_BANNERS.filter((b) => b.id !== id);
}

// ── Notice APIs ────────────────────────────────────────────────────

export async function getNotices(
  filters: NoticeFilter,
  page = 0,
  size = 20
): Promise<PageResponse<Notice>> {
  // Try real API first
  const params: Record<string, string> = { page: String(page), size: String(size) };
  if (filters.status && filters.status !== "ALL") params.status = filters.status;
  if (filters.category && filters.category !== "ALL") params.category = filters.category;
  if (filters.searchKeyword) params.searchKeyword = filters.searchKeyword;

  const apiResult = await gatewayApi.get<PageResponse<Notice>>("/api/v1/admin/notices", params);
  if (apiResult) return apiResult;

  // Mock fallback
  console.warn("[site-api] Backend unavailable, using mock data");
  await delay();

  let filtered = [...MOCK_NOTICES];

  if (filters.status && filters.status !== "ALL") {
    filtered = filtered.filter((n) => n.status === filters.status);
  }
  if (filters.category && filters.category !== "ALL") {
    filtered = filtered.filter((n) => n.category === filters.category);
  }
  if (filters.searchKeyword) {
    const kw = filters.searchKeyword.toLowerCase();
    filtered = filtered.filter((n) => n.title.toLowerCase().includes(kw));
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

export async function createNotice(data: NoticeCreateRequest): Promise<Notice> {
  const apiResult = await gatewayApi.post<Notice>("/api/v1/admin/notices", data);
  if (apiResult) return apiResult;
  console.warn("[site-api] Backend unavailable, using mock data");
  await delay();
  const notice: Notice = {
    id: nextNoticeId++,
    ...data,
    viewCount: 0,
    createdAt: new Date().toISOString().slice(0, 10),
  };
  MOCK_NOTICES.push(notice);
  return notice;
}

export async function updateNotice(
  id: number,
  data: NoticeCreateRequest
): Promise<Notice> {
  const apiResult = await gatewayApi.put<Notice>(`/api/v1/admin/notices/${id}`, data);
  if (apiResult) return apiResult;
  console.warn("[site-api] Backend unavailable, using mock data");
  await delay();
  const idx = MOCK_NOTICES.findIndex((n) => n.id === id);
  if (idx === -1) throw new Error("Notice not found");
  MOCK_NOTICES[idx] = { ...MOCK_NOTICES[idx], ...data };
  return MOCK_NOTICES[idx];
}

export async function deleteNotice(id: number): Promise<void> {
  const apiResult = await gatewayApi.delete(`/api/v1/admin/notices/${id}`);
  if (apiResult !== null) return;
  console.warn("[site-api] Backend unavailable, using mock data");
  await delay();
  MOCK_NOTICES = MOCK_NOTICES.filter((n) => n.id !== id);
}

// ── Terms APIs ─────────────────────────────────────────────────────

export async function getTermsList(
  filters: TermsFilter,
  page = 0,
  size = 20
): Promise<PageResponse<Terms>> {
  // Try real API first
  const params: Record<string, string> = { page: String(page), size: String(size) };
  if (filters.category && filters.category !== "ALL") params.category = filters.category;
  if (filters.searchKeyword) params.searchKeyword = filters.searchKeyword;

  const apiResult = await gatewayApi.get<PageResponse<Terms>>("/api/v1/admin/terms", params);
  if (apiResult) return apiResult;

  // Mock fallback
  console.warn("[site-api] Backend unavailable, using mock data");
  await delay();

  let filtered = [...MOCK_TERMS];

  if (filters.category && filters.category !== "ALL") {
    filtered = filtered.filter((t) => t.category === filters.category);
  }
  if (filters.searchKeyword) {
    const kw = filters.searchKeyword.toLowerCase();
    filtered = filtered.filter((t) => t.title.toLowerCase().includes(kw));
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

export async function createTerms(data: TermsCreateRequest): Promise<Terms> {
  const apiResult = await gatewayApi.post<Terms>("/api/v1/admin/terms", data);
  if (apiResult) return apiResult;
  console.warn("[site-api] Backend unavailable, using mock data");
  await delay();
  const terms: Terms = {
    id: nextTermsId++,
    ...data,
    createdAt: new Date().toISOString().slice(0, 10),
  };
  MOCK_TERMS.push(terms);
  return terms;
}

export async function updateTerms(
  id: number,
  data: TermsCreateRequest
): Promise<Terms> {
  const apiResult = await gatewayApi.put<Terms>(`/api/v1/admin/terms/${id}`, data);
  if (apiResult) return apiResult;
  console.warn("[site-api] Backend unavailable, using mock data");
  await delay();
  const idx = MOCK_TERMS.findIndex((t) => t.id === id);
  if (idx === -1) throw new Error("Terms not found");
  MOCK_TERMS[idx] = { ...MOCK_TERMS[idx], ...data };
  return MOCK_TERMS[idx];
}

export async function deleteTerms(id: number): Promise<void> {
  const apiResult = await gatewayApi.delete(`/api/v1/admin/terms/${id}`);
  if (apiResult !== null) return;
  console.warn("[site-api] Backend unavailable, using mock data");
  await delay();
  MOCK_TERMS = MOCK_TERMS.filter((t) => t.id !== id);
}

// ── CS: 1:1 문의 Types ────────────────────────────────────────────

export type InquiryStatus = "UNANSWERED" | "ANSWERED";
export type InquiryCategory = "ACCOUNT" | "PAYMENT" | "CONTENT" | "TECH" | "ETC";

export interface Inquiry {
  id: number;
  status: InquiryStatus;
  category: InquiryCategory;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  answeredAt: string | null;
  answer: string | null;
}

export interface InquiryFilter {
  status?: InquiryStatus | "ALL";
  category?: InquiryCategory | "ALL";
  dateFrom?: string;
  dateTo?: string;
  answeredFrom?: string;
  answeredTo?: string;
  searchKeyword?: string;
}

export const INQUIRY_STATUS_LABELS: Record<InquiryStatus, string> = {
  UNANSWERED: "미답변",
  ANSWERED: "답변완료",
};

export const INQUIRY_CATEGORY_LABELS: Record<string, string> = {
  ALL: "전체",
  ACCOUNT: "계정",
  PAYMENT: "결제",
  CONTENT: "콘텐츠",
  TECH: "기술지원",
  ETC: "기타",
};

// ── CS: 신고 관리 Types ───────────────────────────────────────────

export type ReportStatus = "RECEIVED" | "RESOLVED" | "REJECTED";
export type ReportType = "USER" | "CONTENT" | "COMMENT" | "TEAM";

export interface Report {
  id: number;
  status: ReportStatus;
  reportType: ReportType;
  reporterName: string;
  reporterPhone: string;
  targetName: string;
  reason: string;
  comment: string | null;
  receivedAt: string;
  resolvedAt: string | null;
}

export interface ReportFilter {
  status?: ReportStatus | "ALL";
  reportType?: ReportType | "ALL";
  receivedFrom?: string;
  receivedTo?: string;
  resolvedFrom?: string;
  resolvedTo?: string;
  reporterName?: string;
  reporterPhone?: string;
}

export const REPORT_STATUS_LABELS: Record<ReportStatus, string> = {
  RECEIVED: "신고접수",
  RESOLVED: "처리완료",
  REJECTED: "거절",
};

export const REPORT_TYPE_LABELS: Record<string, string> = {
  ALL: "전체",
  USER: "사용자",
  CONTENT: "콘텐츠",
  COMMENT: "댓글",
  TEAM: "팀",
};

// ── Push Campaign Types ──────────────────────────────────────────

export type PushCampaignStatus = "DRAFT" | "SCHEDULED" | "SENT" | "CANCELLED";

export interface PushCampaign {
  id: number;
  title: string;
  body: string;
  target: "ALL" | "SEGMENT";
  scheduledAt: string | null;
  sentCount: number | null;
  openRate: number | null;
  status: PushCampaignStatus;
  linkUrl: string;
  createdAt: string;
}

export interface PushCampaignCreateRequest {
  title: string;
  body: string;
  target: "ALL" | "SEGMENT";
  scheduledAt: string;
  linkUrl: string;
}

export interface PushCampaignFilter {
  status?: PushCampaignStatus | "ALL";
  searchKeyword?: string;
}

export const PUSH_STATUS_LABELS: Record<PushCampaignStatus, string> = {
  DRAFT: "임시저장",
  SCHEDULED: "예약",
  SENT: "발송완료",
  CANCELLED: "취소",
};

// ── App Version Types ─────────────────────────────────────────────

export type OsType = "AOS" | "iOS";

export interface AppVersion {
  id: number;
  osType: OsType;
  version: string;
  forceUpdate: boolean;
  updatedAt: string;
  registeredBy: string;
}

export interface AppVersionCreateRequest {
  osType: OsType;
  version: string;
  forceUpdate: boolean;
}

// ── Advertisement Types ───────────────────────────────────────────

export type AdType = "GROUP_OPEN_MAIN" | "PRE_ROLL" | "MID_ROLL";

export interface Advertisement {
  id: number;
  title: string;
  adType: AdType;
  url: string;
}

export interface AdvertisementCreateRequest {
  title: string;
  adType: AdType;
  url: string;
}

export const AD_TYPE_LABELS: Record<AdType, string> = {
  GROUP_OPEN_MAIN: "단체개방메인",
  PRE_ROLL: "프리롤",
  MID_ROLL: "미드롤",
};

// ── CS Mock Data ──────────────────────────────────────────────────

let MOCK_INQUIRIES: Inquiry[] = [
  { id: 1, status: "UNANSWERED", category: "PAYMENT", title: "뽈 충전이 안 됩니다", content: "결제 완료 후 뽈이 충전되지 않았습니다. 확인 부탁드립니다.", author: "김철수", createdAt: "2026-03-18", answeredAt: null, answer: null },
  { id: 2, status: "ANSWERED", category: "ACCOUNT", title: "비밀번호 변경 문의", content: "비밀번호를 변경하고 싶은데 방법을 모르겠습니다.", author: "이영희", createdAt: "2026-03-15", answeredAt: "2026-03-16", answer: "설정 > 계정 > 비밀번호 변경에서 변경하실 수 있습니다." },
  { id: 3, status: "UNANSWERED", category: "CONTENT", title: "VOD 재생 오류", content: "특정 VOD가 재생되지 않습니다. 영상 ID: 12345", author: "박지민", createdAt: "2026-03-17", answeredAt: null, answer: null },
  { id: 4, status: "ANSWERED", category: "TECH", title: "앱 크래시 문제", content: "앱이 자주 강제종료됩니다. AOS 14, 갤럭시 S24", author: "최민수", createdAt: "2026-03-10", answeredAt: "2026-03-12", answer: "최신 버전으로 업데이트해 주세요. 문제가 지속되면 다시 문의 부탁드립니다." },
  { id: 5, status: "UNANSWERED", category: "ETC", title: "이벤트 당첨 관련 문의", content: "지난 이벤트 당첨 여부를 확인하고 싶습니다.", author: "정다은", createdAt: "2026-03-19", answeredAt: null, answer: null },
  { id: 6, status: "ANSWERED", category: "PAYMENT", title: "환불 처리 문의", content: "시즌권 구매를 취소하고 싶습니다.", author: "한서준", createdAt: "2026-03-08", answeredAt: "2026-03-09", answer: "환불 규정에 따라 처리되었습니다. 3-5일 내 환불됩니다." },
];

let MOCK_REPORTS: Report[] = [
  { id: 1, status: "RECEIVED", reportType: "USER", reporterName: "김철수", reporterPhone: "010-1234-5678", targetName: "악성유저1", reason: "욕설 및 비방", comment: null, receivedAt: "2026-03-18", resolvedAt: null },
  { id: 2, status: "RESOLVED", reportType: "CONTENT", reporterName: "이영희", reporterPhone: "010-2345-6789", targetName: "부적절한 영상", reason: "불건전 콘텐츠", comment: "해당 콘텐츠를 삭제 처리했습니다.", receivedAt: "2026-03-15", resolvedAt: "2026-03-16" },
  { id: 3, status: "RECEIVED", reportType: "COMMENT", reporterName: "박지민", reporterPhone: "010-3456-7890", targetName: "댓글신고", reason: "스팸 댓글", comment: null, receivedAt: "2026-03-17", resolvedAt: null },
  { id: 4, status: "REJECTED", reportType: "USER", reporterName: "최민수", reporterPhone: "010-4567-8901", targetName: "일반유저", reason: "허위 신고", comment: "확인 결과 해당 사항 없음으로 거절 처리합니다.", receivedAt: "2026-03-12", resolvedAt: "2026-03-14" },
  { id: 5, status: "RECEIVED", reportType: "TEAM", reporterName: "정다은", reporterPhone: "010-5678-9012", targetName: "위반팀", reason: "부정행위 의심", comment: null, receivedAt: "2026-03-19", resolvedAt: null },
];

let MOCK_APP_VERSIONS: AppVersion[] = [
  { id: 1, osType: "AOS", version: "2.3.1", forceUpdate: true, updatedAt: "2026-03-15", registeredBy: "관리자" },
  { id: 2, osType: "iOS", version: "2.3.0", forceUpdate: true, updatedAt: "2026-03-14", registeredBy: "관리자" },
  { id: 3, osType: "AOS", version: "2.2.0", forceUpdate: false, updatedAt: "2026-02-20", registeredBy: "운영자" },
  { id: 4, osType: "iOS", version: "2.2.0", forceUpdate: false, updatedAt: "2026-02-18", registeredBy: "운영자" },
  { id: 5, osType: "AOS", version: "2.1.0", forceUpdate: false, updatedAt: "2026-01-10", registeredBy: "관리자" },
  { id: 6, osType: "iOS", version: "2.1.0", forceUpdate: false, updatedAt: "2026-01-08", registeredBy: "관리자" },
];

let MOCK_ADVERTISEMENTS: Advertisement[] = [
  { id: 1, title: "시즌 오픈 광고", adType: "GROUP_OPEN_MAIN", url: "https://ads.pochak.com/season-open" },
  { id: 2, title: "스포츠 브랜드 A 프리롤", adType: "PRE_ROLL", url: "https://ads.pochak.com/brand-a-pre" },
  { id: 3, title: "음료 브랜드 B 미드롤", adType: "MID_ROLL", url: "https://ads.pochak.com/brand-b-mid" },
  { id: 4, title: "체육관 프로모션", adType: "GROUP_OPEN_MAIN", url: "https://ads.pochak.com/gym-promo" },
  { id: 5, title: "신발 브랜드 C 프리롤", adType: "PRE_ROLL", url: "https://ads.pochak.com/brand-c-pre" },
];

let MOCK_PUSH_CAMPAIGNS: PushCampaign[] = [
  { id: 1, title: "시즌권 할인 프로모션", body: "봄 시즌 시즌권이 30% 할인됩니다! 지금 바로 확인하세요.", target: "ALL", scheduledAt: "2026-03-20 10:00", sentCount: null, openRate: null, status: "SCHEDULED", linkUrl: "https://pochak.com/promo/spring", createdAt: "2026-03-18" },
  { id: 2, title: "서울 vs 부산 LIVE 알림", body: "오늘 20:00 서울 vs 부산 프로축구 경기가 시작됩니다!", target: "SEGMENT", scheduledAt: "2026-03-18 19:30", sentCount: 12450, openRate: 34.2, status: "SENT", linkUrl: "pochak://live/123", createdAt: "2026-03-17" },
  { id: 3, title: "주간 하이라이트 알림", body: "이번 주 베스트 플레이 모음을 확인해보세요!", target: "ALL", scheduledAt: "2026-03-17 12:00", sentCount: 28300, openRate: 28.5, status: "SENT", linkUrl: "pochak://vod/weekly", createdAt: "2026-03-16" },
  { id: 4, title: "VIP 전용 이벤트", body: "VIP 회원 전용 특별 이벤트가 진행됩니다.", target: "SEGMENT", scheduledAt: null, sentCount: null, openRate: null, status: "DRAFT", linkUrl: "", createdAt: "2026-03-19" },
  { id: 5, title: "앱 업데이트 안내", body: "더 나은 시청 경험을 위해 최신 버전으로 업데이트해주세요.", target: "ALL", scheduledAt: "2026-03-15 09:00", sentCount: 35200, openRate: 42.1, status: "SENT", linkUrl: "", createdAt: "2026-03-14" },
  { id: 6, title: "취소된 캠페인", body: "테스트 캠페인입니다.", target: "ALL", scheduledAt: "2026-03-16 15:00", sentCount: null, openRate: null, status: "CANCELLED", linkUrl: "", createdAt: "2026-03-15" },
];

let nextPushCampaignId = 7;

let nextInquiryId = 7;
let nextReportId = 6;
let nextAppVersionId = 7;
let nextAdId = 6;

// ── CS: Inquiry APIs ──────────────────────────────────────────────

export async function getInquiries(
  filters: InquiryFilter,
  page = 0,
  size = 20
): Promise<PageResponse<Inquiry>> {
  // Try real API first
  const params: Record<string, string> = { page: String(page), size: String(size) };
  if (filters.status && filters.status !== "ALL") params.status = filters.status;
  if (filters.category && filters.category !== "ALL") params.category = filters.category;
  if (filters.searchKeyword) params.searchKeyword = filters.searchKeyword;

  const apiResult = await gatewayApi.get<PageResponse<Inquiry>>("/api/v1/admin/cs/inquiries", params);
  if (apiResult) return apiResult;

  // Mock fallback
  console.warn("[site-api] Backend unavailable, using mock data");
  await delay();

  let filtered = [...MOCK_INQUIRIES];

  if (filters.status && filters.status !== "ALL") {
    filtered = filtered.filter((i) => i.status === filters.status);
  }
  if (filters.category && filters.category !== "ALL") {
    filtered = filtered.filter((i) => i.category === filters.category);
  }
  if (filters.searchKeyword) {
    const kw = filters.searchKeyword.toLowerCase();
    filtered = filtered.filter(
      (i) => i.title.toLowerCase().includes(kw) || i.author.toLowerCase().includes(kw)
    );
  }

  filtered.sort((a, b) => b.id - a.id);

  const start = page * size;
  const content = filtered.slice(start, start + size);

  return {
    content,
    totalElements: filtered.length,
    totalPages: Math.ceil(filtered.length / size) || 1,
    page,
    size,
  };
}

export async function answerInquiry(id: number, answer: string): Promise<Inquiry> {
  const apiResult = await gatewayApi.post<Inquiry>(`/api/v1/admin/cs/inquiries/${id}/answer`, { answer });
  if (apiResult) return apiResult;
  console.warn("[site-api] Backend unavailable, using mock data");
  await delay();
  const idx = MOCK_INQUIRIES.findIndex((i) => i.id === id);
  if (idx === -1) throw new Error("Inquiry not found");
  MOCK_INQUIRIES[idx] = {
    ...MOCK_INQUIRIES[idx],
    status: "ANSWERED",
    answer,
    answeredAt: new Date().toISOString().slice(0, 10),
  };
  return MOCK_INQUIRIES[idx];
}

// ── CS: Report APIs ───────────────────────────────────────────────

export async function getReports(
  filters: ReportFilter,
  page = 0,
  size = 20
): Promise<PageResponse<Report>> {
  // Try real API first
  const params: Record<string, string> = { page: String(page), size: String(size) };
  if (filters.status && filters.status !== "ALL") params.status = filters.status;
  if (filters.reportType && filters.reportType !== "ALL") params.reportType = filters.reportType;
  if (filters.reporterName) params.reporterName = filters.reporterName;
  if (filters.reporterPhone) params.reporterPhone = filters.reporterPhone;

  const apiResult = await gatewayApi.get<PageResponse<Report>>("/api/v1/admin/cs/reports", params);
  if (apiResult) return apiResult;

  // Mock fallback
  console.warn("[site-api] Backend unavailable, using mock data");
  await delay();

  let filtered = [...MOCK_REPORTS];

  if (filters.status && filters.status !== "ALL") {
    filtered = filtered.filter((r) => r.status === filters.status);
  }
  if (filters.reportType && filters.reportType !== "ALL") {
    filtered = filtered.filter((r) => r.reportType === filters.reportType);
  }
  if (filters.reporterName) {
    const kw = filters.reporterName.toLowerCase();
    filtered = filtered.filter((r) => r.reporterName.toLowerCase().includes(kw));
  }
  if (filters.reporterPhone) {
    filtered = filtered.filter((r) => r.reporterPhone.includes(filters.reporterPhone!));
  }

  filtered.sort((a, b) => b.id - a.id);

  const start = page * size;
  const content = filtered.slice(start, start + size);

  return {
    content,
    totalElements: filtered.length,
    totalPages: Math.ceil(filtered.length / size) || 1,
    page,
    size,
  };
}

export async function resolveReport(
  id: number,
  action: "RESOLVED" | "REJECTED",
  comment: string
): Promise<Report> {
  const apiResult = await gatewayApi.put<Report>(`/api/v1/admin/cs/reports/${id}/resolve`, { action, comment });
  if (apiResult) return apiResult;
  console.warn("[site-api] Backend unavailable, using mock data");
  await delay();
  const idx = MOCK_REPORTS.findIndex((r) => r.id === id);
  if (idx === -1) throw new Error("Report not found");
  MOCK_REPORTS[idx] = {
    ...MOCK_REPORTS[idx],
    status: action,
    comment,
    resolvedAt: new Date().toISOString().slice(0, 10),
  };
  return MOCK_REPORTS[idx];
}

// ── App Version APIs ──────────────────────────────────────────────

export async function getAppVersions(
  page = 0,
  size = 20
): Promise<PageResponse<AppVersion>> {
  await delay();

  const filtered = [...MOCK_APP_VERSIONS].sort((a, b) => b.id - a.id);
  const start = page * size;
  const content = filtered.slice(start, start + size);

  return {
    content,
    totalElements: filtered.length,
    totalPages: Math.ceil(filtered.length / size) || 1,
    page,
    size,
  };
}

export async function getLatestVersions(): Promise<{
  aos: AppVersion | null;
  ios: AppVersion | null;
}> {
  await delay(100);
  const aos = MOCK_APP_VERSIONS
    .filter((v) => v.osType === "AOS")
    .sort((a, b) => b.id - a.id)[0] || null;
  const ios = MOCK_APP_VERSIONS
    .filter((v) => v.osType === "iOS")
    .sort((a, b) => b.id - a.id)[0] || null;
  return { aos, ios };
}

export async function createAppVersion(
  data: AppVersionCreateRequest
): Promise<AppVersion> {
  await delay();
  const version: AppVersion = {
    id: nextAppVersionId++,
    ...data,
    updatedAt: new Date().toISOString().slice(0, 10),
    registeredBy: "관리자",
  };
  MOCK_APP_VERSIONS.push(version);
  return version;
}

export async function toggleForceUpdate(id: number): Promise<AppVersion> {
  await delay();
  const idx = MOCK_APP_VERSIONS.findIndex((v) => v.id === id);
  if (idx === -1) throw new Error("AppVersion not found");
  MOCK_APP_VERSIONS[idx] = {
    ...MOCK_APP_VERSIONS[idx],
    forceUpdate: !MOCK_APP_VERSIONS[idx].forceUpdate,
    updatedAt: new Date().toISOString().slice(0, 10),
  };
  return MOCK_APP_VERSIONS[idx];
}

export async function deleteAppVersion(id: number): Promise<void> {
  await delay();
  MOCK_APP_VERSIONS = MOCK_APP_VERSIONS.filter((v) => v.id !== id);
}

// ── Advertisement APIs ────────────────────────────────────────────

export async function getAdvertisements(
  page = 0,
  size = 20
): Promise<PageResponse<Advertisement>> {
  await delay();

  const filtered = [...MOCK_ADVERTISEMENTS].sort((a, b) => b.id - a.id);
  const start = page * size;
  const content = filtered.slice(start, start + size);

  return {
    content,
    totalElements: filtered.length,
    totalPages: Math.ceil(filtered.length / size) || 1,
    page,
    size,
  };
}

export async function createAdvertisement(
  data: AdvertisementCreateRequest
): Promise<Advertisement> {
  await delay();
  const ad: Advertisement = {
    id: nextAdId++,
    ...data,
  };
  MOCK_ADVERTISEMENTS.push(ad);
  return ad;
}

export async function deleteAdvertisement(id: number): Promise<void> {
  await delay();
  MOCK_ADVERTISEMENTS = MOCK_ADVERTISEMENTS.filter((a) => a.id !== id);
}

// ── Push Campaign APIs ──────────────────────────────────────────

export async function getPushCampaigns(
  filters: PushCampaignFilter,
  page = 0,
  size = 20
): Promise<PageResponse<PushCampaign>> {
  await delay();

  let filtered = [...MOCK_PUSH_CAMPAIGNS];

  if (filters.status && filters.status !== "ALL") {
    filtered = filtered.filter((c) => c.status === filters.status);
  }
  if (filters.searchKeyword) {
    const kw = filters.searchKeyword.toLowerCase();
    filtered = filtered.filter((c) => c.title.toLowerCase().includes(kw));
  }

  filtered.sort((a, b) => b.id - a.id);

  const start = page * size;
  const content = filtered.slice(start, start + size);

  return {
    content,
    totalElements: filtered.length,
    totalPages: Math.ceil(filtered.length / size) || 1,
    page,
    size,
  };
}

export async function createPushCampaign(
  data: PushCampaignCreateRequest
): Promise<PushCampaign> {
  await delay();
  const campaign: PushCampaign = {
    id: nextPushCampaignId++,
    title: data.title,
    body: data.body,
    target: data.target,
    scheduledAt: data.scheduledAt || null,
    sentCount: null,
    openRate: null,
    status: data.scheduledAt ? "SCHEDULED" : "DRAFT",
    linkUrl: data.linkUrl,
    createdAt: new Date().toISOString().slice(0, 10),
  };
  MOCK_PUSH_CAMPAIGNS.push(campaign);
  return campaign;
}

export async function cancelPushCampaign(id: number): Promise<PushCampaign> {
  await delay();
  const idx = MOCK_PUSH_CAMPAIGNS.findIndex((c) => c.id === id);
  if (idx === -1) throw new Error("Campaign not found");
  MOCK_PUSH_CAMPAIGNS[idx] = {
    ...MOCK_PUSH_CAMPAIGNS[idx],
    status: "CANCELLED",
  };
  return MOCK_PUSH_CAMPAIGNS[idx];
}
