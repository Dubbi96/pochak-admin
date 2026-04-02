import type { OwnerType } from "./venue";

export type AssetVisibility = "PUBLIC" | "PRIVATE" | "MEMBERS_ONLY" | "SPECIFIC";
export type EncodingStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
export type ContentType = "LIVE" | "VOD";
export type ClipType =
  | "TEAM"
  | "ASSOCIATION"
  | "ORG_OPEN"
  | "ORG_CLOSED_HQ"
  | "ORG_CLOSED_BRANCH"
  | "PERSONAL"
  | "AFFILIATED";

export interface LiveAsset {
  id: number;
  organizationName: string | null;
  branchName: string | null;
  venueName: string;
  matchName: string;
  startTime: string;
  endTime: string;
  contentType: "LIVE";
  visibility: AssetVisibility;
  ownerType: OwnerType;
  venueId: number;
  sportId: number | null;
  sportName: string | null;
  streamUrl: string | null;
  panoramaUrl: string | null;
  thumbnailUrl: string | null;
  description: string | null;
  price: number;
  createdAt: string;
}

export interface VodAsset {
  id: number;
  organizationName: string | null;
  branchName: string | null;
  venueName: string;
  matchName: string;
  startTime: string;
  endTime: string;
  contentType: "VOD";
  visibility: AssetVisibility;
  encodingStatus: EncodingStatus;
  ownerType: OwnerType;
  venueId: number;
  sportId: number | null;
  sportName: string | null;
  vodUrl: string | null;
  panoramaUrl: string | null;
  thumbnailUrl: string | null;
  description: string | null;
  price: number;
  linkedLiveId: number | null;
  createdAt: string;
}

export interface ClipAsset {
  id: number;
  clipName: string;
  sportName: string;
  matchName: string;
  clipType: ClipType;
  viewCount: number;
  visibility: AssetVisibility;
  createdAt: string;
}

export interface AssetTag {
  id: number;
  matchName: string;
  contentType: ContentType;
  tournamentName: string;
  homeTeam: string;
  awayTeam: string;
  createdAt: string;
  tags: TagItem[];
}

export interface TagItem {
  id: number;
  label: string;
  time: string;
  team: "HOME" | "AWAY" | "NONE";
}

export interface ContentFilter {
  ownerType?: OwnerType | null;
  venueId?: number | null;
  dateFrom?: string;
  dateTo?: string;
  visibility?: AssetVisibility | null;
}

export interface ClipFilter {
  matchName?: string;
  clipType?: ClipType | null;
  sportId?: number | null;
  clipName?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface TagFilter {
  tournamentId?: number | null;
  contentType?: ContentType | null;
  matchName?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface LiveCreateRequest {
  ownerType: OwnerType;
  organizationId?: number;
  branchId?: number;
  venueId: number;
  price: number;
  matchName: string;
  startTime: string;
  endTime: string;
  description?: string;
  sportId?: number;
  streamUrl?: string;
  panoramaUrl?: string;
  thumbnailUrl?: string;
  visibility: AssetVisibility;
  specificUserIds?: string[];
}

export interface VodCreateRequest {
  ownerType: OwnerType;
  organizationId?: number;
  branchId?: number;
  venueId: number;
  price: number;
  matchName: string;
  startTime: string;
  endTime: string;
  description?: string;
  sportId?: number;
  vodUrl?: string;
  panoramaUrl?: string;
  thumbnailUrl?: string;
  visibility: AssetVisibility;
  specificUserIds?: string[];
  linkedLiveId?: number;
}
