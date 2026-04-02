/**
 * Organization Management API service
 * Calls real admin API via gateway, with mock fallback.
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

// ── Mock Data ─────────────────────────────────────────────────────

const MOCK_ORGANIZATIONS: Organization[] = [
  {
    id: 1, sportName: "축구", type: "ASSOCIATION", operationStatus: "ACTIVE", accessType: "OPEN", contentVisibility: "PUBLIC",
    displayArea: "CITY", isVerified: true, joinPolicy: "OPEN", reservationPolicy: "ALL_MEMBERS", isCug: false, siGunGuCode: "11680",
    name: "대한축구협회", shortName: "축협", district: "서울 강남구",
    teamCount: 42, memberCount: 1250, pendingMemberCount: 0, parentOrganizationId: null, parentOrganizationName: null,
    canHostCompetition: true, autoJoin: false, managerOnlyBooking: false, logoUrl: "https://placehold.co/80x80/E8E8E8/999?text=Logo", phone: "02-1234-5678", website: "https://kfa.or.kr",
    description: "대한민국 축구를 총괄하는 협회", memberLimit: null, published: true,
  },
  {
    id: 2, sportName: "야구", type: "ASSOCIATION", operationStatus: "ACTIVE", accessType: "OPEN", contentVisibility: "PUBLIC",
    displayArea: "CITY", isVerified: true, joinPolicy: "OPEN", reservationPolicy: "ALL_MEMBERS", isCug: false, siGunGuCode: "11710",
    name: "대한야구소프트볼협회", shortName: "야구협회", district: "서울 송파구",
    teamCount: 35, memberCount: 980, pendingMemberCount: 0, parentOrganizationId: null, parentOrganizationName: null,
    canHostCompetition: true, autoJoin: false, managerOnlyBooking: false, logoUrl: "https://placehold.co/80x80/E8E8E8/999?text=Logo", phone: "02-2345-6789", website: "https://kbsa.or.kr",
    description: "대한민국 야구 총괄 협회", memberLimit: null, published: true,
  },
  {
    id: 3, sportName: "축구", type: "PRIVATE", operationStatus: "ACTIVE", accessType: "CLOSED", contentVisibility: "MEMBERS_ONLY",
    displayArea: "CLUB", isVerified: false, joinPolicy: "APPROVAL", reservationPolicy: "MANAGER_ONLY", isCug: true, siGunGuCode: "11680",
    name: "FC강남 본점", shortName: "FC강남", district: "서울 강남구",
    teamCount: 8, memberCount: 320, pendingMemberCount: 5, parentOrganizationId: null, parentOrganizationName: null,
    canHostCompetition: false, autoJoin: false, managerOnlyBooking: true, logoUrl: "https://placehold.co/80x80/E8E8E8/999?text=Logo", phone: "02-3456-7890", website: "",
    description: "강남 지역 축구 단체", memberLimit: 500, published: true,
  },
  {
    id: 4, sportName: "축구", type: "PRIVATE", operationStatus: "ACTIVE", accessType: "CLOSED", contentVisibility: "MEMBERS_ONLY",
    displayArea: "CLUB", isVerified: false, joinPolicy: "APPROVAL", reservationPolicy: "MANAGER_ONLY", isCug: true, siGunGuCode: "11650",
    name: "FC강남 서초지점", shortName: "FC강남서초", district: "서울 서초구",
    teamCount: 3, memberCount: 120, pendingMemberCount: 2, parentOrganizationId: 3, parentOrganizationName: "FC강남 본점",
    canHostCompetition: false, autoJoin: false, managerOnlyBooking: true, logoUrl: "https://placehold.co/80x80/E8E8E8/999?text=Logo", phone: "02-4567-8901", website: "",
    description: "FC강남 서초 지점", memberLimit: 200, published: true,
  },
  {
    id: 5, sportName: "축구", type: "PRIVATE", operationStatus: "SUSPENDED", accessType: "CLOSED", contentVisibility: "MEMBERS_ONLY",
    displayArea: "CLUB", isVerified: false, joinPolicy: "APPROVAL", reservationPolicy: "MANAGER_ONLY", isCug: true, siGunGuCode: "11710",
    name: "FC강남 송파지점", shortName: "FC강남송파", district: "서울 송파구",
    teamCount: 2, memberCount: 65, pendingMemberCount: 0, parentOrganizationId: 3, parentOrganizationName: "FC강남 본점",
    canHostCompetition: false, autoJoin: false, managerOnlyBooking: true, logoUrl: "https://placehold.co/80x80/E8E8E8/999?text=Logo", phone: "02-5678-9012", website: "",
    description: "FC강남 송파 지점 (운영중단)", memberLimit: 200, published: false,
  },
  {
    id: 6, sportName: "농구", type: "PUBLIC", operationStatus: "ACTIVE", accessType: "OPEN", contentVisibility: "PUBLIC",
    displayArea: "CITY", isVerified: true, joinPolicy: "OPEN", reservationPolicy: "ALL_MEMBERS", isCug: false, siGunGuCode: "11440",
    name: "서울오픈농구모임", shortName: "서울농구", district: "서울 마포구",
    teamCount: 5, memberCount: 210, pendingMemberCount: 0, parentOrganizationId: null, parentOrganizationName: null,
    canHostCompetition: true, autoJoin: true, managerOnlyBooking: false, logoUrl: "https://placehold.co/80x80/E8E8E8/999?text=Logo", phone: "02-6789-0123", website: "https://seoul-basketball.kr",
    description: "누구나 참여 가능한 농구 동호회", memberLimit: null, published: true,
  },
  {
    id: 7, sportName: "배구", type: "PUBLIC", operationStatus: "ACTIVE", accessType: "OPEN", contentVisibility: "PUBLIC",
    displayArea: "CITY", isVerified: false, joinPolicy: "OPEN", reservationPolicy: "ALL_MEMBERS", isCug: false, siGunGuCode: "26350",
    name: "부산비치발리볼클럽", shortName: "부산배구", district: "부산 해운대구",
    teamCount: 3, memberCount: 95, pendingMemberCount: 0, parentOrganizationId: null, parentOrganizationName: null,
    canHostCompetition: true, autoJoin: true, managerOnlyBooking: false, logoUrl: "https://placehold.co/80x80/E8E8E8/999?text=Logo", phone: "051-1234-5678", website: "",
    description: "부산 해운대 비치발리볼 동호회", memberLimit: 300, published: true,
  },
  {
    id: 8, sportName: "풋살", type: "PRIVATE", operationStatus: "DISSOLVED", accessType: "CLOSED", contentVisibility: "MEMBERS_ONLY",
    displayArea: "CLUB", isVerified: false, joinPolicy: "INVITE_ONLY", reservationPolicy: "MANAGER_ONLY", isCug: true, siGunGuCode: "41130",
    name: "성남풋살동호회", shortName: "성남풋살", district: "경기 성남시",
    teamCount: 0, memberCount: 0, pendingMemberCount: 0, parentOrganizationId: null, parentOrganizationName: null,
    canHostCompetition: false, autoJoin: false, managerOnlyBooking: true, logoUrl: "https://placehold.co/80x80/E8E8E8/999?text=Logo", phone: "031-1234-5678", website: "",
    description: "해체된 풋살 동호회", memberLimit: null, published: false,
  },
  // ── OPEN orgs (City) ──
  {
    id: 9, sportName: "축구", type: "PUBLIC", operationStatus: "ACTIVE", accessType: "OPEN", contentVisibility: "PUBLIC",
    displayArea: "CITY", isVerified: true, joinPolicy: "OPEN", reservationPolicy: "ALL_MEMBERS", isCug: false, siGunGuCode: "11680",
    name: "구민체육관", shortName: "구민체육", district: "서울 강남구",
    teamCount: 12, memberCount: 450, pendingMemberCount: 0, parentOrganizationId: null, parentOrganizationName: null,
    canHostCompetition: true, autoJoin: true, managerOnlyBooking: false, logoUrl: "https://placehold.co/80x80/E8E8E8/999?text=Logo", phone: "02-7890-1234", website: "https://gumin-gym.kr",
    description: "강남구 구민체육관 - 누구나 이용 가능한 공공시설", memberLimit: null, published: true,
  },
  {
    id: 10, sportName: "풋살", type: "PUBLIC", operationStatus: "ACTIVE", accessType: "OPEN", contentVisibility: "PUBLIC",
    displayArea: "CITY", isVerified: true, joinPolicy: "OPEN", reservationPolicy: "ALL_MEMBERS", isCug: false, siGunGuCode: "41110",
    name: "시립풋살장", shortName: "시립풋살", district: "경기 수원시",
    teamCount: 6, memberCount: 180, pendingMemberCount: 0, parentOrganizationId: null, parentOrganizationName: null,
    canHostCompetition: true, autoJoin: true, managerOnlyBooking: false, logoUrl: "https://placehold.co/80x80/E8E8E8/999?text=Logo", phone: "031-2345-6789", website: "https://suwon-futsal.kr",
    description: "수원시 시립 풋살장 - 개방형 공공 시설", memberLimit: null, published: true,
  },
  {
    id: 11, sportName: "야구", type: "PUBLIC", operationStatus: "ACTIVE", accessType: "OPEN", contentVisibility: "PUBLIC",
    displayArea: "CITY", isVerified: false, joinPolicy: "OPEN", reservationPolicy: "ALL_MEMBERS", isCug: false, siGunGuCode: "11710",
    name: "공공야구장", shortName: "공공야구", district: "서울 송파구",
    teamCount: 8, memberCount: 320, pendingMemberCount: 0, parentOrganizationId: null, parentOrganizationName: null,
    canHostCompetition: true, autoJoin: true, managerOnlyBooking: false, logoUrl: "https://placehold.co/80x80/E8E8E8/999?text=Logo", phone: "02-8901-2345", website: "",
    description: "송파구 공공야구장 - 시민 누구나 이용 가능", memberLimit: null, published: true,
  },
  // ── CLOSED orgs (Club) ──
  {
    id: 12, sportName: "축구", type: "PRIVATE", operationStatus: "ACTIVE", accessType: "CLOSED", contentVisibility: "MEMBERS_ONLY",
    displayArea: "CLUB", isVerified: false, joinPolicy: "APPROVAL", reservationPolicy: "MANAGER_ONLY", isCug: false, siGunGuCode: "11440",
    name: "축구 동호회", shortName: "축동", district: "서울 마포구",
    teamCount: 4, memberCount: 85, pendingMemberCount: 3, parentOrganizationId: null, parentOrganizationName: null,
    canHostCompetition: false, autoJoin: false, managerOnlyBooking: true, logoUrl: "https://placehold.co/80x80/E8E8E8/999?text=Logo", phone: "02-9012-3456", website: "",
    description: "마포구 축구 동호회 - 가입 승인 필요", memberLimit: 100, published: true,
  },
  {
    id: 13, sportName: "농구", type: "PRIVATE", operationStatus: "ACTIVE", accessType: "CLOSED", contentVisibility: "MEMBERS_ONLY",
    displayArea: "CLUB", isVerified: false, joinPolicy: "INVITE_ONLY", reservationPolicy: "MANAGER_ONLY", isCug: true, siGunGuCode: "11650",
    name: "사설 아카데미", shortName: "사설아카", district: "서울 서초구",
    teamCount: 6, memberCount: 150, pendingMemberCount: 8, parentOrganizationId: null, parentOrganizationName: null,
    canHostCompetition: false, autoJoin: false, managerOnlyBooking: true, logoUrl: "https://placehold.co/80x80/E8E8E8/999?text=Logo", phone: "02-0123-4567", website: "https://private-academy.kr",
    description: "사설 농구 아카데미 - 등록 회원만 이용", memberLimit: 200, published: true,
  },
  {
    id: 14, sportName: "배구", type: "PRIVATE", operationStatus: "ACTIVE", accessType: "CLOSED", contentVisibility: "MEMBERS_ONLY",
    displayArea: "CLUB", isVerified: false, joinPolicy: "APPROVAL", reservationPolicy: "MANAGER_ONLY", isCug: true, siGunGuCode: "26350",
    name: "엘리트 팀", shortName: "엘리트", district: "부산 해운대구",
    teamCount: 2, memberCount: 40, pendingMemberCount: 1, parentOrganizationId: null, parentOrganizationName: null,
    canHostCompetition: false, autoJoin: false, managerOnlyBooking: true, logoUrl: "https://placehold.co/80x80/E8E8E8/999?text=Logo", phone: "051-2345-6789", website: "",
    description: "부산 엘리트 배구팀 - 선발 회원제 운영", memberLimit: 50, published: true,
  },
];

const MOCK_TEAMS: Team[] = [
  { id: 1, name: "FC강남 A팀", sportName: "축구", district: "서울 강남구", memberCount: 25, status: "ACTIVE", organizationId: 3, organizationName: "FC강남 본점", createdAt: "2024-01-15", description: "FC강남 소속 1군 팀", captainName: "박정호", matchCount: 32, winCount: 18, logoUrl: "https://placehold.co/80x80/E8E8E8/999?text=Logo" },
  { id: 2, name: "FC강남 B팀", sportName: "축구", district: "서울 강남구", memberCount: 22, status: "ACTIVE", organizationId: 3, organizationName: "FC강남 본점", createdAt: "2024-02-20", description: "FC강남 소속 2군 팀", captainName: "김대현", matchCount: 28, winCount: 12, logoUrl: "https://placehold.co/80x80/E8E8E8/999?text=Logo" },
  { id: 3, name: "서울농구 1팀", sportName: "농구", district: "서울 마포구", memberCount: 15, status: "ACTIVE", organizationId: 6, organizationName: "서울오픈농구모임", createdAt: "2024-03-10", description: "서울 마포 농구 동호회 메인팀", captainName: "정태우", matchCount: 20, winCount: 14, logoUrl: "https://placehold.co/80x80/E8E8E8/999?text=Logo" },
  { id: 4, name: "부산배구 메인팀", sportName: "배구", district: "부산 해운대구", memberCount: 12, status: "ACTIVE", organizationId: 7, organizationName: "부산비치발리볼클럽", createdAt: "2024-04-01", description: "부산 해운대 비치발리볼 메인팀", captainName: "임도현", matchCount: 15, winCount: 9, logoUrl: "https://placehold.co/80x80/E8E8E8/999?text=Logo" },
  { id: 5, name: "독립 야구팀", sportName: "야구", district: "서울 송파구", memberCount: 18, status: "ACTIVE", organizationId: null, organizationName: null, createdAt: "2024-05-15", description: "송파 지역 독립 야구팀", captainName: "송유진", matchCount: 22, winCount: 10, logoUrl: "https://placehold.co/80x80/E8E8E8/999?text=Logo" },
  { id: 6, name: "수원 풋살팀", sportName: "풋살", district: "경기 수원시", memberCount: 10, status: "ACTIVE", organizationId: null, organizationName: null, createdAt: "2024-06-01", description: "수원 지역 풋살 동호회", captainName: null, matchCount: 8, winCount: 5, logoUrl: "https://placehold.co/80x80/E8E8E8/999?text=Logo" },
  { id: 7, name: "서초 유소년팀", sportName: "축구", district: "서울 서초구", memberCount: 20, status: "ACTIVE", organizationId: 4, organizationName: "FC강남 서초지점", createdAt: "2024-07-10", description: "서초 유소년 축구팀", captainName: "이한솔", matchCount: 16, winCount: 11, logoUrl: "https://placehold.co/80x80/E8E8E8/999?text=Logo" },
  { id: 8, name: "마포 농구클럽", sportName: "농구", district: "서울 마포구", memberCount: 14, status: "SUSPENDED", organizationId: 6, organizationName: "서울오픈농구모임", createdAt: "2024-08-20", description: "마포 농구 동호회 (운영중단)", captainName: null, matchCount: 10, winCount: 3, logoUrl: "https://placehold.co/80x80/E8E8E8/999?text=Logo" },
];

const MOCK_TEAM_MEMBERS: Record<number, TeamMember[]> = {
  1: [
    { id: 1, name: "박정호", role: "PLAYER", joinedAt: "2024-01-15" },
    { id: 2, name: "최예린", role: "COACH", joinedAt: "2024-01-15" },
    { id: 3, name: "강현우", role: "PLAYER", joinedAt: "2024-02-10" },
    { id: 4, name: "이지훈", role: "PLAYER", joinedAt: "2024-03-05" },
    { id: 5, name: "김태양", role: "MANAGER", joinedAt: "2024-01-15" },
  ],
  2: [
    { id: 6, name: "김대현", role: "PLAYER", joinedAt: "2024-02-20" },
    { id: 7, name: "윤서현", role: "PLAYER", joinedAt: "2024-03-01" },
    { id: 8, name: "오성민", role: "PLAYER", joinedAt: "2024-04-15" },
  ],
  3: [
    { id: 9, name: "정태우", role: "PLAYER", joinedAt: "2024-03-10" },
    { id: 10, name: "한지은", role: "PLAYER", joinedAt: "2024-04-01" },
  ],
};

const MOCK_MEMBERSHIPS: Membership[] = [
  { id: 1, userName: "김민수", userEmail: "minsu@gmail.com", targetType: "ORGANIZATION", targetName: "대한축구협회", targetAccessType: "OPEN", role: "ADMIN", approvalStatus: "APPROVED", joinedAt: "2024-01-10", rejectReason: null, approvedBy: "시스템", approvedAt: "2024-01-10" },
  { id: 2, userName: "이수진", userEmail: "sujin@naver.com", targetType: "ORGANIZATION", targetName: "대한축구협회", targetAccessType: "OPEN", role: "MANAGER", approvalStatus: "APPROVED", joinedAt: "2024-02-15", rejectReason: null, approvedBy: "시스템", approvedAt: "2024-02-15" },
  { id: 3, userName: "박정호", userEmail: "jh.park@gmail.com", targetType: "TEAM", targetName: "FC강남 A팀", targetAccessType: "CLOSED", role: "PLAYER", approvalStatus: "APPROVED", joinedAt: "2024-03-01", rejectReason: null, approvedBy: "김민수", approvedAt: "2024-03-02" },
  { id: 4, userName: "최예린", userEmail: "yerin@icloud.com", targetType: "TEAM", targetName: "FC강남 A팀", targetAccessType: "CLOSED", role: "COACH", approvalStatus: "APPROVED", joinedAt: "2024-03-05", rejectReason: null, approvedBy: "김민수", approvedAt: "2024-03-06" },
  { id: 5, userName: "정태우", userEmail: "taewoo@kakao.com", targetType: "ORGANIZATION", targetName: "축구 동호회", targetAccessType: "CLOSED", role: "MEMBER", approvalStatus: "PENDING", joinedAt: "2025-01-20", rejectReason: null, approvedBy: null, approvedAt: null },
  { id: 6, userName: "한지은", userEmail: "jieun@naver.com", targetType: "TEAM", targetName: "서울농구 1팀", targetAccessType: "OPEN", role: "PLAYER", approvalStatus: "PENDING", joinedAt: "2025-02-01", rejectReason: null, approvedBy: null, approvedAt: null },
  { id: 7, userName: "오성민", userEmail: "sungmin@gmail.com", targetType: "ORGANIZATION", targetName: "FC강남 본점", targetAccessType: "CLOSED", role: "ADMIN", approvalStatus: "APPROVED", joinedAt: "2024-01-15", rejectReason: null, approvedBy: "시스템", approvedAt: "2024-01-15" },
  { id: 8, userName: "윤서현", userEmail: "seohyun@gmail.com", targetType: "TEAM", targetName: "부산배구 메인팀", targetAccessType: "OPEN", role: "PLAYER", approvalStatus: "REJECTED", joinedAt: "2025-03-01", rejectReason: "소속 팀 인원 초과", approvedBy: null, approvedAt: null },
  { id: 9, userName: "임도현", userEmail: "dohyun@kakao.com", targetType: "ORGANIZATION", targetName: "부산비치발리볼클럽", targetAccessType: "OPEN", role: "GUARDIAN", approvalStatus: "APPROVED", joinedAt: "2024-06-10", rejectReason: null, approvedBy: "시스템", approvedAt: "2024-06-10" },
  { id: 10, userName: "송유진", userEmail: "yujin@naver.com", targetType: "TEAM", targetName: "독립 야구팀", targetAccessType: null, role: "PLAYER", approvalStatus: "APPROVED", joinedAt: "2024-07-15", rejectReason: null, approvedBy: "시스템", approvedAt: "2024-07-15" },
  { id: 11, userName: "강현우", userEmail: "hyunwoo@gmail.com", targetType: "ORGANIZATION", targetName: "대한야구소프트볼협회", targetAccessType: "OPEN", role: "MANAGER", approvalStatus: "APPROVED", joinedAt: "2024-04-01", rejectReason: null, approvedBy: "시스템", approvedAt: "2024-04-01" },
  { id: 12, userName: "배수아", userEmail: "sua@naver.com", targetType: "TEAM", targetName: "수원 풋살팀", targetAccessType: null, role: "MEMBER", approvalStatus: "PENDING", joinedAt: "2025-03-10", rejectReason: null, approvedBy: null, approvedAt: null },
  { id: 13, userName: "김태양", userEmail: "taeyang@gmail.com", targetType: "ORGANIZATION", targetName: "사설 아카데미", targetAccessType: "CLOSED", role: "MEMBER", approvalStatus: "PENDING", joinedAt: "2025-03-15", rejectReason: null, approvedBy: null, approvedAt: null },
  { id: 14, userName: "이한솔", userEmail: "hansol@naver.com", targetType: "ORGANIZATION", targetName: "엘리트 팀", targetAccessType: "CLOSED", role: "PLAYER", approvalStatus: "PENDING", joinedAt: "2025-03-18", rejectReason: null, approvedBy: null, approvedAt: null },
  { id: 15, userName: "조현진", userEmail: "hyunjin@kakao.com", targetType: "ORGANIZATION", targetName: "축구 동호회", targetAccessType: "CLOSED", role: "PLAYER", approvalStatus: "PENDING", joinedAt: "2025-03-19", rejectReason: null, approvedBy: null, approvedAt: null },
  { id: 16, userName: "신유나", userEmail: "yuna@gmail.com", targetType: "ORGANIZATION", targetName: "사설 아카데미", targetAccessType: "CLOSED", role: "MEMBER", approvalStatus: "REJECTED", joinedAt: "2025-02-20", rejectReason: "자격 요건 미충족", approvedBy: null, approvedAt: null },
];

// ── Helpers ────────────────────────────────────────────────────────

function delay(ms = 300): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ── Organization APIs ─────────────────────────────────────────────

export async function getOrganizations(
  filters: OrganizationFilter,
  page = 0,
  size = 20
): Promise<PageResponse<Organization>> {
  // Try real API first
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

  const apiResult = await gatewayApi.get<PageResponse<Organization>>(
    "/api/v1/admin/organizations",
    params
  );
  if (apiResult) return apiResult;

  // Mock fallback
  console.warn("[organization-api] Backend unavailable, using mock data");
  await delay();

  let filtered = [...MOCK_ORGANIZATIONS];

  if (filters.type !== "ALL") {
    filtered = filtered.filter((o) => o.type === filters.type);
  }
  if (filters.accessType !== "ALL") {
    filtered = filtered.filter((o) => o.accessType === filters.accessType);
  }
  if (filters.operationStatus !== "ALL") {
    filtered = filtered.filter((o) => o.operationStatus === filters.operationStatus);
  }
  if (filters.sportName && filters.sportName !== "ALL") {
    filtered = filtered.filter((o) => o.sportName === filters.sportName);
  }
  if (filters.district && filters.district !== "ALL") {
    filtered = filtered.filter((o) => o.district === filters.district);
  }
  if (filters.searchKeyword) {
    const kw = filters.searchKeyword.toLowerCase();
    filtered = filtered.filter(
      (o) => o.name.toLowerCase().includes(kw) || o.shortName.toLowerCase().includes(kw)
    );
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

export async function createOrganization(data: OrganizationFormData): Promise<Organization> {
  // Try real API first
  const apiResult = await gatewayApi.post<Organization>("/api/v1/admin/organizations", data);
  if (apiResult) return apiResult;

  // Mock fallback
  console.warn("[organization-api] Backend unavailable, using mock data");
  await delay();
  const newOrg: Organization = {
    id: MOCK_ORGANIZATIONS.length + 1,
    ...data,
    operationStatus: "ACTIVE",
    teamCount: 0,
    memberCount: 0,
    pendingMemberCount: 0,
    parentOrganizationName: data.parentOrganizationId
      ? MOCK_ORGANIZATIONS.find((o) => o.id === data.parentOrganizationId)?.name ?? null
      : null,
  };
  MOCK_ORGANIZATIONS.push(newOrg);
  return newOrg;
}

export async function updateOrganization(id: number, data: OrganizationFormData): Promise<Organization> {
  // Try real API first
  const apiResult = await gatewayApi.put<Organization>(`/api/v1/admin/organizations/${id}`, data);
  if (apiResult) return apiResult;

  // Mock fallback
  console.warn("[organization-api] Backend unavailable, using mock data");
  await delay();
  const idx = MOCK_ORGANIZATIONS.findIndex((o) => o.id === id);
  if (idx === -1) throw new Error("조직을 찾을 수 없습니다.");
  const updated: Organization = {
    ...MOCK_ORGANIZATIONS[idx],
    ...data,
    parentOrganizationName: data.parentOrganizationId
      ? MOCK_ORGANIZATIONS.find((o) => o.id === data.parentOrganizationId)?.name ?? null
      : null,
  };
  MOCK_ORGANIZATIONS[idx] = updated;
  return updated;
}

export function getOrganizationTreeData(): { id: string; label: string; children?: { id: string; label: string }[] }[] {
  const roots = MOCK_ORGANIZATIONS.filter((o) => o.parentOrganizationId === null);
  return roots.map((root) => {
    const branches = MOCK_ORGANIZATIONS.filter((o) => o.parentOrganizationId === root.id);
    return {
      id: String(root.id),
      label: `${root.name} (${ORG_TYPE_LABELS[root.type]})`,
      ...(branches.length > 0
        ? {
            children: branches.map((b) => ({
              id: String(b.id),
              label: `${b.name} (${ORG_TYPE_LABELS[b.type]})`,
            })),
          }
        : {}),
    };
  });
}

export function getOrganizationOptions(): { value: string; label: string }[] {
  return MOCK_ORGANIZATIONS.map((o) => ({
    value: String(o.id),
    label: o.name,
  }));
}

export function getHeadquarterOptions(): { value: string; label: string }[] {
  return MOCK_ORGANIZATIONS
    .filter((o) => o.type === "PRIVATE" && o.parentOrganizationId === null)
    .map((o) => ({ value: String(o.id), label: o.name }));
}

// ── Team APIs ─────────────────────────────────────────────────────

export async function getTeams(
  filters: TeamFilter,
  page = 0,
  size = 20
): Promise<PageResponse<Team>> {
  // Try real API first
  const params: Record<string, string> = {
    page: String(page),
    size: String(size),
  };
  if (filters.organizationId && filters.organizationId !== "ALL") params.organizationId = filters.organizationId;
  if (filters.sportName && filters.sportName !== "ALL") params.sportName = filters.sportName;
  if (filters.status !== "ALL") params.status = filters.status;
  if (filters.searchKeyword) params.searchKeyword = filters.searchKeyword;

  const apiResult = await gatewayApi.get<PageResponse<Team>>(
    "/api/v1/admin/teams",
    params
  );
  if (apiResult) return apiResult;

  // Mock fallback
  console.warn("[organization-api] Backend unavailable, using mock data");
  await delay();

  let filtered = [...MOCK_TEAMS];

  if (filters.organizationId && filters.organizationId !== "ALL") {
    filtered = filtered.filter((t) => String(t.organizationId) === filters.organizationId);
  }
  if (filters.sportName && filters.sportName !== "ALL") {
    filtered = filtered.filter((t) => t.sportName === filters.sportName);
  }
  if (filters.status !== "ALL") {
    filtered = filtered.filter((t) => t.status === filters.status);
  }
  if (filters.searchKeyword) {
    const kw = filters.searchKeyword.toLowerCase();
    filtered = filtered.filter((t) => t.name.toLowerCase().includes(kw));
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

export async function createTeam(data: TeamFormData): Promise<Team> {
  // Try real API first
  const apiResult = await gatewayApi.post<Team>("/api/v1/admin/teams", data);
  if (apiResult) return apiResult;

  // Mock fallback
  console.warn("[organization-api] Backend unavailable, using mock data");
  await delay();
  const org = data.organizationId
    ? MOCK_ORGANIZATIONS.find((o) => o.id === data.organizationId)
    : null;
  const newTeam: Team = {
    id: MOCK_TEAMS.length + 1,
    ...data,
    memberCount: 0,
    organizationName: org?.name ?? null,
    createdAt: new Date().toISOString().slice(0, 10),
    description: "",
    captainName: null,
    matchCount: 0,
    winCount: 0,
  };
  MOCK_TEAMS.push(newTeam);
  return newTeam;
}

export async function updateTeam(id: number, data: TeamFormData): Promise<Team> {
  // Try real API first
  const apiResult = await gatewayApi.put<Team>(`/api/v1/admin/teams/${id}`, data);
  if (apiResult) return apiResult;

  // Mock fallback
  console.warn("[organization-api] Backend unavailable, using mock data");
  await delay();
  const idx = MOCK_TEAMS.findIndex((t) => t.id === id);
  if (idx === -1) throw new Error("팀을 찾을 수 없습니다.");
  const org = data.organizationId
    ? MOCK_ORGANIZATIONS.find((o) => o.id === data.organizationId)
    : null;
  const updated: Team = {
    ...MOCK_TEAMS[idx],
    ...data,
    organizationName: org?.name ?? null,
  };
  MOCK_TEAMS[idx] = updated;
  return updated;
}

// ── Membership APIs ───────────────────────────────────────────────

export async function getMemberships(
  filters: MembershipFilter,
  page = 0,
  size = 20
): Promise<PageResponse<Membership>> {
  // Try real API first
  const params: Record<string, string> = {
    page: String(page),
    size: String(size),
  };
  if (filters.targetType !== "ALL") params.targetType = filters.targetType;
  if (filters.role !== "ALL") params.role = filters.role;
  if (filters.approvalStatus !== "ALL") params.approvalStatus = filters.approvalStatus;
  if (filters.searchKeyword) params.searchKeyword = filters.searchKeyword;

  const apiResult = await gatewayApi.get<PageResponse<Membership>>(
    "/api/v1/admin/memberships",
    params
  );
  if (apiResult) return apiResult;

  // Mock fallback
  console.warn("[organization-api] Backend unavailable, using mock data");
  await delay();

  let filtered = [...MOCK_MEMBERSHIPS];

  if (filters.targetType !== "ALL") {
    filtered = filtered.filter((m) => m.targetType === filters.targetType);
  }
  if (filters.role !== "ALL") {
    filtered = filtered.filter((m) => m.role === filters.role);
  }
  if (filters.approvalStatus !== "ALL") {
    filtered = filtered.filter((m) => m.approvalStatus === filters.approvalStatus);
  }
  if (filters.searchKeyword) {
    const kw = filters.searchKeyword.toLowerCase();
    filtered = filtered.filter((m) => m.userName.toLowerCase().includes(kw));
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

export async function approveMembership(id: number): Promise<void> {
  // Try real API first
  const apiResult = await gatewayApi.put(`/api/v1/admin/memberships/${id}/approve`);
  if (apiResult !== null) return;

  // Mock fallback
  console.warn("[organization-api] Backend unavailable, using mock data");
  await delay();
  const m = MOCK_MEMBERSHIPS.find((m) => m.id === id);
  if (m) {
    m.approvalStatus = "APPROVED";
    m.approvedBy = "관리자";
    m.approvedAt = new Date().toISOString().slice(0, 10);
  }
}

export async function rejectMembership(id: number): Promise<void> {
  // Try real API first
  const apiResult = await gatewayApi.put(`/api/v1/admin/memberships/${id}/reject`);
  if (apiResult !== null) return;

  // Mock fallback
  console.warn("[organization-api] Backend unavailable, using mock data");
  await delay();
  const m = MOCK_MEMBERSHIPS.find((m) => m.id === id);
  if (m) m.approvalStatus = "REJECTED";
}

export async function changeMembershipRole(id: number, role: MembershipRole): Promise<void> {
  // Try real API first
  const apiResult = await gatewayApi.put(`/api/v1/admin/memberships/${id}/role`, { role });
  if (apiResult !== null) return;

  // Mock fallback
  console.warn("[organization-api] Backend unavailable, using mock data");
  await delay();
  const m = MOCK_MEMBERSHIPS.find((m) => m.id === id);
  if (m) m.role = role;
}

export async function rejectMembershipWithReason(id: number, reason: string): Promise<void> {
  // Try real API first
  const apiResult = await gatewayApi.put(`/api/v1/admin/memberships/${id}/reject`, { reason });
  if (apiResult !== null) return;

  // Mock fallback
  console.warn("[organization-api] Backend unavailable, using mock data");
  await delay();
  const m = MOCK_MEMBERSHIPS.find((m) => m.id === id);
  if (m) {
    m.approvalStatus = "REJECTED";
    m.rejectReason = reason;
  }
}

// ── Organization Detail API ────────────────────────────────────────

export async function getOrganizationById(id: number): Promise<Organization | null> {
  // Try real API first
  const apiResult = await gatewayApi.get<Organization>(`/api/v1/admin/organizations/${id}`);
  if (apiResult) return apiResult;

  // Mock fallback
  console.warn("[organization-api] Backend unavailable, using mock data");
  await delay();
  return MOCK_ORGANIZATIONS.find((o) => o.id === id) ?? null;
}

export function getSubOrganizations(parentId: number): Organization[] {
  return MOCK_ORGANIZATIONS.filter((o) => o.parentOrganizationId === parentId);
}

// ── Team Detail APIs ───────────────────────────────────────────────

export async function getTeamById(id: number): Promise<Team | null> {
  // Try real API first
  const apiResult = await gatewayApi.get<Team>(`/api/v1/admin/teams/${id}`);
  if (apiResult) return apiResult;

  // Mock fallback
  console.warn("[organization-api] Backend unavailable, using mock data");
  await delay();
  return MOCK_TEAMS.find((t) => t.id === id) ?? null;
}

export async function getTeamMembers(teamId: number): Promise<TeamMember[]> {
  await delay();
  return MOCK_TEAM_MEMBERS[teamId] ?? [];
}

export async function getOrganizationMembers(orgName: string): Promise<Membership[]> {
  await delay();
  return MOCK_MEMBERSHIPS.filter(
    (m) => m.targetType === "ORGANIZATION" && m.targetName === orgName
  );
}
