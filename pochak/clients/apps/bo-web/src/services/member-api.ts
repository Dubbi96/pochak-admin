/**
 * Member Management API service
 * Calls real identity-service API via gateway, with mock fallback.
 */

import type { PageResponse } from "@/types/common";
import { gatewayApi } from "@/lib/api-client";

// ── Types ──────────────────────────────────────────────────────────

export type MemberType = "ALL" | "NON_MEMBER" | "MEMBER";
export type MemberGender = "ALL" | "MALE" | "FEMALE";
export type MemberStatus = "ALL" | "ACTIVE" | "BLOCKED" | "WITHDRAWN";
export type SeasonPass = "ALL" | "3DAY" | "7DAY" | "30DAY" | "365DAY" | "COMPETITION" | "LEAGUE";
export type SignUpProvider = "ALL" | "KAKAO" | "NAVER" | "APPLE" | "GOOGLE";
export type AgeGroup = "ALL" | "10S" | "20S" | "30S" | "40S";

export interface Member {
  id: number;
  name: string;
  nationality: string;
  email: string;
  phone: string;
  signUpProvider: SignUpProvider;
  signUpDate: string;
  status: "ACTIVE" | "BLOCKED" | "WITHDRAWN";
  memberType: "NON_MEMBER" | "MEMBER";
  gender: "MALE" | "FEMALE";
  ageGroup: "10S" | "20S" | "30S" | "40S";
  seasonPass: string | null;
}

export interface MemberFilter {
  memberType: MemberType;
  gender: MemberGender;
  status: MemberStatus;
  seasonPass: SeasonPass;
  signUpProvider: SignUpProvider;
  ageGroup: AgeGroup;
  dateFrom?: string;
  dateTo?: string;
  searchType?: string;
  searchKeyword?: string;
}

export interface BlacklistMember {
  id: number;
  name: string;
  nationality: string;
  phone: string;
  email: string;
  blockReason: string;
  blockedAt: string;
  blockedBy: string;
}

export interface BlacklistFilter {
  blockedBy?: string;
  dateFrom?: string;
  dateTo?: string;
  searchType?: string;
  searchKeyword?: string;
}

// ── Mock Data ──────────────────────────────────────────────────────

const MOCK_MEMBERS: Member[] = [
  { id: 1, name: "김민수", nationality: "대한민국", email: "minsu@gmail.com", phone: "010-1234-5678", signUpProvider: "KAKAO", signUpDate: "2025-06-01", status: "ACTIVE", memberType: "MEMBER", gender: "MALE", ageGroup: "20S", seasonPass: "30DAY" },
  { id: 2, name: "이수진", nationality: "대한민국", email: "sujin@naver.com", phone: "010-2345-6789", signUpProvider: "NAVER", signUpDate: "2025-06-05", status: "ACTIVE", memberType: "MEMBER", gender: "FEMALE", ageGroup: "30S", seasonPass: "365DAY" },
  { id: 3, name: "박정호", nationality: "대한민국", email: "jh.park@gmail.com", phone: "010-3456-7890", signUpProvider: "GOOGLE", signUpDate: "2025-07-10", status: "BLOCKED", memberType: "MEMBER", gender: "MALE", ageGroup: "40S", seasonPass: null },
  { id: 4, name: "최예린", nationality: "대한민국", email: "yerin@icloud.com", phone: "010-4567-8901", signUpProvider: "APPLE", signUpDate: "2025-08-15", status: "ACTIVE", memberType: "MEMBER", gender: "FEMALE", ageGroup: "20S", seasonPass: "7DAY" },
  { id: 5, name: "정태우", nationality: "대한민국", email: "taewoo@kakao.com", phone: "010-5678-9012", signUpProvider: "KAKAO", signUpDate: "2025-09-01", status: "WITHDRAWN", memberType: "MEMBER", gender: "MALE", ageGroup: "30S", seasonPass: null },
  { id: 6, name: "한지은", nationality: "대한민국", email: "jieun@naver.com", phone: "010-6789-0123", signUpProvider: "NAVER", signUpDate: "2025-09-20", status: "ACTIVE", memberType: "MEMBER", gender: "FEMALE", ageGroup: "10S", seasonPass: "3DAY" },
  { id: 7, name: "오성민", nationality: "대한민국", email: "sungmin@gmail.com", phone: "010-7890-1234", signUpProvider: "GOOGLE", signUpDate: "2025-10-05", status: "ACTIVE", memberType: "NON_MEMBER", gender: "MALE", ageGroup: "20S", seasonPass: null },
  { id: 8, name: "윤서현", nationality: "미국", email: "seohyun@gmail.com", phone: "010-8901-2345", signUpProvider: "APPLE", signUpDate: "2025-10-15", status: "ACTIVE", memberType: "MEMBER", gender: "FEMALE", ageGroup: "30S", seasonPass: "COMPETITION" },
  { id: 9, name: "임도현", nationality: "대한민국", email: "dohyun@kakao.com", phone: "010-9012-3456", signUpProvider: "KAKAO", signUpDate: "2025-11-01", status: "BLOCKED", memberType: "MEMBER", gender: "MALE", ageGroup: "40S", seasonPass: "LEAGUE" },
  { id: 10, name: "송유진", nationality: "일본", email: "yujin@naver.com", phone: "010-0123-4567", signUpProvider: "NAVER", signUpDate: "2025-11-20", status: "ACTIVE", memberType: "MEMBER", gender: "FEMALE", ageGroup: "20S", seasonPass: "30DAY" },
];

