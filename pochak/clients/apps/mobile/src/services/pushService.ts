/**
 * Push notification service - extensible for FCM/APNs.
 * Current: stub that logs to console.
 * Migration: Replace with expo-notifications + FCM/APNs setup.
 *
 * TODO: Install expo-notifications:
 *   npx expo install expo-notifications
 *   npx expo install expo-device
 *
 * TODO: Configure FCM (Android) and APNs (iOS) in app.json/eas.json
 */

// ── Types ──────────────────────────────────────────────────

export type PushNotificationType =
  | 'MATCH_START'
  | 'MATCH_REMINDER'
  | 'CLIP_READY'
  | 'PROMOTION'
  | 'SYSTEM';

export interface PushNotification {
  id: string;
  title: string;
  body: string;
  data?: Record<string, string>;
  type: PushNotificationType;
}

export interface IPushService {
  requestPermission(): Promise<boolean>;
  getToken(): Promise<string | null>;
  registerToken(userId: string, token: string): Promise<void>;
  onNotificationReceived(handler: (notification: PushNotification) => void): () => void;
}

// ── Stub Implementation ────────────────────────────────────

type NotificationHandler = (notification: PushNotification) => void;

class StubPushService implements IPushService {
  private handlers: NotificationHandler[] = [];

  async requestPermission(): Promise<boolean> {
    console.log('[PushService] requestPermission() called (stub - always returns true)');
    return true;
  }

  async getToken(): Promise<string | null> {
    console.log('[PushService] getToken() called (stub - returning mock token)');
    return 'stub-push-token-' + Date.now();
  }

  async registerToken(userId: string, token: string): Promise<void> {
    console.log(`[PushService] registerToken() called (stub) userId=${userId} token=${token}`);
    // TODO: POST to /api/v1/users/${userId}/push-token with { token, platform }
  }

  onNotificationReceived(handler: NotificationHandler): () => void {
    console.log('[PushService] onNotificationReceived() registered (stub)');
    this.handlers.push(handler);
    // Return unsubscribe function
    return () => {
      this.handlers = this.handlers.filter((h) => h !== handler);
    };
  }

  /**
   * Simulate receiving a push notification (for dev/testing only).
   */
  simulateNotification(notification: PushNotification): void {
    console.log('[PushService] Simulating notification:', notification);
    this.handlers.forEach((h) => h(notification));
  }
}

// ── Singleton Export ───────────────────────────────────────

export const pushService: IPushService = new StubPushService();
export default pushService;
