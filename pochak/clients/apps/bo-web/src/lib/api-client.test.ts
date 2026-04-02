/**
 * Tests for L10: BO Front refresh token logic
 * Verifies that 401 responses trigger token refresh, successful refresh retries
 * the original request, and failed refresh redirects to /login.
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

// Mock localStorage with zustand auth state
let localStorageData: Record<string, string> = {};

const mockLocalStorage = {
  getItem: vi.fn((key: string) => localStorageData[key] ?? null),
  setItem: vi.fn((key: string, value: string) => { localStorageData[key] = value; }),
  removeItem: vi.fn((key: string) => { delete localStorageData[key]; }),
  clear: vi.fn(() => { localStorageData = {}; }),
  length: 0,
  key: vi.fn(() => null),
};

const mockLocation = { href: '' };

Object.defineProperty(globalThis, 'window', {
  value: {
    dispatchEvent: vi.fn(),
    location: mockLocation,
  },
  writable: true,
});

Object.defineProperty(globalThis, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

// Helper to set auth state in localStorage (mimics zustand persist)
function setAuthState(token: string, refreshToken: string) {
  localStorageData['pochak-admin-auth'] = JSON.stringify({
    state: { token, refreshToken, user: { id: '1' }, isAuthenticated: true },
    version: 0,
  });
}

// Dynamic import to reset module state between tests
async function importAdminApi() {
  // Vitest caches modules — we use resetModules in beforeEach
  const mod = await import('./api-client');
  return mod.adminApi;
}

describe('L10: BO Front refresh token logic', () => {
  let fetchCalls: Array<{ url: string; options: RequestInit }> = [];
  let fetchResponses: Array<{ ok: boolean; status: number; json: () => Promise<unknown> }> = [];
  let fetchCallIndex = 0;

  beforeEach(() => {
    localStorageData = {};
    fetchCalls = [];
    fetchResponses = [];
    fetchCallIndex = 0;
    mockLocation.href = '';
    vi.clearAllMocks();

    // Setup fetch mock
    (globalThis as any).fetch = vi.fn(async (url: string, options: RequestInit = {}) => {
      fetchCalls.push({ url: url.toString(), options });
      const response = fetchResponses[fetchCallIndex++];
      if (!response) {
        return { ok: false, status: 500, statusText: 'Internal Server Error', json: () => Promise.resolve({}) };
      }
      return { ...response, statusText: response.ok ? 'OK' : `Error ${response.status}` };
    });
  });

  it('should add Authorization header from stored token', async () => {
    setAuthState('my-token', 'my-refresh');
    fetchResponses.push({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ data: { items: [] } }),
    });

    const adminApi = (await import('./api-client')).adminApi;
    await adminApi.get('/test-path');

    expect(fetchCalls.length).toBeGreaterThanOrEqual(1);
    const headers = fetchCalls[0].options.headers as Record<string, string>;
    expect(headers['Authorization']).toBe('Bearer my-token');
  });

  it('should attempt refresh on 401 response', async () => {
    setAuthState('expired-token', 'valid-refresh');

    // First call: 401
    fetchResponses.push({
      ok: false,
      status: 401,
      json: () => Promise.resolve({ error: 'unauthorized' }),
    });
    // Refresh call: success
    fetchResponses.push({
      ok: true,
      status: 200,
      json: () => Promise.resolve({
        accessToken: 'new-token',
        refreshToken: 'new-refresh',
      }),
    });
    // Retry call: success
    fetchResponses.push({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ data: { result: 'ok' } }),
    });

    const adminApi = (await import('./api-client')).adminApi;
    const result = await adminApi.get('/protected');

    // Should have made 3 fetch calls: original, refresh, retry
    expect(fetchCalls.length).toBe(3);

    // Second call should be the refresh endpoint
    expect(fetchCalls[1].url).toContain('/api/v1/auth/refresh');
    const refreshBody = JSON.parse(fetchCalls[1].options.body as string);
    expect(refreshBody.refreshToken).toBe('valid-refresh');

    // Third call should use the new token
    const retryHeaders = fetchCalls[2].options.headers as Record<string, string>;
    expect(retryHeaders['Authorization']).toBe('Bearer new-token');

    expect(result).toEqual({ result: 'ok' });
  });

  it('should redirect to /login when refresh fails', async () => {
    setAuthState('expired-token', 'invalid-refresh');

    // First call: 401
    fetchResponses.push({
      ok: false,
      status: 401,
      json: () => Promise.resolve({ error: 'unauthorized' }),
    });
    // Refresh call: fails
    fetchResponses.push({
      ok: false,
      status: 401,
      json: () => Promise.resolve({ error: 'invalid refresh' }),
    });

    const adminApi = (await import('./api-client')).adminApi;
    const result = await adminApi.get('/protected');

    // Should have cleared auth and redirected
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('pochak-admin-auth');
    expect(mockLocation.href).toBe('/login');
    expect(result).toBeNull();
  });

  it('should return null when no refresh token exists and 401 received', async () => {
    // Set auth state with empty refresh token
    setAuthState('expired-token', '');

    // First call: 401
    fetchResponses.push({
      ok: false,
      status: 401,
      json: () => Promise.resolve({ error: 'unauthorized' }),
    });

    const adminApi = (await import('./api-client')).adminApi;
    const result = await adminApi.get('/protected');

    // No refresh token means refreshAccessToken returns null immediately
    // The request function returns null (mock fallback)
    expect(result).toBeNull();
    // Only 1 fetch call (the original 401), no refresh attempt
    expect(fetchCalls.length).toBe(1);
  });

  it('should update stored tokens after successful refresh', async () => {
    setAuthState('old-token', 'old-refresh');

    fetchResponses.push({
      ok: false,
      status: 401,
      json: () => Promise.resolve({}),
    });
    fetchResponses.push({
      ok: true,
      status: 200,
      json: () => Promise.resolve({
        accessToken: 'refreshed-access',
        refreshToken: 'refreshed-refresh',
      }),
    });
    fetchResponses.push({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ data: 'ok' }),
    });

    const adminApi = (await import('./api-client')).adminApi;
    await adminApi.get('/some-path');

    // Verify tokens were updated in localStorage
    expect(mockLocalStorage.setItem).toHaveBeenCalled();
    const storedCalls = mockLocalStorage.setItem.mock.calls.filter(
      (call: string[]) => call[0] === 'pochak-admin-auth'
    );
    expect(storedCalls.length).toBeGreaterThan(0);

    const lastStored = JSON.parse(storedCalls[storedCalls.length - 1][1]);
    expect(lastStored.state.token).toBe('refreshed-access');
    expect(lastStored.state.refreshToken).toBe('refreshed-refresh');
  });
});
