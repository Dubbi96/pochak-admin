/**
 * Site Management API service (Banners, Notices, Terms)
 * Calls real admin API via gateway.
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

// ── Banner APIs ────────────────────────────────────────────────────

export async function getBanners(
  filters: BannerFilter,
  page = 0,
  size = 20
): Promise<PageResponse<Banner>> {
  const params: Record<string, string> = { page: String(page), size: String(size) };
  if (filters.status && filters.status !== "ALL") params.status = filters.status;
  if (filters.searchKeyword) params.searchKeyword = filters.searchKeyword;

  return gatewayApi.get<PageResponse<Banner>>("/admin/api/v1/site/banners", params);
}

export async function createBanner(data: BannerCreateRequest): Promise<Banner> {
  return gatewayApi.post<Banner>("/admin/api/v1/site/banners", data);
}

export async function updateBanner(
  id: number,
  data: BannerCreateRequest
): Promise<Banner> {
  return gatewayApi.put<Banner>(`/admin/api/v1/site/banners/${id}`, data);
}

export async function updateBannerOrders(
  orders: { id: number; order: number }[]
): Promise<void> {
  await gatewayApi.put("/admin/api/v1/site/banners/order", { items: orders });
}

export async function deleteBanner(id: number): Promise<void> {
  await gatewayApi.delete(`/admin/api/v1/site/banners/${id}`);
}

// ── Notice APIs ────────────────────────────────────────────────────

export async function getNotices(
  filters: NoticeFilter,
  page = 0,
  size = 20
): Promise<PageResponse<Notice>> {
  const params: Record<string, string> = { page: String(page), size: String(size) };
  if (filters.status && filters.status !== "ALL") params.status = filters.status;
  if (filters.category && filters.category !== "ALL") params.category = filters.category;
  if (filters.searchKeyword) params.searchKeyword = filters.searchKeyword;

  return gatewayApi.get<PageResponse<Notice>>("/api/v1/admin/notices", params);
}

export async function createNotice(data: NoticeCreateRequest): Promise<Notice> {
  return gatewayApi.post<Notice>("/api/v1/admin/notices", data);
}

export async function updateNotice(
  id: number,
  data: NoticeCreateRequest
): Promise<Notice> {
  return gatewayApi.put<Notice>(`/api/v1/admin/notices/${id}`, data);
}

export async function deleteNotice(id: number): Promise<void> {
  await gatewayApi.delete(`/api/v1/admin/notices/${id}`);
}

// ── Terms APIs ─────────────────────────────────────────────────────

export async function getTermsList(
  filters: TermsFilter,
  page = 0,
  size = 20
): Promise<PageResponse<Terms>> {
  const params: Record<string, string> = { page: String(page), size: String(size) };
  if (filters.category && filters.category !== "ALL") params.category = filters.category;
  if (filters.searchKeyword) params.searchKeyword = filters.searchKeyword;

  return gatewayApi.get<PageResponse<Terms>>("/api/v1/admin/terms", params);
}

export async function createTerms(data: TermsCreateRequest): Promise<Terms> {
  return gatewayApi.post<Terms>("/api/v1/admin/terms", data);
}

export async function updateTerms(
  id: number,
  data: TermsCreateRequest
): Promise<Terms> {
  return gatewayApi.put<Terms>(`/api/v1/admin/terms/${id}`, data);
}

export async function deleteTerms(id: number): Promise<void> {
  await gatewayApi.delete(`/api/v1/admin/terms/${id}`);
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

// ── CS: Inquiry APIs ──────────────────────────────────────────────

export async function getInquiries(
  filters: InquiryFilter,
  page = 0,
  size = 20
): Promise<PageResponse<Inquiry>> {
  const params: Record<string, string> = { page: String(page), size: String(size) };
  if (filters.status && filters.status !== "ALL") params.status = filters.status;
  if (filters.category && filters.category !== "ALL") params.category = filters.category;
  if (filters.searchKeyword) params.searchKeyword = filters.searchKeyword;

  return gatewayApi.get<PageResponse<Inquiry>>("/api/v1/admin/cs/inquiries", params);
}

export async function answerInquiry(id: number, answer: string): Promise<Inquiry> {
  return gatewayApi.post<Inquiry>(`/api/v1/admin/cs/inquiries/${id}/answer`, { answer });
}

// ── CS: Report APIs ───────────────────────────────────────────────

export async function getReports(
  filters: ReportFilter,
  page = 0,
  size = 20
): Promise<PageResponse<Report>> {
  const params: Record<string, string> = { page: String(page), size: String(size) };
  if (filters.status && filters.status !== "ALL") params.status = filters.status;
  if (filters.reportType && filters.reportType !== "ALL") params.reportType = filters.reportType;
  if (filters.reporterName) params.reporterName = filters.reporterName;
  if (filters.reporterPhone) params.reporterPhone = filters.reporterPhone;

  return gatewayApi.get<PageResponse<Report>>("/api/v1/admin/cs/reports", params);
}

export async function resolveReport(
  id: number,
  action: "RESOLVED" | "REJECTED",
  comment: string
): Promise<Report> {
  return gatewayApi.put<Report>(`/api/v1/admin/cs/reports/${id}/resolve`, { action, comment });
}

// ── App Version APIs ──────────────────────────────────────────────

export async function getAppVersions(
  page = 0,
  size = 20
): Promise<PageResponse<AppVersion>> {
  const params: Record<string, string> = { page: String(page), size: String(size) };
  return gatewayApi.get<PageResponse<AppVersion>>("/api/v1/admin/app-versions", params);
}

export async function getLatestVersions(): Promise<{
  aos: AppVersion | null;
  ios: AppVersion | null;
}> {
  return gatewayApi.get<{ aos: AppVersion | null; ios: AppVersion | null }>(
    "/api/v1/admin/app-versions/latest"
  );
}

export async function createAppVersion(
  data: AppVersionCreateRequest
): Promise<AppVersion> {
  return gatewayApi.post<AppVersion>("/api/v1/admin/app-versions", data);
}

export async function toggleForceUpdate(id: number): Promise<AppVersion> {
  return gatewayApi.put<AppVersion>(`/api/v1/admin/app-versions/${id}/toggle-force-update`);
}

export async function deleteAppVersion(id: number): Promise<void> {
  await gatewayApi.delete(`/api/v1/admin/app-versions/${id}`);
}

// ── Advertisement APIs ────────────────────────────────────────────

export async function getAdvertisements(
  page = 0,
  size = 20
): Promise<PageResponse<Advertisement>> {
  const params: Record<string, string> = { page: String(page), size: String(size) };
  return gatewayApi.get<PageResponse<Advertisement>>("/api/v1/admin/advertisements", params);
}

export async function createAdvertisement(
  data: AdvertisementCreateRequest
): Promise<Advertisement> {
  return gatewayApi.post<Advertisement>("/api/v1/admin/advertisements", data);
}

export async function deleteAdvertisement(id: number): Promise<void> {
  await gatewayApi.delete(`/api/v1/admin/advertisements/${id}`);
}

// ── Push Campaign APIs ──────────────────────────────────────────

export async function getPushCampaigns(
  filters: PushCampaignFilter,
  page = 0,
  size = 20
): Promise<PageResponse<PushCampaign>> {
  const params: Record<string, string> = { page: String(page), size: String(size) };
  if (filters.status && filters.status !== "ALL") params.status = filters.status;
  if (filters.searchKeyword) params.searchKeyword = filters.searchKeyword;

  return gatewayApi.get<PageResponse<PushCampaign>>("/api/v1/admin/push-campaigns", params);
}

export async function createPushCampaign(
  data: PushCampaignCreateRequest
): Promise<PushCampaign> {
  return gatewayApi.post<PushCampaign>("/api/v1/admin/push-campaigns", data);
}

export async function cancelPushCampaign(id: number): Promise<PushCampaign> {
  return gatewayApi.put<PushCampaign>(`/api/v1/admin/push-campaigns/${id}/cancel`);
}
