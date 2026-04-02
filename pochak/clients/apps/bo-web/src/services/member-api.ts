/**
 * Member Management API service
 * Calls real identity-service API via gateway.
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

// ── Helpers ────────────────────────────────────────────────────────

/** Map API response fields to BO Member type */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapApiMember(apiMember: any): Member {
  return {
    id: apiMember.id,
    name: apiMember.nickname || apiMember.name || '미설정',
    nationality: '대한민국',
    email: apiMember.email || '',
    phone: apiMember.phoneNumber || '',
    signUpProvider: apiMember.signUpProvider || apiMember.authProvider || '-',
    signUpDate: apiMember.createdAt ? apiMember.createdAt.split('T')[0] : '',
    status: apiMember.status || 'ACTIVE',
    memberType: apiMember.memberType || 'MEMBER',
    gender: apiMember.gender || '-',
    ageGroup: apiMember.ageGroup || '-',
    seasonPass: null,
  };
}

// ── Member APIs ────────────────────────────────────────────────────

export async function getMembers(
  filters: MemberFilter,
  page = 0,
  size = 20
): Promise<PageResponse<Member>> {
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
  if (apiResult.content) {
    return {
      ...apiResult,
      content: apiResult.content.map(mapApiMember),
    };
  }
  return apiResult;
}

export async function blockMember(id: number): Promise<void> {
  await gatewayApi.put(`/api/v1/admin/members/${id}/status`, { status: "SUSPENDED" });
}

export async function withdrawMember(id: number): Promise<void> {
  await gatewayApi.put(`/api/v1/admin/members/${id}/status`, { status: "WITHDRAWN" });
}

// ── Blacklist APIs ─────────────────────────────────────────────────

export async function getBlacklist(
  filters: BlacklistFilter,
  page = 0,
  size = 20
): Promise<PageResponse<BlacklistMember>> {
  const params: Record<string, string> = {
    page: String(page),
    size: String(size),
  };
  if (filters.blockedBy) params.blockedBy = filters.blockedBy;
  if (filters.searchKeyword) {
    params.search = filters.searchKeyword;
    params.searchType = filters.searchType || "name";
  }

  return gatewayApi.get<PageResponse<BlacklistMember>>(
    "/api/v1/admin/members/blacklist",
    params
  );
}

export async function unblockMember(id: number): Promise<void> {
  await gatewayApi.put(`/api/v1/admin/members/${id}/status`, { status: "ACTIVE" });
}