const MOCK_BLACKLIST: BlacklistMember[] = [
  { id: 3, name: "박정호", nationality: "대한민국", phone: "010-3456-7890", email: "jh.park@gmail.com", blockReason: "비매너 행위 반복", blockedAt: "2025-08-20", blockedBy: "admin" },
  { id: 9, name: "임도현", nationality: "대한민국", phone: "010-9012-3456", email: "dohyun@kakao.com", blockReason: "부정 결제 시도", blockedAt: "2025-12-01", blockedBy: "manager01" },
];

// ── Helpers ────────────────────────────────────────────────────────

function delay(ms = 300): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Map API response fields to BO Member type */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapApiMember(apiMember: any): Member {
  return {
    id: apiMember.id,
    name: apiMember.nickname || apiMember.name || '미설정',
    nationality: '대한민국',
    email: apiMember.email || '',
    phone: apiMember.phoneNumber || '',
    signUpProvider: 'KAKAO', // TODO: get from auth accounts
    signUpDate: apiMember.createdAt ? apiMember.createdAt.split('T')[0] : '',
    status: apiMember.status || 'ACTIVE',
    memberType: 'MEMBER',
    gender: 'MALE', // TODO: get from profile
    ageGroup: '20S', // TODO: calculate from birthDate
    seasonPass: null,
  };
}

// ── Member APIs ────────────────────────────────────────────────────

