import { useEffect, useState, useCallback } from "react";
import type { Report } from "@katab/types";
import { api } from "../api/client.js";

export function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    api.getReports()
      .then(setReports)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  if (loading) return <p>Loading reports...</p>;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h1 style={{ margin: 0 }}>Reports</h1>
        <button onClick={load} style={styles.secondaryBtn}>Refresh</button>
      </div>

      {error && (
        <div style={styles.error}>
          {error}
          <button onClick={() => setError("")} style={styles.dismiss}>&times;</button>
        </div>
      )}

      {reports.length === 0 ? (
        <p>No reports generated yet. Reports are created after execution completes.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {reports.map((r) => (
            <div key={r.id} style={styles.card}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <span style={styles.badge}>{r.format.toUpperCase()}</span>
                  <span style={{ fontFamily: "monospace", fontSize: 12, marginLeft: 8, color: "#6b7280" }}>
                    Execution: {r.executionId.slice(0, 8)}
                  </span>
                </div>
                <span style={{ fontSize: 13, color: "#6b7280" }}>
                  {new Date(r.generatedAt).toLocaleString()}
                </span>
              </div>

              <div style={{ marginTop: 8 }}>
                <button
                  onClick={() => setExpanded(expanded === r.id ? null : r.id)}
                  style={styles.expandBtn}
                >
                  {expanded === r.id ? "Hide Content" : "Show Content"}
                </button>
              </div>

              {expanded === r.id && (
                <pre style={styles.pre}>{r.content}</pre>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  secondaryBtn: {
    padding: "8px 16px", background: "#fff", color: "#374151", border: "1px solid #d1d5db",
    borderRadius: 6, fontSize: 14, cursor: "pointer",
  },
  error: {
    padding: "10px 14px", background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 6,
    color: "#991b1b", marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center",
  },
  dismiss: { background: "none", border: "none", color: "#991b1b", fontSize: 18, cursor: "pointer" },
  card: {
    border: "1px solid #e5e7eb", borderRadius: 8, padding: 16, background: "#fafafa",
  },
  badge: {
    display: "inline-block", padding: "2px 8px", borderRadius: 4,
    background: "#dbeafe", color: "#1d4ed8", fontSize: 12, fontWeight: 600,
  },
  expandBtn: {
    padding: "4px 10px", background: "#fff", color: "#374151", border: "1px solid #d1d5db",
    borderRadius: 4, fontSize: 12, cursor: "pointer",
  },
  pre: {
    marginTop: 8, padding: 12, background: "#f9fafb", border: "1px solid #e5e7eb",
    borderRadius: 6, fontSize: 12, overflow: "auto", maxHeight: 400, whiteSpace: "pre-wrap",
  },
};
