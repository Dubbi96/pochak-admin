const WEB_BASE = 'https://pochak.co.kr';

export function getContentShareUrl(contentType: string, contentId: string): string {
  return `${WEB_BASE}/content/${contentType}/${contentId}`;
}

export function getClipShareUrl(clipId: string): string {
  return `${WEB_BASE}/clip/${clipId}`;
}

export function getCompetitionShareUrl(competitionId: string): string {
  return `${WEB_BASE}/competition/${competitionId}`;
}

export function getClubShareUrl(clubId: string): string {
  return `${WEB_BASE}/club/${clubId}`;
}
