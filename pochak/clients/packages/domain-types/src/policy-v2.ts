/**
 * Policy v2 Types
 * ─────────────────────────────────────────────────────────────────────────────
 * Organization, Competition, Community, Membership types for Pochak Policy v2.
 */

// === Organization ===

export type DisplayArea = 'CITY' | 'CLUB';
export type JoinPolicy = 'OPEN' | 'APPROVAL' | 'INVITE_ONLY';
export type ReservationPolicy = 'ALL_MEMBERS' | 'MANAGER_ONLY';
export type ContentVisibility = 'PUBLIC' | 'MEMBERS_ONLY' | 'TEAM_ONLY' | 'PRIVATE';

export interface PochakOrganization {
  id: number;
  parentId?: number;
  name: string;
  nameEn?: string;
  description?: string;
  sportId?: number;
  displayArea: DisplayArea;
  isVerified: boolean;
  isCug: boolean;
  joinPolicy: JoinPolicy;
  reservationPolicy: ReservationPolicy;
  canHostCompetition: boolean;
  defaultContentVisibility: ContentVisibility;
  siGunGuCode?: string;
  logoUrl?: string;
  active: boolean;
}

// === Competition ===

export type CompetitionVisibility = 'PUBLIC' | 'PRIVATE';

export interface PochakCompetitionV2 {
  id: number;
  name: string;
  sportId?: number;
  visibility: CompetitionVisibility;
  inviteCode?: string;
  status: 'SCHEDULED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
  startDate: string;
  endDate: string;
}

// === Community ===

export type CommunityPostType = 'NEWS' | 'RECRUITING' | 'RECRUITMENT' | 'FREE';

export interface PochakCommunityPost {
  id: number;
  organizationId?: number;
  authorUserId: number;
  postType: CommunityPostType;
  title: string;
  body?: string;
  imageUrls?: string[];
  siGunGuCode?: string;
  isPinned: boolean;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  createdAt: string;
}

// === Membership ===

export type MembershipRole = 'ADMIN' | 'MANAGER' | 'COACH' | 'PLAYER' | 'GUARDIAN' | 'MEMBER';

export interface PochakMembership {
  id: number;
  userId: number;
  organizationId: number;
  role: MembershipRole;
  joinPolicy: JoinPolicy;
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
}
