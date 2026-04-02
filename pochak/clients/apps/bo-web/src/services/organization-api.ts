/**
 * Organization Management API service
 * Calls real admin API via gateway.
 */

import type { PageResponse } from "@/types/common";
import { gatewayApi } from "@/lib/api-client";

// ── Types ──────────────────────────────────────────────────────────

export type OrganizationType = "ASSOCIATION" | "PRIVATE" | "PUBLIC";
export type OrganizationTypeFilter = "ALL" | OrganizationType;
export type OperationStatus = "ACTIVE" | "SUSPENDED" | "DISSOLVED";
export type OperationStatusFilter = "ALL" | OperationStatus;
export type AccessType = "OPEN" | "CLOSED";
export type AccessTypeFilter = "ALL" | AccessType;
export type ContentVisibility = "PUBLIC" | "MEMBERS_ONLY" | "PRIVATE";
export type DisplayArea = "CITY" | "CLUB";
export type JoinPolicy = "OPEN" | "APPROVAL" | "INVITE_ONLY";
export type ReservationPolicy = "ALL_MEMBERS" | "MANAGER_ONLY";

export type MembershipTargetType = "ORGANIZATION" | "TEAM";
export type MembershipTargetTypeFilter = "ALL" | MembershipTargetType;
export type MembershipRole = "ADMIN" | "MANAGER" | "COACH" | "PLAYER" | "GUARDIAN" | "MEMBER";
export type MembershipRoleFilter = "ALL" | MembershipRole;
export type MembershipApprovalStatus = "PENDING" | "APPROVED" | "REJECTED";
export type MembershipApprovalStatusFilter = "ALL" | MembershipApprovalStatus;

export interface Organization {
  id: number;
  sportName: string;
  type: OrganizationType;
  operationStatus: OperationStatus;
  accessType: AccessType;
  contentVisibility: ContentVisibility;
  displayArea: DisplayArea;
  isVerified: boolean;
  joinPolicy: JoinPolicy;
  reservationPolicy: ReservationPolicy;
  isCug: boolean;
  siGunGuCode: string;
  name: string;
  shortName: string;
  district: string;
  teamCount: number;
  memberCount: number;
  pendingMemberCount: number;
  parentOrganizationId: number | null;
  parentOrganizationName: string | null;
  canHostCompetition: boolean;
  autoJoin: boolean;
  managerOnlyBooking: boolean;
  logoUrl: string;
  phone: string;
  website: string;
  description: string;
  memberLimit: number | null;
  published: boolean;
}

export interface OrganizationFilter {
  type: OrganizationTypeFilter;
  operationStatus: OperationStatusFilter;
  accessType: AccessTypeFilter;
  sportName: string;
  searchKeyword: string;
  district: string;
}

export interface OrganizationFormData {
  type: OrganizationType;
  accessType: AccessType;
  contentVisibility: ContentVisibility;
  displayArea: DisplayArea;
  isVerified: boolean;
  joinPolicy: JoinPolicy;
  reservationPolicy: ReservationPolicy;
  isCug: boolean;
  siGunGuCode: string;
  parentOrganizationId: number | null;
  name: string;
  shortName: string;
  sportName: string;
  canHostCompetition: boolean;
  autoJoin: boolean;
  managerOnlyBooking: boolean;
  logoUrl: string;
  phone: string;
  website: string;
  description: string;
  district: string;
  memberLimit: number | null;
  published: boolean;
}

export interface TeamMember {
  id: number;
  name: string;
  role: MembershipRole;
  joinedAt: string;
}

export interface Team {
  id: number;
  name: string;
  sportName: string;
  district: string;
  memberCount: number;
  status: OperationStatus;
  organizationId: number | null;
  organizationName: string | null;
  createdAt: string;
  description: string;
  captainName: string | null;
  matchCount: number;
  winCount: number;
  logoUrl: string;
}

export interface TeamFilter {
  organizationId: string;
  sportName: string;
  status: OperationStatusFilter;
  searchKeyword: string;
}

export interface TeamFormData {
  name: string;
  sportName: string;
  district: string;
  organizationId: number | null;
  status: OperationStatus;
  logoUrl: string;
}

