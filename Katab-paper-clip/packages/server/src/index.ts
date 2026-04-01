import Fastify from "fastify";
import cors from "@fastify/cors";
import { scenarioRoutes } from "./routes/scenarios.js";
import { executionRoutes } from "./routes/executions.js";
import { generateRoutes } from "./routes/generate.js";
import { healthRoutes } from "./routes/health.js";

const PORT = Number(process.env.PORT) || 3001;

async function main() {
  const app = Fastify({ logger: true });

  await app.register(cors, { origin: true });
  await app.register(healthRoutes);
  await app.register(scenarioRoutes, { prefix: "/api" });
  await app.register(executionRoutes, { prefix: "/api" });
  await app.register(generateRoutes, { prefix: "/api" });

  await app.listen({ port: PORT, host: "0.0.0.0" });
  console.log(`Katab server running on http://localhost:${PORT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
