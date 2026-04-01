import { Worker } from "bullmq";
import { runExecutionDirect } from "./run-execution.js";

/**
 * BullMQ worker for processing execution jobs.
 * Only starts if Redis is available.
 */
export function startWorker(): void {
  const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

  try {
    const url = new URL(redisUrl);
    const worker = new Worker(
      "katab-executions",
      async (job) => {
        const { executionId } = job.data as { executionId: string };
        await runExecutionDirect(executionId);
      },
      {
        connection: { host: url.hostname, port: Number(url.port) || 6379 },
        concurrency: 2,
      },
    );

    worker.on("completed", (job) => {
      console.log(`Execution job ${job.id} completed`);
    });

    worker.on("failed", (job, err) => {
      console.error(`Execution job ${job?.id} failed:`, err.message);
    });

    console.log("BullMQ worker started");
  } catch (err) {
    console.warn("BullMQ worker not started (Redis unavailable):", (err as Error).message);
  }
}
