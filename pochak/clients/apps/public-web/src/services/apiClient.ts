/**
 * Extensible API client for Pochak Public Web.
 * Calls the gateway API; returns null on failure instead of falling back to mock data.
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
        const payload = data.data ?? data;
        setAuthToken(payload.accessToken);
        localStorage.setItem("pochak_refresh_token", payload.refreshToken);
        return true; // caller should retry
      }
    } catch {
      // refresh failed — fall through to logout
    }
  }
  clearAuthToken();
  // Prevent redirect/reload loops when already on login page.
  if (window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
  return false;
}

/**
 * Fetch data from the gateway API.
 * Returns null if the API is unavailable or returns an error.
 *
 * @param path - API path relative to /api/v1 (e.g. "/home/banners")
 * @returns The API response data or null on failure
 */
export async function fetchApi<T>(path: string): Promise<T | null> {
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
        return null;
      }
    }
    if (!res.ok) {
      console.warn(`[PublicAPI] ${path} failed with HTTP ${res.status}`);
      return null;
    }
    const json = await res.json();
    // Unwrap standard API envelope { data: T } if present
    return (json.data ?? json) as T;
  } catch {
    console.warn(`[PublicAPI] ${path} request failed`);
    return null;
  }
}

/**
 * POST request to gateway API.
 * Returns null on failure.
 *
 * @param path - API path relative to /api/v1
 * @param body - Request body
 * @returns The API response data or null on failure
 */
export async function postApi<T>(path: string, body: unknown): Promise<T | null> {
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
        return null;
      }
    }
    if (!res.ok) {
      console.warn(`[PublicAPI] POST ${path} failed with HTTP ${res.status}`);
      return null;
    }
    const json = await res.json();
    return (json.data ?? json) as T;
  } catch {
    console.warn(`[PublicAPI] POST ${path} request failed`);
    return null;
  }
}

/**
 * PUT request to gateway API.
 * Returns null on failure.
 *
 * @param path - API path relative to /api/v1
 * @param body - Request body
 * @returns The API response data or null on failure
 */
export async function putApi<T>(path: string, body: unknown): Promise<T | null> {
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
        return null;
      }
    }
    if (!res.ok) {
      console.warn(`[PublicAPI] PUT ${path} failed with HTTP ${res.status}`);
      return null;
    }
    const json = await res.json();
    return (json.data ?? json) as T;
  } catch {
    console.warn(`[PublicAPI] PUT ${path} request failed`);
    return null;
  }
}

/**
 * DELETE request to gateway API.
 * Returns null on failure.
 */
export async function deleteApi<T>(path: string): Promise<T | null> {
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
        return null;
      }
    }
    if (!res.ok) {
      console.warn(`[PublicAPI] DELETE ${path} failed with HTTP ${res.status}`);
      return null;
    }
    const json = await res.json();
    return (json.data ?? json) as T;
  } catch {
    console.warn(`[PublicAPI] DELETE ${path} request failed`);
    return null;
  }
}

/**
 * Logout: clear tokens + call backend
 */
export async function logoutUser(): Promise<void> {
  try {
    await postApi('/auth/logout', {});
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
    await deleteApi('/auth/withdraw');
  } catch {
    // ignore — always clear local state
  }
  clearAuthToken();
  localStorage.removeItem('pochak_user');
  localStorage.removeItem('pochak_refresh_token');
}

export { GATEWAY_URL };
