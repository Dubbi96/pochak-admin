import { db } from "../db/index.js";
import { executions, executionSteps, scenarios } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { runScenario, analyzeSignal } from "@katab/engine";
import type { RecordingScenario, ExecutionEnvironment, StepResult } from "@katab/types";
import { sseClients } from "./sse.js";

/**
 * Runs a scenario execution directly (no queue).
 * Updates DB rows and broadcasts SSE progress as steps complete.
 */
export async function runExecutionDirect(executionId: string): Promise<void> {
  const exec = db.select().from(executions).where(eq(executions.id, executionId)).get();
  if (!exec) throw new Error(`Execution ${executionId} not found`);

  const scenarioRow = db.select().from(scenarios).where(eq(scenarios.id, exec.scenarioId)).get();
  if (!scenarioRow) throw new Error(`Scenario ${exec.scenarioId} not found`);

  const scenario: RecordingScenario = {
    id: scenarioRow.id,
    name: scenarioRow.name,
    platform: scenarioRow.platform as RecordingScenario["platform"],
    metadata: JSON.parse(scenarioRow.metadata),
    events: JSON.parse(scenarioRow.events),
    tags: JSON.parse(scenarioRow.tags),
    tcId: scenarioRow.tcId ?? undefined,
  };

  const environment: ExecutionEnvironment = JSON.parse(exec.environment);

  // Mark as running
  db.update(executions)
    .set({ status: "running", startedAt: new Date().toISOString() })
    .where(eq(executions.id, executionId))
    .run();

  broadcastSSE(executionId, { type: "status", status: "running", progress: 0 });

  try {
    const results = await runScenario({
      scenario,
      environment,
      onStepComplete: (index: number, result: StepResult) => {
        const stepId = crypto.randomUUID();
        db.insert(executionSteps).values({
          id: stepId,
          executionId,
          eventIndex: index,
          status: result.status,
          duration: result.duration,
          assertions: JSON.stringify(result.assertions),
          screenshot: result.screenshot ?? null,
          logs: JSON.stringify(result.logs),
        }).run();

        const progress = (index + 1) / scenario.events.length;
        db.update(executions)
          .set({ progress })
          .where(eq(executions.id, executionId))
          .run();

        broadcastSSE(executionId, {
          type: "step",
          stepId,
          eventIndex: index,
          status: result.status,
          duration: result.duration,
          progress,
        });
      },
    });

    const signal = analyzeSignal(results);
    const finalStatus = signal.status === "passed" ? "passed" : signal.status === "error" ? "error" : "failed";

    db.update(executions)
      .set({
        status: finalStatus,
        progress: 1,
        completedAt: new Date().toISOString(),
      })
      .where(eq(executions.id, executionId))
      .run();

    broadcastSSE(executionId, { type: "status", status: finalStatus, progress: 1 });
    broadcastSSE(executionId, { type: "done" });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    db.update(executions)
      .set({
        status: "error",
        completedAt: new Date().toISOString(),
      })
      .where(eq(executions.id, executionId))
      .run();

    broadcastSSE(executionId, { type: "error", message });
    broadcastSSE(executionId, { type: "done" });
  }
}

function broadcastSSE(executionId: string, data: Record<string, unknown>) {
  const clients = sseClients.get(executionId);
  if (!clients) return;
  const payload = `data: ${JSON.stringify(data)}\n\n`;
  for (const res of clients) {
    res.write(payload);
  }
  if (data.type === "done") {
    for (const res of clients) {
      res.end();
    }
    sseClients.delete(executionId);
  }
}
