/**
 * Match reservation store — localStorage-backed.
 * Tracks which matches the user has set 예약알림 for.
 * When a match goes LIVE, the backend should send a push notification to reserved users.
 */

const STORAGE_KEY = 'pochak_reservations';

export interface ReservedMatch {
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  date: string;
  time: string;
  competition?: string;
  reservedAt: string;
}

function loadReservations(): ReservedMatch[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveReservations(reservations: ReservedMatch[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reservations));
}

export function getReservations(): ReservedMatch[] {
  return loadReservations();
}

export function isReserved(matchId: string): boolean {
  return loadReservations().some((r) => r.matchId === matchId);
}

export function addReservation(match: Omit<ReservedMatch, 'reservedAt'>): void {
  const reservations = loadReservations();
  if (reservations.some((r) => r.matchId === match.matchId)) return;
  reservations.push({ ...match, reservedAt: new Date().toISOString() });
  saveReservations(reservations);
  window.dispatchEvent(new Event('pochak_reservation_change'));
}

export function removeReservation(matchId: string): void {
  const reservations = loadReservations().filter((r) => r.matchId !== matchId);
  saveReservations(reservations);
  window.dispatchEvent(new Event('pochak_reservation_change'));
}

export function toggleReservation(match: Omit<ReservedMatch, 'reservedAt'>): boolean {
  if (isReserved(match.matchId)) {
    removeReservation(match.matchId);
    return false;
  }
  addReservation(match);
  return true;
}
