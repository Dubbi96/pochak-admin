import Fastify from "fastify";
import cors from "@fastify/cors";
import { scenarioRoutes } from "./routes/scenarios.js";
import { executionRoutes } from "./routes/executions.js";
import { generateRoutes } from "./routes/generate.js";
import { healthRoutes } from "./routes/health.js";

const PORT = Number(process.env.PORT) || 3001;

export async function buildApp() {
  const app = Fastify({ logger: true });

  await app.register(cors, { origin: true });
  await app.register(healthRoutes);
  await app.register(scenarioRoutes, { prefix: "/api" });
  await app.register(executionRoutes, { prefix: "/api" });
  await app.register(generateRoutes, { prefix: "/api" });

  return app;
}

async function main() {
  const app = await buildApp();

  // Start BullMQ worker if Redis is available
  try {
    const { startWorker } = await import("./execution/worker.js");
    startWorker();
  } catch {
    console.log("Running without BullMQ worker (direct execution mode)");
  }

  await app.listen({ port: PORT, host: "0.0.0.0" });
  console.log(`Katab server running on http://localhost:${PORT}`);
}

// Only run when executed directly, not when imported for tests
const isMainModule = process.argv[1]?.endsWith("index.ts") || process.argv[1]?.endsWith("index.js");
if (isMainModule) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
