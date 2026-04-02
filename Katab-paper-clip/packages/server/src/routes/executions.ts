import type { FastifyPluginAsync } from "fastify";
import { db } from "../db/index.js";
import { executions, executionSteps, scenarios } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { runExecutionDirect } from "../execution/run-execution.js";
import { addSSEClient } from "../execution/sse.js";

let queue: { add: (name: string, data: unknown) => Promise<unknown> } | null = null;

async function tryInitQueue(): Promise<boolean> {
  if (queue) return true;
  try {
    const { Queue } = await import("bullmq");
    const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
    const url = new URL(redisUrl);
    queue = new Queue("katab-executions", {
      connection: { host: url.hostname, port: Number(url.port) || 6379 },
    });
    return true;
  } catch {
    return false;
  }
}

export const executionRoutes: FastifyPluginAsync = async (app) => {
  // POST /scenarios/:id/run — trigger execution
  app.post<{ Params: { id: string } }>("/scenarios/:id/run", async (req, reply) => {
    const scenario = db.select().from(scenarios).where(eq(scenarios.id, req.params.id)).get();
    if (!scenario) {
      reply.code(404);
      return { error: "Scenario not found" };
    }

    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    db.insert(executions).values({
      id,
      scenarioId: req.params.id,
      status: "queued",
      progress: 0,
      environment: JSON.stringify({ platform: scenario.platform }),
      startedAt: now,
    }).run();

    // Try BullMQ first, fall back to direct execution
    const hasQueue = await tryInitQueue();
    if (hasQueue && queue) {
      await queue.add("run-execution", { executionId: id });
    } else {
      // Direct mode: run in background, don't await
      runExecutionDirect(id).catch((err) => {
        console.error(`Direct execution failed for ${id}:`, err);
      });
    }

    reply.code(202);
    return { id, status: "queued", scenarioId: req.params.id };
  });

  // GET /executions — list all executions
  app.get("/executions", async () => {
    const rows = db.select().from(executions).all();
    return rows.map((r) => ({
      ...r,
      environment: JSON.parse(r.environment as string),
    }));
  });

  // GET /executions/:id — get execution with steps
  app.get<{ Params: { id: string } }>("/executions/:id", async (req, reply) => {
    const row = db.select().from(executions).where(eq(executions.id, req.params.id)).get();
    if (!row) {
      reply.code(404);
      return { error: "Execution not found" };
    }

    const steps = db
      .select()
      .from(executionSteps)
      .where(eq(executionSteps.executionId, req.params.id))
      .all();

    return {
      ...row,
      environment: JSON.parse(row.environment as string),
      steps: steps.map((s) => ({
        ...s,
        assertions: JSON.parse(s.assertions as string),
        logs: JSON.parse(s.logs as string),
      })),
    };
  });

  // GET /executions/:id/stream — SSE for real-time progress
  app.get<{ Params: { id: string } }>("/executions/:id/stream", async (req, reply) => {
    const row = db.select().from(executions).where(eq(executions.id, req.params.id)).get();
    if (!row) {
      reply.code(404);
      return { error: "Execution not found" };
    }

    // If already completed, send final status immediately
    if (["passed", "failed", "error", "cancelled"].includes(row.status)) {
      reply.raw.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "Access-Control-Allow-Origin": "*",
      });
      reply.raw.write(`data: ${JSON.stringify({ type: "status", status: row.status, progress: row.progress })}\n\n`);
      reply.raw.write(`data: ${JSON.stringify({ type: "done" })}\n\n`);
      reply.raw.end();
      return;
    }

    reply.raw.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
    });

    // Send current state
    reply.raw.write(`data: ${JSON.stringify({ type: "status", status: row.status, progress: row.progress })}\n\n`);

    addSSEClient(req.params.id, reply.raw);
  });
};
