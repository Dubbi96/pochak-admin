import { useEffect, useState, useCallback, useRef } from "react";
import type { Execution, ExecutionStep } from "@katab/types";
import { api, type StreamEvent } from "../api/client.js";

export function ExecutionsPage() {
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [detail, setDetail] = useState<Execution | null>(null);
  const [streaming, setStreaming] = useState<Set<string>>(new Set());
  const sourcesRef = useRef<Map<string, EventSource>>(new Map());

  const load = useCallback(() => {
    setLoading(true);
    api.getExecutions()
      .then(setExecutions)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
    return () => {
      // Cleanup SSE connections
      sourcesRef.current.forEach((s) => s.close());
    };
  }, [load]);

  // Auto-attach SSE to running/queued executions
  useEffect(() => {
    for (const exec of executions) {
      if (
        (exec.status === "running" || exec.status === "queued") &&
        !sourcesRef.current.has(exec.id)
      ) {
        watchExecution(exec.id);
      }
    }
  }, [executions]);

  const watchExecution = (id: string) => {
    if (sourcesRef.current.has(id)) return;

    setStreaming((prev) => new Set(prev).add(id));

    const source = api.streamExecution(
      id,
      (event: StreamEvent) => {
        setExecutions((prev) =>
          prev.map((e) => {
            if (e.id !== id) return e;
            const updated = { ...e };
            if (event.status) updated.status = event.status as Execution["status"];
            if (event.progress != null) updated.progress = event.progress;
            return updated;
          }),
        );
        if (event.type === "done" || event.type === "error") {
          sourcesRef.current.delete(id);
          setStreaming((prev) => {
            const next = new Set(prev);
            next.delete(id);
            return next;
          });
          // Reload full data after completion
          load();
        }
      },
      () => {
        sourcesRef.current.delete(id);
        setStreaming((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      },
    );

    sourcesRef.current.set(id, source);
  };

  const openDetail = async (id: string) => {
    try {
      const exec = await api.getExecution(id);
      setDetail(exec);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load execution");
    }
  };

  if (loading) return <p>Loading executions...</p>;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h1 style={{ margin: 0 }}>Executions</h1>
        <button onClick={load} style={styles.secondaryBtn}>Refresh</button>
      </div>

      {error && (
        <div style={styles.error}>
          {error}
          <button onClick={() => setError("")} style={styles.dismiss}>&times;</button>
        </div>
      )}

      {executions.length === 0 ? (
        <p>No executions yet. Run a scenario to see results here.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={styles.th}>ID</th>
              <th style={styles.th}>Scenario</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Progress</th>
              <th style={styles.th}>Started</th>
              <th style={{ ...styles.th, textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {executions.map((e) => (
              <tr key={e.id}>
                <td style={{ ...styles.td, fontFamily: "monospace", fontSize: 12 }}>
                  {e.id.slice(0, 8)}
                </td>
                <td style={{ ...styles.td, fontFamily: "monospace", fontSize: 12 }}>
                  {e.scenarioId.slice(0, 8)}
                </td>
                <td style={styles.td}>
                  <StatusBadge status={e.status} live={streaming.has(e.id)} />
                </td>
                <td style={styles.td}>
                  <ProgressBar value={e.progress} />
                </td>
                <td style={styles.td}>{e.startedAt ? new Date(e.startedAt).toLocaleString() : "-"}</td>
                <td style={{ ...styles.td, textAlign: "right" }}>
                  <button onClick={() => openDetail(e.id)} style={styles.detailBtn}>Detail</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Execution Detail Modal */}
      {detail && (
        <div style={styles.overlay} onClick={() => setDetail(null)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 style={{ margin: 0 }}>Execution {detail.id.slice(0, 8)}</h2>
              <button onClick={() => setDetail(null)} style={styles.dismiss}>&times;</button>
            </div>

            <div style={{ display: "flex", gap: 16, marginBottom: 16, flexWrap: "wrap" }}>
              <div><strong>Status:</strong> <StatusBadge status={detail.status} /></div>
              <div><strong>Progress:</strong> {Math.round(detail.progress * 100)}%</div>
              <div><strong>Started:</strong> {detail.startedAt ? new Date(detail.startedAt).toLocaleString() : "-"}</div>
              {detail.completedAt && <div><strong>Completed:</strong> {new Date(detail.completedAt).toLocaleString()}</div>}
            </div>

            <h3 style={{ margin: "0 0 8px" }}>Steps ({detail.steps?.length ?? 0})</h3>
            {detail.steps && detail.steps.length > 0 ? (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr>
                    <th style={styles.th}>#</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Duration</th>
                    <th style={styles.th}>Assertions</th>
                    <th style={styles.th}>Logs</th>
                  </tr>
                </thead>
                <tbody>
                  {detail.steps.map((step: ExecutionStep) => (
                    <tr key={step.id}>
                      <td style={styles.td}>{step.eventIndex}</td>
                      <td style={styles.td}><StatusBadge status={step.status} /></td>
                      <td style={styles.td}>{step.duration}ms</td>
                      <td style={styles.td}>
                        {step.assertions.length > 0
                          ? `${step.assertions.filter((a) => a.passed).length}/${step.assertions.length} passed`
                          : "-"}
                      </td>
                      <td style={styles.td}>
                        {step.logs.length > 0 ? (
                          <details>
                            <summary style={{ cursor: "pointer", fontSize: 12 }}>{step.logs.length} entries</summary>
                            <pre style={{ fontSize: 11, maxHeight: 100, overflow: "auto", margin: "4px 0", background: "#f9fafb", padding: 6, borderRadius: 4 }}>
                              {step.logs.join("\n")}
                            </pre>
                          </details>
                        ) : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p style={{ color: "#6b7280", fontSize: 14 }}>No steps recorded yet.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Sub-components ──

function StatusBadge({ status, live }: { status: string; live?: boolean }) {
  const colors: Record<string, { bg: string; fg: string }> = {
    passed: { bg: "#f0fdf4", fg: "#166534" },
    failed: { bg: "#fef2f2", fg: "#991b1b" },
    running: { bg: "#eff6ff", fg: "#1d4ed8" },
    queued: { bg: "#fffbeb", fg: "#92400e" },
    cancelled: { bg: "#f3f4f6", fg: "#374151" },
    error: { bg: "#fef2f2", fg: "#991b1b" },
    warning: { bg: "#fffbeb", fg: "#92400e" },
    skipped: { bg: "#f3f4f6", fg: "#6b7280" },
  };
  const c = colors[status] ?? { bg: "#f3f4f6", fg: "#374151" };

  return (
    <span style={{
      display: "inline-block", padding: "2px 8px", borderRadius: 4,
      background: c.bg, color: c.fg, fontSize: 12, fontWeight: 500,
    }}>
      {live && <span style={{ marginRight: 4 }}>&#9679;</span>}
      {status}
    </span>
  );
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div style={{ width: 80, height: 6, background: "#e5e7eb", borderRadius: 3, overflow: "hidden", display: "inline-block", verticalAlign: "middle" }}>
      <div style={{ width: `${Math.round(value * 100)}%`, height: "100%", background: "#3b82f6", borderRadius: 3, transition: "width 0.3s ease" }} />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  th: { textAlign: "left", padding: 8, borderBottom: "2px solid #e5e7eb", fontSize: 13, fontWeight: 600 },
  td: { padding: 8, borderBottom: "1px solid #f3f4f6" },
  secondaryBtn: {
    padding: "8px 16px", background: "#fff", color: "#374151", border: "1px solid #d1d5db",
    borderRadius: 6, fontSize: 14, cursor: "pointer",
  },
  detailBtn: {
    padding: "4px 10px", background: "#eff6ff", color: "#1d4ed8", border: "1px solid #93c5fd",
    borderRadius: 4, fontSize: 12, fontWeight: 500, cursor: "pointer",
  },
  error: {
    padding: "10px 14px", background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 6,
    color: "#991b1b", marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center",
  },
  dismiss: { background: "none", border: "none", color: "#991b1b", fontSize: 18, cursor: "pointer" },
  overlay: {
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", display: "flex",
    alignItems: "center", justifyContent: "center", zIndex: 50,
  },
  modal: {
    background: "#fff", borderRadius: 10, padding: 24, minWidth: 600, maxWidth: 800,
    maxHeight: "85vh", overflow: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
  },
};
