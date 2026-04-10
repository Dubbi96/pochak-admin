/**
 * Notification Service
 *
 * Handles:
 * 1. Web Push Notification (browser permission + subscription)
 * 2. Reservation notification when LIVE starts
 * 3. Per-user personalized notifications via backend API
 *
 * Flow:
 * - User clicks 예약알림 on a match → reservationStore saves locally + calls backend API
 * - Backend (pochak-content-service) tracks reservations per user
 * - When a filming reservation starts broadcasting (BO triggers LIVE),
 *   the backend sends push notifications to all users who reserved that match
 * - VOD link is automatically attached when LIVE ends and VOD file is processed
 */

import { fetchApi, postApi, deleteApi } from './apiClient';

// ─── Web Push Permission ────────────────────────────────────

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.warn('[Notification] Browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;

  const result = await Notification.requestPermission();
  return result === 'granted';
}

export function showLocalNotification(title: string, body: string, options?: NotificationOptions) {
  if (Notification.permission !== 'granted') return;

  new Notification(title, {
    body,
    icon: '/pochak-logo.png',
    badge: '/pochak-logo.png',
    ...options,
  });
}

// ─── Backend API: Match Reservation ──────────────────────────

export interface MatchReservation {
  matchId: string;
  userId: string;
  homeTeam: string;
  awayTeam: string;
  scheduledAt: string;
  competition?: string;
  status: 'RESERVED' | 'NOTIFIED' | 'CANCELLED';
}

/**
 * Reserve notification for a match.
 * Backend will send push when LIVE starts.
 */
export async function reserveMatchNotification(matchId: string): Promise<boolean> {
  const result = await postApi<{ success: boolean }>(
    `/contents/matches/${matchId}/reserve`,
    {},
  );
  return result?.success ?? false;
}

/**
 * Cancel reservation for a match.
 */
export async function cancelMatchReservation(matchId: string): Promise<boolean> {
  const result = await deleteApi<{ success: boolean }>(
    `/contents/matches/${matchId}/reserve`,
  );
  return result?.success ?? false;
}

/**
 * Get all reservations for current user.
 */
export async function getMyReservations(): Promise<MatchReservation[]> {
  const result = await fetchApi<MatchReservation[]>('/users/me/reservations');
  return result ?? [];
}

// ─── Backend API: Push Subscription ──────────────────────────

/**
 * Register web push subscription with backend.
 * Called after user grants notification permission.
 */
export async function registerPushSubscription(subscription: PushSubscription): Promise<void> {
  await postApi('/users/me/push-subscription', {
    endpoint: subscription.endpoint,
    keys: {
      p256dh: arrayBufferToBase64(subscription.getKey('p256dh')),
      auth: arrayBufferToBase64(subscription.getKey('auth')),
    },
    platform: 'web',
  }, {});
}

function arrayBufferToBase64(buffer: ArrayBuffer | null): string {
  if (!buffer) return '';
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// ─── VOD Auto-link ──────────────────────────────────────────

/**
 * When LIVE broadcast ends, the backend automatically:
 * 1. Processes the recording into VOD
 * 2. Creates a VOD content entry with the stream URL
 * 3. Updates the match status to '종료' with contentId pointing to the VOD
 * 4. The MatchListItem automatically shows "다시보기" button linked to the VOD
 *
 * This is handled by:
 * - pochak-content-service: LiveBroadcastEndListener
 * - pochak-operation-service: VOD processing pipeline
 * - Content API: GET /contents/matches/{matchId} returns updated status + contentId
 */

// ─── Polling for LIVE status changes ─────────────────────────

/**
 * Check if any reserved matches have gone LIVE.
 * Called periodically to show browser notifications.
 */
export async function checkReservedMatchesStatus(reservedMatchIds: string[]): Promise<{
  matchId: string;
  status: 'LIVE' | '예정' | '종료';
  contentId?: string;
}[]> {
  if (reservedMatchIds.length === 0) return [];

  const result = await fetchApi<{ matchId: string; status: 'LIVE' | '예정' | '종료'; contentId?: string }[]>(
    `/contents/matches/status?ids=${reservedMatchIds.join(',')}`,
  );
  return result ?? [];
}
