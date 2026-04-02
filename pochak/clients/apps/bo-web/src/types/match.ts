export type MatchStatus = "SCHEDULED" | "LIVE" | "CANCELLED" | "FINISHED" | "CLOSED";

export type LinkStatus = "LINKED" | "UNLINKED";

export interface MatchParticipant {
  teamId: number;
  teamName: string;
  score: number | null;
}

export interface Match {
  id: number;
  competitionId: number;
  competitionName: string;
  sportCode: string;
  sportName: string;
  name: string;
  venueName: string;
  startTime: string;
  endTime: string;
  status: MatchStatus;
  isActive: boolean;
  linkStatus: LinkStatus;
  homeTeam: MatchParticipant;
  awayTeam: MatchParticipant;
  hasPanorama: boolean;
  hasScoreboard: boolean;
  createdBy: string;
  createdAt: string;
}

export interface MatchFilter {
  dateFrom?: string;
  dateTo?: string;
  sportCode?: string | null;
  competitionId?: number | null;
  status?: MatchStatus | null;
  isActive?: boolean | null;
  linkStatus?: LinkStatus | null;
  competitionKeyword?: string;
  cardKeyword?: string;
}

export interface MatchCreateRequest {
  competitionId: number;
  name: string;
  venueName: string;
  sportCode: string;
  startTime: string;
  endTime: string;
  homeTeamId: number;
  awayTeamId: number;
  hasPanorama: boolean;
  hasScoreboard: boolean;
  isActive: boolean;
}

export interface MatchUpdateRequest extends MatchCreateRequest {
  id: number;
}
