/**
 * Service factory that provides mock or real API implementation.
 * Toggle via environment variable or feature flag.
 * This enables gradual migration from mock to real APIs.
 *
 * Usage:
 *   const vodService = createService(
 *     { list: mockGetVodAssets },
 *     () => ({ list: realGetVodAssets }),
 *     process.env.NEXT_PUBLIC_USE_REAL_API === 'true'
 *   );
 *
 * Migration path:
 *   1. Start with featureFlag = false (mock only)
 *   2. Set NEXT_PUBLIC_USE_REAL_API=true to switch to real backend
 *   3. Once stable, remove mock code entirely
 */

/** Whether to prefer real API over mocks (controlled by env var) */
export const USE_REAL_API =
  typeof process !== "undefined" &&
  process.env?.NEXT_PUBLIC_USE_REAL_API === "true";

/**
 * Create a service that can switch between mock and real implementations.
 *
 * @param mockImpl - The mock implementation (always available)
 * @param realImplFactory - Factory that returns real implementation, or null if unavailable
 * @param featureFlag - Whether to try real implementation first (defaults to USE_REAL_API)
 * @returns Either mock or real implementation
 */
export function createService<T>(
  mockImpl: T,
  realImplFactory: () => T | null,
  featureFlag: boolean = USE_REAL_API
): T {
  if (featureFlag) {
    const real = realImplFactory();
    if (real) return real;
  }
  return mockImpl;
}

/**
 * Utility: run an async API call, fall back to mock result on failure.
 * Use this inline in components for gradual API migration.
 *
 * @param apiFn - The real API call (may throw or return null)
 * @param mockFn - The mock fallback
 * @returns The result from real API or mock
 */
export async function withMockFallback<T>(
  apiFn: () => Promise<T | null>,
  mockFn: () => Promise<T>
): Promise<T> {
  try {
    const result = await apiFn();
    if (result !== null && result !== undefined) return result;
  } catch {
    // Fall through to mock
  }
  console.warn("[ServiceFactory] Using mock fallback");
  return mockFn();
}
