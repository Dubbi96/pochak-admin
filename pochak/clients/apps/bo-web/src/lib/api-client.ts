/**
 * Extensible API client for BO Web.
 * All requests route through the API Gateway which handles JWT validation
 * and forwards to the appropriate backend service.
 */

const GATEWAY_URL =
  process.env.NEXT_PUBLIC_GATEWAY_URL || "http://localhost:8080";

// ── Token helper ──────────────────────────────────────────────────────────────

function getAdminToken(): string {
  if (typeof window !== "undefined") {
    return localStorage.getItem("pochak-admin-auth")
      ? (() => {
          try {
            const stored = JSON.parse(
              localStorage.getItem("pochak-admin-auth") || "{}"
            );
            return stored?.state?.token || "";
          } catch {
            return "";
          }
        })()
      : "";
  }
  return "";
}

// ── Config ────────────────────────────────────────────────────────────────────

const REQUEST_TIMEOUT_MS = 15_000; // 15 seconds
const MAX_RETRIES = 2; // retry up to 2 times for 5xx errors

// ── Shared request helper ─────────────────────────────────────────────────────

async function request<T>(
  baseUrl: string,
  path: string,
  options: RequestInit = {},
  params?: Record<string, string>
): Promise<T | null> {
  const url = new URL(path, baseUrl);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  const token = getAdminToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  let lastError: unknown;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

      const res = await fetch(url.toString(), {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        const error = new Error(`HTTP ${res.status}: ${res.statusText}`);

        // Only retry on 5xx server errors, not client errors
        if (res.status >= 500 && attempt < MAX_RETRIES) {
          lastError = error;
          if (process.env.NODE_ENV === "development") {
            console.warn(
              `[adminApi] 5xx error on ${path} (attempt ${attempt + 1}/${MAX_RETRIES + 1}), retrying...`,
              error.message
            );
          }
          continue;
        }

        throw error;
      }

      const json = await res.json();
      // Unwrap standard API envelope { data: T } if present
      return (json.data ?? json) as T;
    } catch (err) {
      lastError = err;

      // Handle timeout (AbortError)
      if (err instanceof DOMException && err.name === "AbortError") {
        if (process.env.NODE_ENV === "development") {
          console.warn(`[adminApi] Request timeout for ${path} (${REQUEST_TIMEOUT_MS}ms)`);
        }
        if (attempt < MAX_RETRIES) continue;
      }

      // Don't retry on non-5xx, non-timeout errors
      if (
        err instanceof Error &&
        !err.message.startsWith("HTTP 5") &&
        !(err instanceof DOMException && err.name === "AbortError")
      ) {
        break;
      }
    }
  }

  if (process.env.NODE_ENV === "development") {
    console.warn(`[adminApi] Falling back to mock for ${path}`, lastError);
  }
  return null; // Let caller handle null with mock fallback
}

// ── Admin API client ──────────────────────────────────────────────────────────

export const adminApi = {
  /** GET request to admin backend. Returns null if backend unavailable. */
  async get<T>(path: string, params?: Record<string, string>): Promise<T | null> {
    return request<T>(GATEWAY_URL, path, { method: "GET" }, params);
  },

  /** POST request to admin backend. Returns null if backend unavailable. */
  async post<T>(path: string, body?: unknown): Promise<T | null> {
    return request<T>(GATEWAY_URL, path, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  /** PUT request to admin backend. Returns null if backend unavailable. */
  async put<T>(path: string, body?: unknown): Promise<T | null> {
    return request<T>(GATEWAY_URL, path, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  /** DELETE request to admin backend. Returns null if backend unavailable. */
  async delete<T>(path: string): Promise<T | null> {
    return request<T>(GATEWAY_URL, path, { method: "DELETE" });
  },

  /** PATCH request to admin backend. Returns null if backend unavailable. */
  async patch<T>(path: string, body?: unknown): Promise<T | null> {
    return request<T>(GATEWAY_URL, path, {
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    });
  },
};

// ── Gateway API alias (backward compatibility) ──────────────────────────────
// adminApi and gatewayApi now both route through the gateway.
export const gatewayApi = adminApi;

export { GATEWAY_URL };