export interface Membership {
  id: number;
  userName: string;
  userEmail: string;
  targetType: MembershipTargetType;
  targetName: string;
  targetAccessType: AccessType | null;
  role: MembershipRole;
  approvalStatus: MembershipApprovalStatus;
  joinedAt: string;
  rejectReason: string | null;
  approvedBy: string | null;
  approvedAt: string | null;
}

export interface MembershipFilter {
  targetType: MembershipTargetTypeFilter;
  role: MembershipRoleFilter;
  approvalStatus: MembershipApprovalStatusFilter;
  searchKeyword: string;
}

// ── Constants ─────────────────────────────────────────────────────

export const ORG_TYPE_LABELS: Record<OrganizationType, string> = {
  ASSOCIATION: "협회",
  PRIVATE: "폐쇄",
  PUBLIC: "개방",
};

export const ACCESS_TYPE_LABELS: Record<AccessType, string> = {
  OPEN: "개방",
  CLOSED: "폐쇄",
};

export const CONTENT_VISIBILITY_LABELS: Record<ContentVisibility, string> = {
  PUBLIC: "전체 공개",
  MEMBERS_ONLY: "멤버만",
  PRIVATE: "비공개",
};

export const DISPLAY_AREA_LABELS: Record<DisplayArea, string> = {
  CITY: "포착 시티",
  CLUB: "포착 클럽",
};

export const JOIN_POLICY_LABELS: Record<JoinPolicy, string> = {
  OPEN: "자유 가입",
  APPROVAL: "승인 필요",
  INVITE_ONLY: "초대 전용",
};

export const RESERVATION_POLICY_LABELS: Record<ReservationPolicy, string> = {
  ALL_MEMBERS: "모든 멤버",
  MANAGER_ONLY: "매니저만",
};

export const OPERATION_STATUS_LABELS: Record<OperationStatus, string> = {
  ACTIVE: "운영중",
  SUSPENDED: "운영중단",
  DISSOLVED: "해체",
};

export const MEMBERSHIP_ROLE_LABELS: Record<MembershipRole, string> = {
  ADMIN: "관리자",
  MANAGER: "매니저",
  COACH: "코치",
  PLAYER: "선수",
  GUARDIAN: "보호자",
  MEMBER: "회원",
};

export const MEMBERSHIP_STATUS_LABELS: Record<MembershipApprovalStatus, string> = {
  PENDING: "대기",
  APPROVED: "승인",
  REJECTED: "거절",
};

export const SPORT_OPTIONS = [
  { value: "ALL", label: "전체" },
  { value: "축구", label: "축구" },
  { value: "야구", label: "야구" },
  { value: "농구", label: "농구" },
  { value: "배구", label: "배구" },
  { value: "풋살", label: "풋살" },
];

export const DISTRICT_OPTIONS = [
  { value: "ALL", label: "전체" },
  { value: "서울 강남구", label: "서울 강남구" },
  { value: "서울 서초구", label: "서울 서초구" },
  { value: "서울 송파구", label: "서울 송파구" },
  { value: "서울 마포구", label: "서울 마포구" },
  { value: "경기 성남시", label: "경기 성남시" },
  { value: "경기 수원시", label: "경기 수원시" },
  { value: "부산 해운대구", label: "부산 해운대구" },
];

// ── Organization APIs ─────────────────────────────────────────────

export async function getOrganizations(
  filters: OrganizationFilter,
  page = 0,
  size = 20
): Promise<PageResponse<Organization>> {
  const params: Record<string, string> = {
    page: String(page),
    size: String(size),
  };
  if (filters.type !== "ALL") params.type = filters.type;
  if (filters.operationStatus !== "ALL") params.operationStatus = filters.operationStatus;
  if (filters.accessType !== "ALL") params.accessType = filters.accessType;
  if (filters.sportName && filters.sportName !== "ALL") params.sportName = filters.sportName;
  if (filters.district && filters.district !== "ALL") params.district = filters.district;
  if (filters.searchKeyword) params.searchKeyword = filters.searchKeyword;

  return gatewayApi.get<PageResponse<Organization>>(
    "/api/v1/admin/organizations",
    params
  );
}

export async function createOrganization(data: OrganizationFormData): Promise<Organization> {
  return gatewayApi.post<Organization>("/api/v1/admin/organizations", data);
}

