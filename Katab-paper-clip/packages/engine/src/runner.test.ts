import { describe, it, expect, vi } from "vitest";
import { runScenario } from "./runner.js";
import type { RecordingScenario, ExecutionEnvironment } from "@katab/types";

// Mock playwright so WebExecutor doesn't try to launch a real browser
vi.mock("playwright", () => ({
  chromium: {
    launch: vi.fn().mockResolvedValue({
      newContext: vi.fn().mockResolvedValue({
        newPage: vi.fn().mockResolvedValue({
          goto: vi.fn().mockResolvedValue(null),
          click: vi.fn().mockResolvedValue(null),
          fill: vi.fn().mockResolvedValue(null),
          type: vi.fn().mockResolvedValue(null),
          close: vi.fn().mockResolvedValue(null),
          url: vi.fn().mockReturnValue("http://localhost"),
        }),
      }),
      close: vi.fn().mockResolvedValue(null),
    }),
  },
}));

function makeScenario(events: RecordingScenario["events"]): RecordingScenario {
  return {
    id: "test-scenario",
    name: "Test",
    platform: "web",
    metadata: {},
    events,
  };
}

const env: ExecutionEnvironment = { platform: "web" };

describe("runScenario", () => {
  it("returns results for each event", async () => {
    const scenario = makeScenario([
      { type: "navigate", timestamp: 0, selectors: [], value: "http://example.com" },
      { type: "click", timestamp: 100, selectors: [{ strategy: "css", value: "button", confidence: 1 }] },
    ]);

    const results = await runScenario({ scenario, environment: env });
    expect(results).toHaveLength(2);
    expect(results[0].status).toBe("passed");
    expect(results[1].status).toBe("passed");
  });

  it("calls onStepComplete for each step", async () => {
    const scenario = makeScenario([
      { type: "navigate", timestamp: 0, selectors: [], value: "http://example.com" },
    ]);

    const onStepComplete = vi.fn();
    await runScenario({ scenario, environment: env, onStepComplete });
    expect(onStepComplete).toHaveBeenCalledTimes(1);
    expect(onStepComplete).toHaveBeenCalledWith(0, expect.objectContaining({ status: "passed" }));
  });

  it("stops on error status", async () => {
    // Mock playwright to throw on click
    const { chromium } = await import("playwright");
    const mockPage = {
      goto: vi.fn().mockResolvedValue(null),
      click: vi.fn().mockRejectedValue(new Error("Element not found")),
      close: vi.fn().mockResolvedValue(null),
      url: vi.fn().mockReturnValue("http://localhost"),
    };
    vi.mocked(chromium.launch).mockResolvedValueOnce({
      newContext: vi.fn().mockResolvedValue({
        newPage: vi.fn().mockResolvedValue(mockPage),
      }),
      close: vi.fn().mockResolvedValue(null),
    } as any);

    const scenario = makeScenario([
      { type: "navigate", timestamp: 0, selectors: [], value: "http://example.com" },
      { type: "click", timestamp: 100, selectors: [{ strategy: "css", value: "#missing", confidence: 1 }] },
      { type: "navigate", timestamp: 200, selectors: [], value: "http://example.com/page2" },
    ]);

    const results = await runScenario({ scenario, environment: env });
    // Should stop after the error, so only 2 results (navigate + failed click)
    expect(results).toHaveLength(2);
    expect(results[1].status).toBe("error");
  });

  it("throws for unsupported platform", async () => {
    const scenario = makeScenario([]);
    await expect(
      runScenario({ scenario, environment: { platform: "ios" } }),
    ).rejects.toThrow("not yet supported");
  });
});
