/**
 * Analytics event tracking service.
 * Current: logs to console + stores in local buffer.
 * Migration: Replace with Mixpanel/Amplitude/Firebase Analytics.
 */

export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, string | number | boolean>;
  timestamp: string;
  userId?: string;
  sessionId: string;
}

export interface IAnalyticsService {
  track(name: string, properties?: Record<string, string | number | boolean>): void;
  trackPageView(screenName: string): void;
  trackContentPlay(contentId: string, contentType: string, duration?: number): void;
  trackContentComplete(contentId: string, watchedSeconds: number, totalSeconds: number): void;
  trackClipCreate(clipId: string, sourceContentId: string): void;
  trackPurchase(productId: string, amount: number, method: string): void;
  trackSearch(query: string, resultCount: number): void;
  trackShare(contentId: string, platform: string): void;
  setUserId(userId: string): void;
  flush(): Promise<void>;
}

const MAX_BUFFER_SIZE = 100;
const IS_DEV = __DEV__;

// Simple random session id generator
function generateSessionId(): string {
  return `sess_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

class AnalyticsService implements IAnalyticsService {
  private buffer: AnalyticsEvent[] = [];
  private userId: string | undefined;
  private sessionId: string;

  constructor() {
    this.sessionId = generateSessionId();
  }

  track(name: string, properties?: Record<string, string | number | boolean>): void {
    const event: AnalyticsEvent = {
      name,
      properties,
      timestamp: new Date().toISOString(),
      userId: this.userId,
      sessionId: this.sessionId,
    };

    this.buffer.push(event);

    if (IS_DEV) {
      console.log('[Analytics]', name, properties ?? '');
    }

    if (this.buffer.length >= MAX_BUFFER_SIZE) {
      this.flush();
    }
  }

  trackPageView(screenName: string): void {
    this.track('page_view', {screen: screenName});
  }

  trackContentPlay(contentId: string, contentType: string, duration?: number): void {
    this.track('content_play', {
      contentId,
      contentType,
      ...(duration !== undefined && {duration}),
    });
  }

  trackContentComplete(contentId: string, watchedSeconds: number, totalSeconds: number): void {
    const completionRate = totalSeconds > 0 ? Math.round((watchedSeconds / totalSeconds) * 100) : 0;
    this.track('content_complete', {
      contentId,
      watchedSeconds,
      totalSeconds,
      completionRate,
    });
  }

  trackClipCreate(clipId: string, sourceContentId: string): void {
    this.track('clip_create', {clipId, sourceContentId});
  }

  trackPurchase(productId: string, amount: number, method: string): void {
    this.track('purchase', {productId, amount, method});
  }

  trackSearch(query: string, resultCount: number): void {
    this.track('search', {query, resultCount});
  }

  trackShare(contentId: string, platform: string): void {
    this.track('share', {contentId, platform});
  }

  setUserId(userId: string): void {
    this.userId = userId;
  }

  async flush(): Promise<void> {
    if (this.buffer.length === 0) return;

    const eventsToFlush = [...this.buffer];
    this.buffer = [];

    if (IS_DEV) {
      console.log(`[Analytics] Flushing ${eventsToFlush.length} events`);
    }

    // TODO: POST to analytics backend when available
    // try {
    //   await fetch(`${API_BASE_URL}/admin/api/v1/analytics/events`, {
    //     method: 'POST',
    //     headers: {'Content-Type': 'application/json'},
    //     body: JSON.stringify({events: eventsToFlush}),
    //   });
    // } catch (err) {
    //   // Re-add events on failure for retry
    //   this.buffer = [...eventsToFlush, ...this.buffer].slice(0, MAX_BUFFER_SIZE);
    //   if (IS_DEV) {
    //     console.warn('[Analytics] Flush failed, events re-buffered', err);
    //   }
    // }
  }
}

export const analyticsService = new AnalyticsService();