export async function updateOrganization(id: number, data: OrganizationFormData): Promise<Organization> {
  return gatewayApi.put<Organization>(`/api/v1/admin/organizations/${id}`, data);
}

export async function getOrganizationTreeData(): Promise<{ id: string; label: string; children?: { id: string; label: string }[] }[]> {
  return gatewayApi.get<{ id: string; label: string; children?: { id: string; label: string }[] }[]>(
    "/api/v1/admin/organizations/tree"
  );
}

export async function getOrganizationOptions(): Promise<{ value: string; label: string }[]> {
  return gatewayApi.get<{ value: string; label: string }[]>(
    "/api/v1/admin/organizations/options"
  );
}

export async function getHeadquarterOptions(): Promise<{ value: string; label: string }[]> {
  return gatewayApi.get<{ value: string; label: string }[]>(
    "/api/v1/admin/organizations/headquarters/options"
  );
}

// ── Team APIs ─────────────────────────────────────────────────────

export async function getTeams(
  filters: TeamFilter,
  page = 0,
  size = 20
): Promise<PageResponse<Team>> {
  const params: Record<string, string> = {
    page: String(page),
    size: String(size),
  };
  if (filters.organizationId && filters.organizationId !== "ALL") params.organizationId = filters.organizationId;
  if (filters.sportName && filters.sportName !== "ALL") params.sportName = filters.sportName;
  if (filters.status !== "ALL") params.status = filters.status;
  if (filters.searchKeyword) params.searchKeyword = filters.searchKeyword;

  return gatewayApi.get<PageResponse<Team>>(
    "/api/v1/admin/teams",
    params
  );
}

export async function createTeam(data: TeamFormData): Promise<Team> {
  return gatewayApi.post<Team>("/api/v1/admin/teams", data);
}

export async function updateTeam(id: number, data: TeamFormData): Promise<Team> {
  return gatewayApi.put<Team>(`/api/v1/admin/teams/${id}`, data);
}

// ── Membership APIs ───────────────────────────────────────────────

export async function getMemberships(
  filters: MembershipFilter,
  page = 0,
  size = 20
): Promise<PageResponse<Membership>> {
  const params: Record<string, string> = {
    page: String(page),
    size: String(size),
  };
  if (filters.targetType !== "ALL") params.targetType = filters.targetType;
  if (filters.role !== "ALL") params.role = filters.role;
  if (filters.approvalStatus !== "ALL") params.approvalStatus = filters.approvalStatus;
  if (filters.searchKeyword) params.searchKeyword = filters.searchKeyword;

  return gatewayApi.get<PageResponse<Membership>>(
    "/api/v1/admin/memberships",
    params
  );
}

export async function approveMembership(id: number): Promise<void> {
  await gatewayApi.put(`/api/v1/admin/memberships/${id}/approve`);
}

export async function rejectMembership(id: number): Promise<void> {
  await gatewayApi.put(`/api/v1/admin/memberships/${id}/reject`);
}

export async function changeMembershipRole(id: number, role: MembershipRole): Promise<void> {
  await gatewayApi.put(`/api/v1/admin/memberships/${id}/role`, { role });
}

export async function rejectMembershipWithReason(id: number, reason: string): Promise<void> {
  await gatewayApi.put(`/api/v1/admin/memberships/${id}/reject`, { reason });
}

// ── Organization Detail API ────────────────────────────────────────

export async function getOrganizationById(id: number): Promise<Organization> {
  return gatewayApi.get<Organization>(`/api/v1/admin/organizations/${id}`);
}

export async function getSubOrganizations(parentId: number): Promise<Organization[]> {
  return gatewayApi.get<Organization[]>(`/api/v1/admin/organizations/${parentId}/sub`);
}

// ── Team Detail APIs ───────────────────────────────────────────────

export async function getTeamById(id: number): Promise<Team> {
  return gatewayApi.get<Team>(`/api/v1/admin/teams/${id}`);
}

export async function getTeamMembers(teamId: number): Promise<TeamMember[]> {
  return gatewayApi.get<TeamMember[]>(`/api/v1/admin/teams/${teamId}/members`);
}

export async function getOrganizationMembers(orgId: number): Promise<Membership[]> {
  return gatewayApi.get<Membership[]>(`/api/v1/admin/organizations/${orgId}/members`);
}
