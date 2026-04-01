import { describe, it, expect } from "vitest";
import { analyzeSignal } from "./signal-analyzer.js";
import type { StepResult } from "@katab/types";

function makeStep(status: StepResult["status"], duration = 100, assertions: StepResult["assertions"] = []): StepResult {
  return { status, duration, assertions, logs: [] };
}

describe("analyzeSignal", () => {
  it("returns skipped for empty results", () => {
    const signal = analyzeSignal([]);
    expect(signal.status).toBe("skipped");
    expect(signal.totalSteps).toBe(0);
  });

  it("returns passed when all steps pass", () => {
    const signal = analyzeSignal([makeStep("passed"), makeStep("passed"), makeStep("passed")]);
    expect(signal.status).toBe("passed");
    expect(signal.passedSteps).toBe(3);
    expect(signal.totalSteps).toBe(3);
  });

  it("returns failed when any step fails", () => {
    const signal = analyzeSignal([makeStep("passed"), makeStep("failed"), makeStep("passed")]);
    expect(signal.status).toBe("failed");
    expect(signal.failedSteps).toBe(1);
  });

  it("returns error when any step errors", () => {
    const signal = analyzeSignal([makeStep("passed"), makeStep("error")]);
    expect(signal.status).toBe("error");
    expect(signal.errorSteps).toBe(1);
  });

  it("error takes priority over failed", () => {
    const signal = analyzeSignal([makeStep("failed"), makeStep("error")]);
    expect(signal.status).toBe("error");
  });

  it("returns warning when any step warns but none fail or error", () => {
    const signal = analyzeSignal([makeStep("passed"), makeStep("warning")]);
    expect(signal.status).toBe("warning");
    expect(signal.warningSteps).toBe(1);
  });

  it("returns skipped when all steps are skipped", () => {
    const signal = analyzeSignal([makeStep("skipped"), makeStep("skipped")]);
    expect(signal.status).toBe("skipped");
  });

  it("returns passed when mix of passed and skipped", () => {
    const signal = analyzeSignal([makeStep("passed"), makeStep("skipped")]);
    expect(signal.status).toBe("passed");
  });

  it("sums durations correctly", () => {
    const signal = analyzeSignal([makeStep("passed", 50), makeStep("passed", 150)]);
    expect(signal.totalDuration).toBe(200);
  });

  it("counts failed assertions", () => {
    const signal = analyzeSignal([
      makeStep("passed", 100, [
        { type: "url-contains", expected: "/home", actual: "/home", passed: true },
        { type: "element-visible", expected: true, actual: false, passed: false },
      ]),
    ]);
    expect(signal.failedAssertions).toBe(1);
  });
});
