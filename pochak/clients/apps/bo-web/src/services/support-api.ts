/**
 * Support (CS) Admin API service - 1:1 문의 & 신고 관리
 * Calls real admin API via gateway.
 */

import type { PageResponse } from "@/types/common";
import { gatewayApi } from "@/lib/api-client";

// ── Types ──────────────────────────────────────────────────────────

export type InquiryStatus = "PENDING" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
export type InquiryCategory =
  | "ACCOUNT"
  | "PAYMENT"
  | "CONTENT"
  | "TECHNICAL"
  | "OTHER";

export type ReportStatus = "PENDING" | "REVIEWING" | "RESOLVED" | "DISMISSED";
export type ReportCategory =
  | "ABUSE"
  | "SPAM"
  | "ILLEGAL"
  | "INAPPROPRIATE"
  | "OTHER";

export interface Inquiry {
  id: number;
  userId: number;
  username: string;
  category: InquiryCategory;
  title: string;
  content: string;
  status: InquiryStatus;
  adminReply: string | null;
  repliedAt: string | null;
  createdAt: string;
}

export interface InquiryFilter {
  status?: InquiryStatus | null;
  category?: InquiryCategory | null;
  searchKeyword?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface InquiryReplyRequest {
  reply: string;
}

export interface Report {
  id: number;
  reporterUserId: number;
  reporterUsername: string;
  targetType: "USER" | "CONTENT" | "COMMENT";
  targetId: number;
  targetName: string;
  category: ReportCategory;
  description: string;
  status: ReportStatus;
  adminNote: string | null;
  resolvedAt: string | null;
  createdAt: string;
}

export interface ReportFilter {
  status?: ReportStatus | null;
  category?: ReportCategory | null;
  targetType?: string | null;
  searchKeyword?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface ReportActionRequest {
  status: ReportStatus;
  adminNote: string;
}

// ── Label Maps ─────────────────────────────────────────────────────

export const INQUIRY_STATUS_LABELS: Record<InquiryStatus, string> = {
  PENDING: "대기",
  IN_PROGRESS: "처리중",
  RESOLVED: "처리완료",
  CLOSED: "종료",
};

export const INQUIRY_CATEGORY_LABELS: Record<InquiryCategory, string> = {
  ACCOUNT: "계정",
  PAYMENT: "결제",
  CONTENT: "콘텐츠",
  TECHNICAL: "기술",
  OTHER: "기타",
};

export const REPORT_STATUS_LABELS: Record<ReportStatus, string> = {
  PENDING: "접수",
  REVIEWING: "검토중",
  RESOLVED: "처리완료",
  DISMISSED: "기각",
};

export const REPORT_CATEGORY_LABELS: Record<ReportCategory, string> = {
  ABUSE: "욕설/혐오",
  SPAM: "스팸/광고",
  ILLEGAL: "불법콘텐츠",
  INAPPROPRIATE: "부적절한내용",
  OTHER: "기타",
};

// ── Inquiry APIs ────────────────────────────────────────────────────

export async function getInquiries(
  filters: InquiryFilter,
  page = 0,
  size = 20
): Promise<PageResponse<Inquiry>> {
  const params: Record<string, string> = { page: String(page), size: String(size) };
  if (filters.status) params.status = filters.status;
  if (filters.category) params.category = filters.category;
  if (filters.searchKeyword) params.searchKeyword = filters.searchKeyword;
  if (filters.dateFrom) params.dateFrom = filters.dateFrom;
  if (filters.dateTo) params.dateTo = filters.dateTo;

  return gatewayApi.get<PageResponse<Inquiry>>("/api/v1/admin/inquiries", params);
}

export async function replyToInquiry(
  id: number,
  req: InquiryReplyRequest
): Promise<Inquiry> {
  return gatewayApi.post<Inquiry>(`/api/v1/admin/inquiries/${id}/reply`, req);
}

export async function updateInquiryStatus(
  id: number,
  status: InquiryStatus
): Promise<Inquiry> {
  return gatewayApi.put<Inquiry>(`/api/v1/admin/inquiries/${id}/status`, { status });
}

// ── Report APIs ─────────────────────────────────────────────────────

export async function getReports(
  filters: ReportFilter,
  page = 0,
  size = 20
): Promise<PageResponse<Report>> {
  const params: Record<string, string> = { page: String(page), size: String(size) };
  if (filters.status) params.status = filters.status;
  if (filters.category) params.category = filters.category;
  if (filters.targetType) params.targetType = filters.targetType;
  if (filters.searchKeyword) params.searchKeyword = filters.searchKeyword;
  if (filters.dateFrom) params.dateFrom = filters.dateFrom;
  if (filters.dateTo) params.dateTo = filters.dateTo;

  return gatewayApi.get<PageResponse<Report>>("/api/v1/admin/reports", params);
}

export async function actionReport(
  id: number,
  req: ReportActionRequest
): Promise<Report> {
  return gatewayApi.put<Report>(`/api/v1/admin/reports/${id}/action`, req);
}
