import type { ServerResponse } from "http";

/**
 * Active SSE client connections keyed by execution ID.
 */
export const sseClients = new Map<string, Set<ServerResponse>>();

export function addSSEClient(executionId: string, res: ServerResponse): void {
  if (!sseClients.has(executionId)) {
    sseClients.set(executionId, new Set());
  }
  sseClients.get(executionId)!.add(res);

  res.on("close", () => {
    const clients = sseClients.get(executionId);
    if (clients) {
      clients.delete(res);
      if (clients.size === 0) {
        sseClients.delete(executionId);
      }
    }
  });
}
