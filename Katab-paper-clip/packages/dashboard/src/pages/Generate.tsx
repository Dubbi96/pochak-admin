import { useState, useRef, useCallback } from "react";
import type {
  Platform,
  GenerationProgress,
  GeneratedScenario,
  GenerationResult,
} from "@katab/types";

type SourceType = "code" | "url";
type ViewState = "input" | "generating" | "review";

export function GeneratePage() {
  const [view, setView] = useState<ViewState>("input");
  const [sourceType, setSourceType] = useState<SourceType>("url");
  const [content, setContent] = useState("");
  const [platform, setPlatform] = useState<Platform>("web");
  const [maxScenarios, setMaxScenarios] = useState(3);
  const [description, setDescription] = useState("");

  const [progress, setProgress] = useState<GenerationProgress | null>(null);
  const [scenarios, setScenarios] = useState<GeneratedScenario[]>([]);
  const [summary, setSummary] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const abortRef = useRef<AbortController | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!content.trim()) return;

    setView("generating");
    setError("");
    setScenarios([]);
    setProgress(null);

    abortRef.current = new AbortController();

    try {
      const resp = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: sourceType,
          content: content.trim(),
          platform,
          options: {
            maxScenarios,
            includeAssertions: true,
            description: description.trim() || undefined,
          },
        }),
        signal: abortRef.current.signal,
      });

      if (!resp.ok || !resp.body) {
        throw new Error(`Server error: ${resp.status}`);
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const json = line.slice(6);
            try {
              const parsed = JSON.parse(json);
              // Check if it's a result event (has scenarios array)
              if ("scenarios" in parsed && Array.isArray(parsed.scenarios)) {
                const result = parsed as GenerationResult;
                setScenarios(
                  result.scenarios.map((s) => ({ ...s, accepted: undefined })),
                );
                setSummary(result.summary);
                setView("review");
              } else {
                // Progress event
                const prog = parsed as GenerationProgress;
                setProgress(prog);
                if (prog.phase === "error") {
                  setError(prog.message);
                  setView("input");
                }
              }
            } catch {
              // ignore malformed lines
            }
          }
        }
      }
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      const msg = err instanceof Error ? err.message : "Generation failed";
      setError(msg);
      setView("input");
    }
  }, [content, sourceType, platform, maxScenarios, description]);

  const handleCancel = () => {
    abortRef.current?.abort();
    setView("input");
  };

  const toggleAccept = (tempId: string) => {
    setScenarios((prev) =>
      prev.map((s) =>
        s.tempId === tempId
          ? { ...s, accepted: s.accepted === true ? undefined : true }
          : s,
      ),
    );
  };

  const toggleReject = (tempId: string) => {
    setScenarios((prev) =>
      prev.map((s) =>
        s.tempId === tempId
          ? { ...s, accepted: s.accepted === false ? undefined : false }
          : s,
      ),
    );
  };

  const acceptAll = () => {
    setScenarios((prev) => prev.map((s) => ({ ...s, accepted: true })));
  };

  const rejectAll = () => {
    setScenarios((prev) => prev.map((s) => ({ ...s, accepted: false })));
  };

  const handleSaveAccepted = async () => {
    const accepted = scenarios.filter((s) => s.accepted === true);
    if (accepted.length === 0) return;

    setSaving(true);
    try {
      for (const scenario of accepted) {
        await fetch("/api/scenarios", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: scenario.name,
            platform: scenario.platform,
            events: scenario.events,
            tags: scenario.tags,
            metadata: {},
          }),
        });
      }
      setView("input");
      setContent("");
      setDescription("");
      setScenarios([]);
      setSummary("");
    } catch {
      setError("Failed to save scenarios");
    } finally {
      setSaving(false);
    }
  };

  const acceptedCount = scenarios.filter((s) => s.accepted === true).length;

  // ── Input View ──
  if (view === "input") {
    return (
      <div>
        <h1 style={{ margin: "0 0 8px" }}>AI Test Generation</h1>
        <p style={{ color: "#6b7280", margin: "0 0 24px" }}>
          Provide source code or a URL to generate test scenarios automatically.
        </p>

        {error && (
          <div style={styles.errorBanner}>
            {error}
            <button
              onClick={() => setError("")}
              style={styles.errorDismiss}
            >
              &times;
            </button>
          </div>
        )}

        {/* Source type toggle */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <button
            onClick={() => setSourceType("url")}
            style={sourceType === "url" ? styles.tabActive : styles.tab}
          >
            URL
          </button>
          <button
            onClick={() => setSourceType("code")}
            style={sourceType === "code" ? styles.tabActive : styles.tab}
          >
            Source Code
          </button>
        </div>

        {/* Content input */}
        {sourceType === "url" ? (
          <input
            type="url"
            placeholder="https://example.com"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            style={styles.input}
          />
        ) : (
          <textarea
            placeholder="Paste your HTML, React component, or other source code here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={12}
            style={{ ...styles.input, resize: "vertical", fontFamily: "monospace", fontSize: 13 }}
          />
        )}

        {/* Options */}
        <div style={{ display: "flex", gap: 16, marginBottom: 16, flexWrap: "wrap" }}>
          <label style={styles.fieldLabel}>
            Platform
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value as Platform)}
              style={styles.select}
            >
              <option value="web">Web</option>
              <option value="ios">iOS</option>
              <option value="android">Android</option>
            </select>
          </label>

          <label style={styles.fieldLabel}>
            Max scenarios
            <input
              type="number"
              min={1}
              max={10}
              value={maxScenarios}
              onChange={(e) => setMaxScenarios(Number(e.target.value))}
              style={{ ...styles.select, width: 80 }}
            />
          </label>
        </div>

        <textarea
          placeholder="Optional: Describe what you want to test (e.g., 'login flow, checkout process')"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          style={{ ...styles.input, resize: "vertical" }}
        />

        <button
          onClick={handleGenerate}
          disabled={!content.trim()}
          style={
            content.trim()
              ? styles.primaryButton
              : { ...styles.primaryButton, opacity: 0.5, cursor: "not-allowed" }
          }
        >
          Generate Test Scenarios
        </button>
      </div>
    );
  }

  // ── Generating View ──
  if (view === "generating") {
    return (
      <div>
        <h1 style={{ margin: "0 0 8px" }}>Generating Scenarios...</h1>

        <div style={styles.progressCard}>
          <div style={styles.progressHeader}>
            <span style={styles.phaseLabel}>
              {progress?.phase ?? "starting"}
            </span>
            <span style={{ color: "#6b7280", fontSize: 14 }}>
              {progress
                ? `${progress.scenariosGenerated} / ${progress.scenariosTotal}`
                : "0 / ?"}
            </span>
          </div>

          {/* Progress bar */}
          <div style={styles.progressBarTrack}>
            <div
              style={{
                ...styles.progressBarFill,
                width: progress
                  ? `${(progress.scenariosGenerated / Math.max(progress.scenariosTotal, 1)) * 100}%`
                  : "0%",
              }}
            />
          </div>

          <p style={{ margin: "12px 0 0", color: "#374151", fontSize: 14 }}>
            {progress?.message ?? "Initializing..."}
          </p>

          {progress?.currentScenario && (
            <p style={{ margin: "4px 0 0", color: "#6b7280", fontSize: 13 }}>
              Current: {progress.currentScenario}
            </p>
          )}
        </div>

        <button onClick={handleCancel} style={styles.secondaryButton}>
          Cancel
        </button>
      </div>
    );
  }

  // ── Review View ──
  return (
    <div>
      <h1 style={{ margin: "0 0 8px" }}>Review Generated Scenarios</h1>
      <p style={{ color: "#6b7280", margin: "0 0 16px" }}>{summary}</p>

      {error && (
        <div style={styles.errorBanner}>
          {error}
          <button onClick={() => setError("")} style={styles.errorDismiss}>
            &times;
          </button>
        </div>
      )}

      {/* Batch actions */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        <button onClick={acceptAll} style={styles.batchAccept}>
          Accept All
        </button>
        <button onClick={rejectAll} style={styles.batchReject}>
          Reject All
        </button>
        <div style={{ flex: 1 }} />
        <button
          onClick={handleSaveAccepted}
          disabled={acceptedCount === 0 || saving}
          style={
            acceptedCount > 0 && !saving
              ? styles.primaryButton
              : { ...styles.primaryButton, opacity: 0.5, cursor: "not-allowed" }
          }
        >
          {saving
            ? "Saving..."
            : `Save ${acceptedCount} Scenario${acceptedCount !== 1 ? "s" : ""}`}
        </button>
        <button
          onClick={() => {
            setView("input");
            setScenarios([]);
          }}
          style={styles.secondaryButton}
        >
          Start Over
        </button>
      </div>

      {/* Scenario cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {scenarios.map((scenario) => (
          <ScenarioCard
            key={scenario.tempId}
            scenario={scenario}
            onAccept={() => toggleAccept(scenario.tempId)}
            onReject={() => toggleReject(scenario.tempId)}
          />
        ))}
      </div>
    </div>
  );
}

// ── Scenario Card Component ──

function ScenarioCard({
  scenario,
  onAccept,
  onReject,
}: {
  scenario: GeneratedScenario;
  onAccept: () => void;
  onReject: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const borderColor =
    scenario.accepted === true
      ? "#22c55e"
      : scenario.accepted === false
        ? "#ef4444"
        : "#e5e7eb";

  return (
    <div
      style={{
        border: `2px solid ${borderColor}`,
        borderRadius: 8,
        padding: 16,
        background: scenario.accepted === false ? "#fef2f2" : "#fff",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 12,
        }}
      >
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: "0 0 4px", fontSize: 16 }}>{scenario.name}</h3>
          <p style={{ margin: "0 0 8px", color: "#6b7280", fontSize: 14 }}>
            {scenario.description}
          </p>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <span style={styles.badge}>{scenario.platform}</span>
            {scenario.tags.map((tag) => (
              <span key={tag} style={styles.badge}>
                {tag}
              </span>
            ))}
            <span style={{ ...styles.badge, background: "#dbeafe", color: "#1d4ed8" }}>
              {scenario.events.length} steps
            </span>
          </div>
        </div>

        <div style={{ display: "flex", gap: 6 }}>
          <button
            onClick={onAccept}
            style={
              scenario.accepted === true
                ? styles.acceptBtnActive
                : styles.acceptBtn
            }
            title="Accept"
          >
            &#10003;
          </button>
          <button
            onClick={onReject}
            style={
              scenario.accepted === false
                ? styles.rejectBtnActive
                : styles.rejectBtn
            }
            title="Reject"
          >
            &#10007;
          </button>
        </div>
      </div>

      {/* Expand steps */}
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          ...styles.secondaryButton,
          fontSize: 13,
          padding: "4px 10px",
          marginTop: 10,
        }}
      >
        {expanded ? "Hide Steps" : "Show Steps"}
      </button>

      {expanded && (
        <div style={{ marginTop: 12 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr>
                <th style={styles.th}>#</th>
                <th style={styles.th}>Type</th>
                <th style={styles.th}>Selector</th>
                <th style={styles.th}>Value</th>
              </tr>
            </thead>
            <tbody>
              {scenario.events.map((evt, i) => (
                <tr key={i}>
                  <td style={styles.td}>{i + 1}</td>
                  <td style={styles.td}>
                    <code>{evt.type}</code>
                  </td>
                  <td style={styles.td}>
                    <code style={{ fontSize: 12 }}>
                      {evt.selectors[0]?.value ?? "—"}
                    </code>
                  </td>
                  <td style={styles.td}>{evt.value ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Styles ──

const styles: Record<string, React.CSSProperties> = {
  input: {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #d1d5db",
    borderRadius: 6,
    fontSize: 14,
    marginBottom: 16,
    boxSizing: "border-box",
  },
  select: {
    padding: "6px 10px",
    border: "1px solid #d1d5db",
    borderRadius: 6,
    fontSize: 14,
    marginTop: 4,
  },
  fieldLabel: {
    display: "flex",
    flexDirection: "column",
    fontSize: 13,
    fontWeight: 500,
    color: "#374151",
  },
  tab: {
    padding: "8px 16px",
    border: "1px solid #d1d5db",
    borderRadius: 6,
    background: "#fff",
    cursor: "pointer",
    fontSize: 14,
  },
  tabActive: {
    padding: "8px 16px",
    border: "1px solid #3b82f6",
    borderRadius: 6,
    background: "#eff6ff",
    color: "#1d4ed8",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 600,
  },
  primaryButton: {
    padding: "10px 20px",
    background: "#3b82f6",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  },
  secondaryButton: {
    padding: "8px 16px",
    background: "#fff",
    color: "#374151",
    border: "1px solid #d1d5db",
    borderRadius: 6,
    fontSize: 14,
    cursor: "pointer",
  },
  batchAccept: {
    padding: "8px 14px",
    background: "#f0fdf4",
    color: "#166534",
    border: "1px solid #86efac",
    borderRadius: 6,
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
  },
  batchReject: {
    padding: "8px 14px",
    background: "#fef2f2",
    color: "#991b1b",
    border: "1px solid #fca5a5",
    borderRadius: 6,
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
  },
  acceptBtn: {
    width: 34,
    height: 34,
    border: "1px solid #d1d5db",
    borderRadius: 6,
    background: "#fff",
    cursor: "pointer",
    fontSize: 16,
    color: "#6b7280",
  },
  acceptBtnActive: {
    width: 34,
    height: 34,
    border: "2px solid #22c55e",
    borderRadius: 6,
    background: "#f0fdf4",
    cursor: "pointer",
    fontSize: 16,
    color: "#16a34a",
    fontWeight: 700,
  },
  rejectBtn: {
    width: 34,
    height: 34,
    border: "1px solid #d1d5db",
    borderRadius: 6,
    background: "#fff",
    cursor: "pointer",
    fontSize: 16,
    color: "#6b7280",
  },
  rejectBtnActive: {
    width: 34,
    height: 34,
    border: "2px solid #ef4444",
    borderRadius: 6,
    background: "#fef2f2",
    cursor: "pointer",
    fontSize: 16,
    color: "#dc2626",
    fontWeight: 700,
  },
  badge: {
    display: "inline-block",
    padding: "2px 8px",
    borderRadius: 4,
    background: "#f3f4f6",
    color: "#374151",
    fontSize: 12,
    fontWeight: 500,
  },
  errorBanner: {
    padding: "10px 14px",
    background: "#fef2f2",
    border: "1px solid #fca5a5",
    borderRadius: 6,
    color: "#991b1b",
    marginBottom: 16,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: 14,
  },
  errorDismiss: {
    background: "none",
    border: "none",
    color: "#991b1b",
    fontSize: 18,
    cursor: "pointer",
    padding: "0 4px",
  },
  progressCard: {
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    padding: 20,
    marginBottom: 16,
    background: "#fafafa",
  },
  progressHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  phaseLabel: {
    textTransform: "capitalize" as const,
    fontWeight: 600,
    fontSize: 14,
    color: "#3b82f6",
  },
  progressBarTrack: {
    width: "100%",
    height: 8,
    background: "#e5e7eb",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    background: "#3b82f6",
    borderRadius: 4,
    transition: "width 0.3s ease",
  },
  th: {
    textAlign: "left" as const,
    padding: 8,
    borderBottom: "2px solid #e5e7eb",
    fontWeight: 600,
  },
  td: {
    padding: 8,
    borderBottom: "1px solid #f3f4f6",
  },
};
