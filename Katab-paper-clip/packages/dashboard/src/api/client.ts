import type {
  RecordingScenario,
  ScenarioCreateInput,
  ScenarioUpdateInput,
  Execution,
  Report,
} from "@katab/types";

const API_BASE = "/api";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public body?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: res.statusText }));
    throw new ApiError(body.message || res.statusText, res.status, body);
  }

  const text = await res.text();
  if (!text) return undefined as T;
  return JSON.parse(text);
}

// ── Scenarios ──

export function getScenarios(): Promise<RecordingScenario[]> {
  return request<RecordingScenario[]>("/scenarios");
}

export function getScenario(id: string): Promise<RecordingScenario> {
  return request<RecordingScenario>(`/scenarios/${id}`);
}

export function createScenario(data: ScenarioCreateInput): Promise<RecordingScenario> {
  return request<RecordingScenario>("/scenarios", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateScenario(id: string, data: ScenarioUpdateInput): Promise<RecordingScenario> {
  return request<RecordingScenario>(`/scenarios/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function deleteScenario(id: string): Promise<void> {
  return request<void>(`/scenarios/${id}`, { method: "DELETE" });
}

// ── Executions ──

export function runScenario(id: string): Promise<Execution> {
  return request<Execution>(`/scenarios/${id}/run`, { method: "POST" });
}

export function getExecutions(): Promise<Execution[]> {
  return request<Execution[]>("/executions");
}

export function getExecution(id: string): Promise<Execution> {
  return request<Execution>(`/executions/${id}`);
}

export interface StreamEvent {
  type: "status" | "step" | "error" | "done";
  status?: string;
  progress?: number;
  stepId?: string;
  eventIndex?: number;
  duration?: number;
  message?: string;
}

export function streamExecution(
  id: string,
  onEvent: (event: StreamEvent) => void,
  onError?: (error: Event) => void,
): EventSource {
  const source = new EventSource(`${API_BASE}/executions/${id}/stream`);

  source.onmessage = (e) => {
    try {
      const parsed: StreamEvent = JSON.parse(e.data);
      onEvent(parsed);
      if (parsed.type === "done" || parsed.type === "error") {
        source.close();
      }
    } catch {
      // ignore
    }
  };

  source.onerror = (e) => {
    onError?.(e);
    source.close();
  };

  return source;
}

// ── Reports ──

export function getReports(): Promise<Report[]> {
  return request<Report[]>("/reports");
}

// ── Health ──

export function checkHealth(): Promise<{ status: string; version: string; timestamp: string }> {
  return request("/health");
}

export const api = {
  getScenarios,
  getScenario,
  createScenario,
  updateScenario,
  deleteScenario,
  runScenario,
  getExecutions,
  getExecution,
  streamExecution,
  getReports,
  checkHealth,
};
