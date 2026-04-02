import { useEffect, useState, useCallback } from "react";
import type { RecordingScenario, Platform } from "@katab/types";
import { api } from "../api/client.js";

type Modal = "create" | "edit" | null;

export function ScenariosPage() {
  const [scenarios, setScenarios] = useState<RecordingScenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState<Modal>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", platform: "web" as Platform, tags: "" });
  const [saving, setSaving] = useState(false);
  const [runningId, setRunningId] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    api.getScenarios()
      .then(setScenarios)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  const openCreate = () => {
    setForm({ name: "", platform: "web", tags: "" });
    setEditId(null);
    setModal("create");
  };

  const openEdit = (s: RecordingScenario) => {
    setForm({ name: s.name, platform: s.platform, tags: s.tags?.join(", ") ?? "" });
    setEditId(s.id);
    setModal("edit");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const tags = form.tags.split(",").map((t) => t.trim()).filter(Boolean);
      if (modal === "create") {
        await api.createScenario({ name: form.name, platform: form.platform, events: [], tags });
      } else if (editId) {
        await api.updateScenario(editId, { name: form.name, tags });
      }
      setModal(null);
      load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this scenario?")) return;
    try {
      await api.deleteScenario(id);
      setScenarios((prev) => prev.filter((s) => s.id !== id));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  };

  const handleRun = async (id: string) => {
    setRunningId(id);
    setError("");
    try {
      await api.runScenario(id);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Run failed");
    } finally {
      setRunningId(null);
    }
  };

  if (loading) return <p>Loading scenarios...</p>;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h1 style={{ margin: 0 }}>Scenarios</h1>
        <button onClick={openCreate} style={styles.primaryBtn}>+ New Scenario</button>
      </div>

      {error && (
        <div style={styles.error}>
          {error}
          <button onClick={() => setError("")} style={styles.dismiss}>&times;</button>
        </div>
      )}

      {scenarios.length === 0 ? (
        <p>No scenarios yet. Create one or use AI Generate.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Platform</th>
              <th style={styles.th}>Steps</th>
              <th style={styles.th}>Tags</th>
              <th style={{ ...styles.th, textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {scenarios.map((s) => (
              <tr key={s.id}>
                <td style={styles.td}>{s.name}</td>
                <td style={styles.td}>{s.platform}</td>
                <td style={styles.td}>{s.events.length}</td>
                <td style={styles.td}>{s.tags?.join(", ") ?? ""}</td>
                <td style={{ ...styles.td, textAlign: "right" }}>
                  <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                    <button
                      onClick={() => handleRun(s.id)}
                      disabled={runningId === s.id}
                      style={styles.runBtn}
                      title="Run scenario"
                    >
                      {runningId === s.id ? "..." : "Run"}
                    </button>
                    <button onClick={() => openEdit(s)} style={styles.editBtn} title="Edit">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(s.id)} style={styles.deleteBtn} title="Delete">
                      Del
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Create/Edit Modal */}
      {modal && (
        <div style={styles.overlay} onClick={() => setModal(null)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ margin: "0 0 16px" }}>{modal === "create" ? "New Scenario" : "Edit Scenario"}</h2>
            <form onSubmit={handleSave}>
              <label style={styles.label}>
                Name
                <input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  style={styles.input}
                  required
                  autoFocus
                />
              </label>
              {modal === "create" && (
                <label style={styles.label}>
                  Platform
                  <select
                    value={form.platform}
                    onChange={(e) => setForm((f) => ({ ...f, platform: e.target.value as Platform }))}
                    style={styles.input}
                  >
                    <option value="web">Web</option>
                    <option value="ios">iOS</option>
                    <option value="android">Android</option>
                  </select>
                </label>
              )}
              <label style={styles.label}>
                Tags (comma-separated)
                <input
                  value={form.tags}
                  onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
                  style={styles.input}
                  placeholder="e.g. smoke, login"
                />
              </label>
              <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                <button type="submit" disabled={saving} style={styles.primaryBtn}>
                  {saving ? "Saving..." : "Save"}
                </button>
                <button type="button" onClick={() => setModal(null)} style={styles.secondaryBtn}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  th: { textAlign: "left", padding: 8, borderBottom: "2px solid #e5e7eb", fontSize: 13, fontWeight: 600 },
  td: { padding: 8, borderBottom: "1px solid #f3f4f6" },
  primaryBtn: {
    padding: "8px 16px", background: "#3b82f6", color: "#fff", border: "none",
    borderRadius: 6, fontSize: 14, fontWeight: 600, cursor: "pointer",
  },
  secondaryBtn: {
    padding: "8px 16px", background: "#fff", color: "#374151", border: "1px solid #d1d5db",
    borderRadius: 6, fontSize: 14, cursor: "pointer",
  },
  runBtn: {
    padding: "4px 10px", background: "#f0fdf4", color: "#166534", border: "1px solid #86efac",
    borderRadius: 4, fontSize: 12, fontWeight: 500, cursor: "pointer",
  },
  editBtn: {
    padding: "4px 10px", background: "#eff6ff", color: "#1d4ed8", border: "1px solid #93c5fd",
    borderRadius: 4, fontSize: 12, fontWeight: 500, cursor: "pointer",
  },
  deleteBtn: {
    padding: "4px 10px", background: "#fef2f2", color: "#991b1b", border: "1px solid #fca5a5",
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
    background: "#fff", borderRadius: 10, padding: 24, minWidth: 380, maxWidth: 480,
    boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
  },
  label: { display: "flex", flexDirection: "column", gap: 4, marginBottom: 12, fontSize: 13, fontWeight: 500 },
  input: {
    padding: "8px 10px", border: "1px solid #d1d5db", borderRadius: 6, fontSize: 14,
    width: "100%", boxSizing: "border-box",
  },
};
