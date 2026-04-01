import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { buildApp } from "../index.js";
import type { FastifyInstance } from "fastify";

let app: FastifyInstance;
let scenarioId: string;

beforeAll(async () => {
  process.env.DATABASE_URL = ":memory:";
  app = await buildApp();
  await app.ready();

  // Create a scenario to run executions against
  const res = await app.inject({
    method: "POST",
    url: "/api/scenarios",
    payload: {
      name: "Exec Test Scenario",
      platform: "web",
      events: [{ type: "navigate", timestamp: 0, selectors: [], value: "http://example.com" }],
    },
  });
  scenarioId = JSON.parse(res.payload).id;
});

afterAll(async () => {
  await app.close();
});

describe("Execution routes", () => {
  it("POST /api/scenarios/:id/run queues an execution", async () => {
    const res = await app.inject({
      method: "POST",
      url: `/api/scenarios/${scenarioId}/run`,
    });

    expect(res.statusCode).toBe(202);
    const body = JSON.parse(res.payload);
    expect(body.status).toBe("queued");
    expect(body.scenarioId).toBe(scenarioId);
    expect(body.id).toBeDefined();
  });

  it("POST /api/scenarios/:id/run returns 404 for missing scenario", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/scenarios/nonexistent/run",
    });
    expect(res.statusCode).toBe(404);
  });

  it("GET /api/executions lists executions", async () => {
    const res = await app.inject({ method: "GET", url: "/api/executions" });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.length).toBeGreaterThanOrEqual(1);
    const ours = body.find((e: any) => e.scenarioId === scenarioId);
    expect(ours).toBeDefined();
  });

  it("GET /api/executions/:id returns execution with steps", async () => {
    // First create one
    const createRes = await app.inject({
      method: "POST",
      url: `/api/scenarios/${scenarioId}/run`,
    });
    const { id } = JSON.parse(createRes.payload);

    const res = await app.inject({ method: "GET", url: `/api/executions/${id}` });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.id).toBe(id);
    expect(body.steps).toBeDefined();
    expect(Array.isArray(body.steps)).toBe(true);
  });

  it("GET /api/executions/:id returns 404 for missing", async () => {
    const res = await app.inject({ method: "GET", url: "/api/executions/nonexistent" });
    expect(res.statusCode).toBe(404);
  });
});
