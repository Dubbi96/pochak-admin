/**
 * API client for BO Web.
 * All requests route through the API Gateway which handles JWT validation
 * and forwards to the appropriate backend service (pochak-bo-bff).
 */

const GATEWAY_URL =
  process.env.NEXT_PUBLIC_GATEWAY_URL || "http://localhost:8080";

// ── Token helper ──────────────────────────────────────────────────────────────

function getAdminToken(): string {
  if (typeof window !== "undefined") {
    try {
      const stored = JSON.parse(
        localStorage.getItem("pochak-admin-auth") || "{}"
      );
      return stored?.state?.token || "";
    } catch {
      return "";
    }
  }
  return "";
}

// ── Config ────────────────────────────────────────────────────────────────────

const REQUEST_TIMEOUT_MS = 15_000;
const MAX_RETRIES = 2;

// ── Shared request helper ─────────────────────────────────────────────────────

async function request<T>(
  baseUrl: string,
  path: string,
  options: RequestInit = {},
  params?: Record<string, string>
): Promise<T> {
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

        if (res.status >= 500 && attempt < MAX_RETRIES) {
          lastError = error;
          continue;
        }

        throw error;
      }

      const json = await res.json();
      return (json.data ?? json) as T;
    } catch (err) {
      lastError = err;

      if (err instanceof DOMException && err.name === "AbortError") {
        if (attempt < MAX_RETRIES) continue;
      }

      if (
        err instanceof Error &&
        !err.message.startsWith("HTTP 5") &&
        !(err instanceof DOMException && err.name === "AbortError")
      ) {
        break;
      }
    }
  }

  throw lastError ?? new Error(`Request failed: ${path}`);
}

// ── Admin API client ──────────────────────────────────────────────────────────

export const adminApi = {
  async get<T>(path: string, params?: Record<string, string>): Promise<T> {
    return request<T>(GATEWAY_URL, path, { method: "GET" }, params);
  },

  async post<T>(path: string, body?: unknown): Promise<T> {
    return request<T>(GATEWAY_URL, path, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  async put<T>(path: string, body?: unknown): Promise<T> {
    return request<T>(GATEWAY_URL, path, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  async delete<T>(path: string): Promise<T> {
    return request<T>(GATEWAY_URL, path, { method: "DELETE" });
  },

  async patch<T>(path: string, body?: unknown): Promise<T> {
    return request<T>(GATEWAY_URL, path, {
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    });
  },
};

export const gatewayApi = adminApi;

export { GATEWAY_URL };
