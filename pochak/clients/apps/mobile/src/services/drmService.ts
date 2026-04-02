/**
 * DRM service - extensible for Widevine/FairPlay.
 * Current: stub returning unprotected streams.
 * Migration: Replace with actual DRM license server integration.
 *
 * Widevine (Android): Use ExoPlayer's DefaultDrmSessionManager
 * FairPlay (iOS):     Use AVContentKeySession with FPS certificate
 *
 * TODO: Integrate with pochak-content service's /api/v1/drm/license endpoint
 * TODO: Add certificate pinning for license server communication
 */

// ── Types ──────────────────────────────────────────────────

export type DrmType = 'widevine' | 'fairplay' | 'none';

export interface DrmConfig {
  type: DrmType;
  licenseUrl?: string;
  certificateUrl?: string;
  headers?: Record<string, string>;
}

export interface IDrmService {
  /**
   * Get DRM configuration for a given content.
   * Returns null if content is freely available (no DRM).
   */
  getDrmConfig(contentId: string): Promise<DrmConfig | null>;

  /**
   * Acquire a DRM license from the license server.
   * @param licenseUrl - The license server URL
   * @param challenge - The DRM challenge bytes from the player
   * @returns The license response bytes
   */
  acquireLicense(licenseUrl: string, challenge: Uint8Array): Promise<Uint8Array>;
}

// ── Stub Implementation ────────────────────────────────────

class StubDrmService implements IDrmService {
  async getDrmConfig(contentId: string): Promise<DrmConfig | null> {
    console.log(`[DrmService] getDrmConfig() called (stub) contentId=${contentId}`);
    // Stub: all content is unprotected
    return { type: 'none' };
  }

  async acquireLicense(licenseUrl: string, challenge: Uint8Array): Promise<Uint8Array> {
    console.log(
      `[DrmService] acquireLicense() called (stub) url=${licenseUrl} challengeSize=${challenge.byteLength}`
    );
    // Stub: return empty license (no-op)
    // In production, this would POST the challenge to the license server
    // and return the license response bytes.
    return new Uint8Array(0);
  }
}

// ── Singleton Export ───────────────────────────────────────

export const drmService: IDrmService = new StubDrmService();
export default drmService;
