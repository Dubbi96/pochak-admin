export interface Sport {
  id: string;
  name: string;
  code: string;
  iconUrl?: string;
  sortOrder: number;
}

export interface Team {
  id: string;
  name: string;
  shortName: string;
  logoUrl?: string;
  sportId: string;
  competitionIds: string[];
}

export interface Competition {
  id: string;
  name: string;
  sportId: string;
  season: string;
  logoUrl?: string;
  startDate: string;
  endDate: string;
}

export type MatchStatus =
  | "SCHEDULED"
  | "LIVE"
  | "HALF_TIME"
  | "FINISHED"
  | "POSTPONED"
  | "CANCELLED";

export interface Match {
  id: string;
  competitionId: string;
  homeTeam: Team;
  awayTeam: Team;
  status: MatchStatus;
  scheduledAt: string;
  homeScore?: number;
  awayScore?: number;
  venue?: string;
  round?: string;
}

export type ContentCategory = "HIGHLIGHT" | "INTERVIEW" | "ANALYSIS" | "BEHIND" | "RECAP";

export type ContentStatus = "DRAFT" | "PROCESSING" | "LIVE" | "ARCHIVED" | "DELETED";

export interface LiveAsset {
  id: string;
  matchId: string;
  title: string;
  streamUrl: string;
  thumbnailUrl?: string;
  status: ContentStatus;
  startedAt: string;
  viewerCount: number;
}

export interface VodAsset {
  id: string;
  title: string;
  description?: string;
  category: ContentCategory;
  thumbnailUrl?: string;
  videoUrl: string;
  durationSeconds: number;
  status: ContentStatus;
  matchId?: string;
  publishedAt: string;
  viewCount: number;
}

export interface ClipAsset {
  id: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  videoUrl: string;
  durationSeconds: number;
  status: ContentStatus;
  sourceVodId?: string;
  matchId?: string;
  startOffsetSeconds?: number;
  tags: string[];
  createdAt: string;
  viewCount: number;
  likeCount: number;
}