export async function getMembers(
  filters: MemberFilter,
  page = 0,
  size = 20
): Promise<PageResponse<Member>> {
  // Try real API via gateway first
  const params: Record<string, string> = {
    page: String(page),
    size: String(size),
  };
  if (filters.status !== "ALL") params.status = filters.status;
  if (filters.searchKeyword) {
    params.search = filters.searchKeyword;
    params.searchType = filters.searchType || "name";
  }

  const apiResult = await gatewayApi.get<PageResponse<Member>>(
    "/api/v1/admin/members",
    params
  );
  if (apiResult) {
    // Map API response fields to BO Member type
    if (apiResult.content) {
      return {
        ...apiResult,
        content: apiResult.content.map(mapApiMember),
      };
    }
    return apiResult;
  }

  // Mock fallback when API is unavailable
  console.warn("[member-api] Backend unavailable, using mock data");
  await delay();

  let filtered = [...MOCK_MEMBERS];

  if (filters.memberType !== "ALL") {
    filtered = filtered.filter((m) => m.memberType === filters.memberType);
  }
  if (filters.gender !== "ALL") {
    filtered = filtered.filter((m) => m.gender === filters.gender);
  }
  if (filters.status !== "ALL") {
    filtered = filtered.filter((m) => m.status === filters.status);
  }
  if (filters.signUpProvider !== "ALL") {
    filtered = filtered.filter((m) => m.signUpProvider === filters.signUpProvider);
  }
  if (filters.ageGroup !== "ALL") {
    filtered = filtered.filter((m) => m.ageGroup === filters.ageGroup);
  }
  if (filters.seasonPass !== "ALL") {
    filtered = filtered.filter((m) => m.seasonPass === filters.seasonPass);
  }
  if (filters.searchKeyword) {
    const kw = filters.searchKeyword.toLowerCase();
    const field = filters.searchType || "name";
    filtered = filtered.filter((m) => {
      if (field === "name") return m.name.toLowerCase().includes(kw);
      if (field === "email") return m.email.toLowerCase().includes(kw);
      if (field === "phone") return m.phone.includes(kw);
      return true;
    });
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

export async function blockMember(id: number): Promise<void> {
  // Try real API first
  const result = await gatewayApi.put(`/api/v1/admin/members/${id}/status`, { status: "SUSPENDED" });
  if (result !== null) return;

  // Mock fallback
  console.warn("[member-api] Backend unavailable, using mock data");
  await delay();
  const m = MOCK_MEMBERS.find((m) => m.id === id);
  if (m) {
    m.status = "BLOCKED";
    const exists = MOCK_BLACKLIST.find((b) => b.id === id);
    if (!exists) {
      MOCK_BLACKLIST.push({
        id: m.id,
        name: m.name,
        nationality: m.nationality,
        phone: m.phone,
        email: m.email,
        blockReason: "관리자 차단",
        blockedAt: new Date().toISOString().slice(0, 10),
        blockedBy: "admin",
      });
    }
  }
}

export async function withdrawMember(id: number): Promise<void> {
  // Try real API first
  const result = await gatewayApi.put(`/api/v1/admin/members/${id}/status`, { status: "WITHDRAWN" });
  if (result !== null) return;

  // Mock fallback
  console.warn("[member-api] Backend unavailable, using mock data");
  await delay();
  const m = MOCK_MEMBERS.find((m) => m.id === id);
  if (m) m.status = "WITHDRAWN";
}

// ── Blacklist APIs ─────────────────────────────────────────────────

export async function getBlacklist(
  filters: BlacklistFilter,
  page = 0,
  size = 20
): Promise<PageResponse<BlacklistMember>> {
  // Try real API first
  const params: Record<string, string> = {
    page: String(page),
    size: String(size),
  };
  if (filters.blockedBy) params.blockedBy = filters.blockedBy;
  if (filters.searchKeyword) {
    params.search = filters.searchKeyword;
    params.searchType = filters.searchType || "name";
  }

  const apiResult = await gatewayApi.get<PageResponse<BlacklistMember>>(
    "/api/v1/admin/members/blacklist",
    params
  );
  if (apiResult) return apiResult;

  // Mock fallback
  console.warn("[member-api] Backend unavailable, using mock data for blacklist");
  await delay();

  let filtered = [...MOCK_BLACKLIST];

  if (filters.blockedBy) {
    filtered = filtered.filter((b) => b.blockedBy === filters.blockedBy);
  }
  if (filters.searchKeyword) {
    const kw = filters.searchKeyword.toLowerCase();
    const field = filters.searchType || "name";
    filtered = filtered.filter((b) => {
      if (field === "name") return b.name.toLowerCase().includes(kw);
      if (field === "email") return b.email.toLowerCase().includes(kw);
      if (field === "phone") return b.phone.includes(kw);
      return true;
    });
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

export async function unblockMember(id: number): Promise<void> {
  // Try real API first
  const result = await gatewayApi.put(`/api/v1/admin/members/${id}/status`, { status: "ACTIVE" });
  if (result !== null) return;

  // Mock fallback
  console.warn("[member-api] Backend unavailable, using mock data");
  await delay();
  const m = MOCK_MEMBERS.find((m) => m.id === id);
  if (m) m.status = "ACTIVE";
  const idx = MOCK_BLACKLIST.findIndex((b) => b.id === id);
  if (idx !== -1) MOCK_BLACKLIST.splice(idx, 1);
}
