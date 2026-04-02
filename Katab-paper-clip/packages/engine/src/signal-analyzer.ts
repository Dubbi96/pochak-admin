import type { StepResult, StepStatus } from "@katab/types";

export interface ScenarioSignal {
  status: "passed" | "failed" | "warning" | "skipped" | "error";
  totalSteps: number;
  passedSteps: number;
  failedSteps: number;
  warningSteps: number;
  skippedSteps: number;
  errorSteps: number;
  totalDuration: number;
  failedAssertions: number;
}

/**
 * Analyzes step results to produce a 5-level scenario classification.
 *
 * Classification rules:
 * - error: any step returned "error"
 * - failed: any step returned "failed" (no errors)
 * - warning: any step returned "warning" (no errors or failures)
 * - skipped: all steps were skipped
 * - passed: all steps passed (may include skipped)
 */
export function analyzeSignal(results: StepResult[]): ScenarioSignal {
  if (results.length === 0) {
    return {
      status: "skipped",
      totalSteps: 0,
      passedSteps: 0,
      failedSteps: 0,
      warningSteps: 0,
      skippedSteps: 0,
      errorSteps: 0,
      totalDuration: 0,
      failedAssertions: 0,
    };
  }

  const counts: Record<StepStatus, number> = {
    passed: 0,
    failed: 0,
    warning: 0,
    skipped: 0,
    error: 0,
  };

  let totalDuration = 0;
  let failedAssertions = 0;

  for (const r of results) {
    counts[r.status]++;
    totalDuration += r.duration;
    failedAssertions += r.assertions.filter((a) => !a.passed).length;
  }

  let status: ScenarioSignal["status"];
  if (counts.error > 0) {
    status = "error";
  } else if (counts.failed > 0) {
    status = "failed";
  } else if (counts.warning > 0) {
    status = "warning";
  } else if (counts.passed === 0 && counts.skipped > 0) {
    status = "skipped";
  } else {
    status = "passed";
  }

  return {
    status,
    totalSteps: results.length,
    passedSteps: counts.passed,
    failedSteps: counts.failed,
    warningSteps: counts.warning,
    skippedSteps: counts.skipped,
    errorSteps: counts.error,
    totalDuration,
    failedAssertions,
  };
}
