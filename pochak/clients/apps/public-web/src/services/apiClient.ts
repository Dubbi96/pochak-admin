/**
 * Extensible API client for Pochak Public Web.
 * Calls the gateway API with automatic fallback to mock data.
 *
 * Migration path:
 *   Phase 4A: gateway calls with mock fallback
 *   Phase 4B: full gateway integration with user auth tokens
 */

const GATEWAY_URL = import.meta.env.VITE_GATEWAY_URL || "http://localhost:8080";

const TOKEN_KEY = "pochak_token";

/**
 * Retrieve the JWT auth token from localStorage (browser only).
 */
function getAuthToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem(TOKEN_KEY);
  }
  return null;
}

/**
 * Save a JWT auth token to localStorage.
 */
export function setAuthToken(token: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(TOKEN_KEY, token);
    window.dispatchEvent(new Event("pochak_auth_change"));
  }
}

/**
 * Remove the JWT auth token from localStorage (logout).
 */
export function clearAuthToken(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem("pochak_user");
    localStorage.removeItem("pochak_refresh_token");
    window.dispatchEvent(new Event("pochak_auth_change"));
  }
}

/**
 * Build common headers including Authorization if a token is available.
 */
function buildHeaders(extra?: Record<string, string>): Record<string, string> {
  const headers: Record<string, string> = { ...extra };
  const token = getAuthToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

/**
 * Handle 401 responses by attempting a token refresh.
 * If refresh succeeds, returns true so the caller can retry.
 * If refresh fails, clears auth state and redirects to /login.
 */
async function handleUnauthorized(): Promise<boolean> {
  const refreshToken = localStorage.getItem("pochak_refresh_token");
  if (refreshToken) {
    try {
      const refreshRes = await fetch(`${GATEWAY_URL}/api/v1/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
      if (refreshRes.ok) {
        const data = await refreshRes.json();
        setAuthToken(data.accessToken);
        localStorage.setItem("pochak_refresh_token", data.refreshToken);
        return true; // caller should retry
      }
    } catch {
      // refresh failed — fall through to logout
    }
  }
  clearAuthToken();
  window.location.href = "/login";
  return false;
}

/**
 * Fetch data from the gateway API with a typed fallback.
 * If the gateway is unavailable or returns an error, the fallback value is returned.
 *
 * @param path - API path relative to /api/v1 (e.g. "/home/banners")
 * @param fallback - Mock data to return if the API call fails
 * @returns The API response data or the fallback
 */
export async function fetchApi<T>(path: string, fallback: T): Promise<T> {
  try {
    let res = await fetch(`${GATEWAY_URL}/api/v1${path}`, {
      headers: buildHeaders(),
    });
    if (res.status === 401) {
      const refreshed = await handleUnauthorized();
      if (refreshed) {
        res = await fetch(`${GATEWAY_URL}/api/v1${path}`, {
          headers: buildHeaders(),
        });
      } else {
        return fallback;
      }
    }
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    const json = await res.json();
    // Unwrap standard API envelope { data: T } if present
    return (json.data ?? json) as T;
  } catch {
    console.warn(`[PublicAPI] Using mock for ${path}`);
    return fallback;
  }
}

/**
 * POST request to gateway API with fallback.
 *
 * @param path - API path relative to /api/v1
 * @param body - Request body
 * @param fallback - Mock data to return if the API call fails
 * @returns The API response data or the fallback
 */
export async function postApi<T>(
  path: string,
  body: unknown,
  fallback: T
): Promise<T> {
  try {
    let res = await fetch(`${GATEWAY_URL}/api/v1${path}`, {
      method: "POST",
      headers: buildHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(body),
    });
    if (res.status === 401) {
      const refreshed = await handleUnauthorized();
      if (refreshed) {
        res = await fetch(`${GATEWAY_URL}/api/v1${path}`, {
          method: "POST",
          headers: buildHeaders({ "Content-Type": "application/json" }),
          body: JSON.stringify(body),
        });
      } else {
        return fallback;
      }
    }
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    const json = await res.json();
    return (json.data ?? json) as T;
  } catch {
    console.warn(`[PublicAPI] Using mock for POST ${path}`);
    return fallback;
  }
}

/**
 * PUT request to gateway API with fallback.
 *
 * @param path - API path relative to /api/v1
 * @param body - Request body
 * @param fallback - Mock data to return if the API call fails
 * @returns The API response data or the fallback
 */
export async function putApi<T>(
  path: string,
  body: unknown,
  fallback: T
): Promise<T> {
  try {
    let res = await fetch(`${GATEWAY_URL}/api/v1${path}`, {
      method: "PUT",
      headers: buildHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(body),
    });
    if (res.status === 401) {
      const refreshed = await handleUnauthorized();
      if (refreshed) {
        res = await fetch(`${GATEWAY_URL}/api/v1${path}`, {
          method: "PUT",
          headers: buildHeaders({ "Content-Type": "application/json" }),
          body: JSON.stringify(body),
        });
      } else {
        return fallback;
      }
    }
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    const json = await res.json();
    return (json.data ?? json) as T;
  } catch {
    console.warn(`[PublicAPI] Using mock for PUT ${path}`);
    return fallback;
  }
}

/**
 * DELETE request to gateway API.
 */
export async function deleteApi<T>(path: string, fallback: T): Promise<T> {
  try {
    let res = await fetch(`${GATEWAY_URL}/api/v1${path}`, {
      method: "DELETE",
      headers: buildHeaders(),
    });
    if (res.status === 401) {
      const refreshed = await handleUnauthorized();
      if (refreshed) {
        res = await fetch(`${GATEWAY_URL}/api/v1${path}`, {
          method: "DELETE",
          headers: buildHeaders(),
        });
      } else {
        return fallback;
      }
    }
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    const json = await res.json();
    return (json.data ?? json) as T;
  } catch {
    console.warn(`[PublicAPI] Using mock for DELETE ${path}`);
    return fallback;
  }
}

/**
 * Logout: clear tokens + call backend
 */
export async function logoutUser(): Promise<void> {
  try {
    await postApi('/auth/logout', {}, null);
  } catch {
    // ignore — always clear local state
  }
  clearAuthToken();
  localStorage.removeItem('pochak_user');
  localStorage.removeItem('pochak_refresh_token');
}

/**
 * Withdraw (회원탈퇴): call backend + clear tokens
 */
export async function withdrawUser(): Promise<void> {
  try {
    await deleteApi('/auth/withdraw', null);
  } catch {
    // ignore — always clear local state
  }
  clearAuthToken();
  localStorage.removeItem('pochak_user');
  localStorage.removeItem('pochak_refresh_token');
}

export { GATEWAY_URL };
