/**
 * Support (CS) Admin API service - 1:1 문의 & 신고 관리
 * Calls real admin API via gateway, with mock fallback.
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

// ── Mock Data ──────────────────────────────────────────────────────

let MOCK_INQUIRIES: Inquiry[] = [
  {
    id: 1,
    userId: 101,
    username: "testuser",
    category: "PAYMENT",
    title: "결제 취소 문의드립니다",
    content: "구매한 시즌권을 취소하고 싶은데 방법을 알려주세요.",
    status: "PENDING",
    adminReply: null,
    repliedAt: null,
    createdAt: "2026-03-18T10:30:00",
  },
  {
    id: 2,
    userId: 102,
    username: "pochak2026",
    category: "ACCOUNT",
    title: "비밀번호 초기화가 안됩니다",
    content: "이메일 인증번호를 받아서 입력했는데 오류가 납니다.",
    status: "IN_PROGRESS",
    adminReply: "현재 확인 중입니다. 잠시만 기다려 주세요.",
    repliedAt: "2026-03-18T14:00:00",
    createdAt: "2026-03-17T09:00:00",
  },
  {
    id: 3,
    userId: 103,
    username: "sportsLover99",
    category: "CONTENT",
    title: "경기 영상이 안 보입니다",
    content: "구매한 경기 영상을 재생하면 오류 메시지가 표시됩니다.",
    status: "RESOLVED",
    adminReply: "서버 점검 후 정상화되었습니다. 불편을 드려 죄송합니다.",
    repliedAt: "2026-03-16T16:00:00",
    createdAt: "2026-03-15T20:00:00",
  },
  {
    id: 4,
    userId: 104,
    username: "kim_sports",
    category: "TECHNICAL",
    title: "앱 다운로드가 안됩니다",
    content: "안드로이드 기기에서 앱 설치 시 오류가 발생합니다.",
    status: "PENDING",
    adminReply: null,
    repliedAt: null,
    createdAt: "2026-03-19T08:00:00",
  },
  {
    id: 5,
    userId: 105,
    username: "futsal_fan",
    category: "OTHER",
    title: "포인트 적립 문의",
    content: "이벤트 참여 후 뽈이 지급되지 않았습니다.",
    status: "RESOLVED",
    adminReply: "수동으로 포인트 지급 처리했습니다.",
    repliedAt: "2026-03-14T11:00:00",
    createdAt: "2026-03-13T22:00:00",
  },
];

let MOCK_REPORTS: Report[] = [
  {
    id: 1,
    reporterUserId: 101,
    reporterUsername: "testuser",
    targetType: "USER",
    targetId: 999,
    targetName: "baduser123",
    category: "ABUSE",
    description: "욕설이 담긴 채팅을 반복합니다.",
    status: "PENDING",
    adminNote: null,
    resolvedAt: null,
    createdAt: "2026-03-19T09:00:00",
  },
  {
    id: 2,
    reporterUserId: 102,
    reporterUsername: "pochak2026",
    targetType: "CONTENT",
    targetId: 501,
    targetName: "경기 영상 #501",
    category: "INAPPROPRIATE",
    description: "경기와 무관한 내용이 포함되어 있습니다.",
    status: "REVIEWING",
    adminNote: "검토 진행 중",
    resolvedAt: null,
    createdAt: "2026-03-18T15:00:00",
  },
  {
    id: 3,
    reporterUserId: 103,
    reporterUsername: "sportsLover99",
    targetType: "USER",
    targetId: 888,
    targetName: "spammer99",
    category: "SPAM",
    description: "광고성 메시지를 계속 보내고 있습니다.",
    status: "RESOLVED",
    adminNote: "해당 계정 7일 이용 정지 처리",
    resolvedAt: "2026-03-17T14:00:00",
    createdAt: "2026-03-16T10:00:00",
  },
  {
    id: 4,
    reporterUserId: 104,
    reporterUsername: "kim_sports",
    targetType: "COMMENT",
    targetId: 301,
    targetName: "댓글 #301",
    category: "ILLEGAL",
    description: "불법 도박 링크를 공유했습니다.",
    status: "RESOLVED",
    adminNote: "댓글 삭제 및 계정 영구 정지",
    resolvedAt: "2026-03-15T16:00:00",
    createdAt: "2026-03-15T11:00:00",
  },
  {
    id: 5,
    reporterUserId: 105,
    reporterUsername: "futsal_fan",
    targetType: "CONTENT",
    targetId: 502,
    targetName: "클립 #502",
    category: "OTHER",
    description: "저작권이 있는 음악이 배경으로 사용되었습니다.",
    status: "DISMISSED",
    adminNote: "확인 결과 저작권 문제 없음",
    resolvedAt: "2026-03-14T10:00:00",
    createdAt: "2026-03-13T09:00:00",
  },
];

let nextInquiryId = 6;
let nextReportId = 6;

function delay(ms = 300): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ── Inquiry APIs ────────────────────────────────────────────────────

export async function getInquiries(
  filters: InquiryFilter,
  page = 0,
  size = 20
): Promise<PageResponse<Inquiry>> {
  // Try real API first
  const params: Record<string, string> = { page: String(page), size: String(size) };
  if (filters.status) params.status = filters.status;
  if (filters.category) params.category = filters.category;
  if (filters.searchKeyword) params.searchKeyword = filters.searchKeyword;

  const apiResult = await gatewayApi.get<PageResponse<Inquiry>>("/api/v1/admin/inquiries", params);
  if (apiResult) return apiResult;

  // Mock fallback
  console.warn("[support-api] Backend unavailable, using mock data");
  await delay();

  let filtered = [...MOCK_INQUIRIES];

  if (filters.status) {
    filtered = filtered.filter((i) => i.status === filters.status);
  }
  if (filters.category) {
    filtered = filtered.filter((i) => i.category === filters.category);
  }
  if (filters.searchKeyword) {
    const kw = filters.searchKeyword.toLowerCase();
    filtered = filtered.filter(
      (i) =>
        i.username.toLowerCase().includes(kw) ||
        i.title.toLowerCase().includes(kw)
    );
  }

  filtered.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

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

export async function replyToInquiry(
  id: number,
  req: InquiryReplyRequest
): Promise<Inquiry> {
  // Try real API first
  const apiResult = await gatewayApi.post<Inquiry>(`/api/v1/admin/inquiries/${id}/reply`, req);
  if (apiResult) return apiResult;

  // Mock fallback
  console.warn("[support-api] Backend unavailable, using mock data");
  await delay();
  const idx = MOCK_INQUIRIES.findIndex((i) => i.id === id);
  if (idx < 0) throw new Error("Not found");
  MOCK_INQUIRIES[idx] = {
    ...MOCK_INQUIRIES[idx],
    adminReply: req.reply,
    repliedAt: new Date().toISOString(),
    status: "RESOLVED",
  };
  return MOCK_INQUIRIES[idx];
}

export async function updateInquiryStatus(
  id: number,
  status: InquiryStatus
): Promise<Inquiry> {
  // Try real API first
  const apiResult = await gatewayApi.put<Inquiry>(`/api/v1/admin/inquiries/${id}/status`, { status });
  if (apiResult) return apiResult;

  // Mock fallback
  console.warn("[support-api] Backend unavailable, using mock data");
  await delay();
  const idx = MOCK_INQUIRIES.findIndex((i) => i.id === id);
  if (idx < 0) throw new Error("Not found");
  MOCK_INQUIRIES[idx] = { ...MOCK_INQUIRIES[idx], status };
  return MOCK_INQUIRIES[idx];
}

// ── Report APIs ─────────────────────────────────────────────────────

export async function getReports(
  filters: ReportFilter,
  page = 0,
  size = 20
): Promise<PageResponse<Report>> {
  // Try real API first
  const params: Record<string, string> = { page: String(page), size: String(size) };
  if (filters.status) params.status = filters.status;
  if (filters.category) params.category = filters.category;
  if (filters.targetType) params.targetType = filters.targetType;
  if (filters.searchKeyword) params.searchKeyword = filters.searchKeyword;

  const apiResult = await gatewayApi.get<PageResponse<Report>>("/api/v1/admin/reports", params);
  if (apiResult) return apiResult;

  // Mock fallback
  console.warn("[support-api] Backend unavailable, using mock data");
  await delay();

  let filtered = [...MOCK_REPORTS];

  if (filters.status) {
    filtered = filtered.filter((r) => r.status === filters.status);
  }
  if (filters.category) {
    filtered = filtered.filter((r) => r.category === filters.category);
  }
  if (filters.targetType) {
    filtered = filtered.filter((r) => r.targetType === filters.targetType);
  }
  if (filters.searchKeyword) {
    const kw = filters.searchKeyword.toLowerCase();
    filtered = filtered.filter(
      (r) =>
        r.reporterUsername.toLowerCase().includes(kw) ||
        r.targetName.toLowerCase().includes(kw) ||
        r.description.toLowerCase().includes(kw)
    );
  }

  filtered.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

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

export async function actionReport(
  id: number,
  req: ReportActionRequest
): Promise<Report> {
  // Try real API first
  const apiResult = await gatewayApi.put<Report>(`/api/v1/admin/reports/${id}/action`, req);
  if (apiResult) return apiResult;

  // Mock fallback
  console.warn("[support-api] Backend unavailable, using mock data");
  await delay();
  const idx = MOCK_REPORTS.findIndex((r) => r.id === id);
  if (idx < 0) throw new Error("Not found");
  MOCK_REPORTS[idx] = {
    ...MOCK_REPORTS[idx],
    status: req.status,
    adminNote: req.adminNote,
    resolvedAt:
      req.status === "RESOLVED" || req.status === "DISMISSED"
        ? new Date().toISOString()
        : null,
  };
  return MOCK_REPORTS[idx];
}
