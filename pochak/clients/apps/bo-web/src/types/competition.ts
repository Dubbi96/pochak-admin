export type CompetitionType = "TOURNAMENT" | "LEAGUE";

export type CompetitionStatus = "UPCOMING" | "IN_PROGRESS" | "FINISHED";

export type CompetitionVisibility = "PUBLIC" | "PRIVATE";

export interface Competition {
  id: number;
  name: string;
  shortName: string;
  type: CompetitionType;
  sportCode: string;
  sportName: string;
  status: CompetitionStatus;
  visibility: CompetitionVisibility;
  startDate: string;
  endDate: string;
  description: string;
  price: number;
  isFree: boolean;
  isActive: boolean;
  websiteUrl: string;
  eligibility: string;
  rules: string;
  videoCount: number;
  clipCount: number;
  createdBy: string;
  createdAt: string;
  inviteUrl?: string;
}

export interface CompetitionFilter {
  isActive?: boolean | null;
  status?: CompetitionStatus | null;
  sportCode?: string | null;
  searchType?: "ALL" | "TOURNAMENT" | "LEAGUE";
  keyword?: string;
}

export interface CompetitionCreateRequest {
  name: string;
  shortName?: string;
  type: CompetitionType;
  sportCode: string;
  startDate: string;
  endDate: string;
  description?: string;
  price: number;
  isFree: boolean;
  isActive: boolean;
  websiteUrl?: string;
  eligibility?: string;
  rules?: string;
  visibility?: CompetitionVisibility;
}

export interface CompetitionUpdateRequest extends CompetitionCreateRequest {
  id: number;
}
