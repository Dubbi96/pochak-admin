import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { buildApp } from "../index.js";
import type { FastifyInstance } from "fastify";

let app: FastifyInstance;

beforeAll(async () => {
  process.env.DATABASE_URL = ":memory:";
  app = await buildApp();
  await app.ready();
});

afterAll(async () => {
  await app.close();
});

describe("Scenario routes", () => {
  let scenarioId: string;

  it("POST /api/scenarios creates a scenario", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/scenarios",
      payload: {
        name: "Test Scenario",
        platform: "web",
        events: [{ type: "navigate", timestamp: 0, selectors: [], value: "http://example.com" }],
        tags: ["smoke"],
      },
    });

    expect(res.statusCode).toBe(201);
    const body = JSON.parse(res.payload);
    expect(body.id).toBeDefined();
    expect(body.name).toBe("Test Scenario");
    scenarioId = body.id;
  });

  it("GET /api/scenarios lists scenarios", async () => {
    const res = await app.inject({ method: "GET", url: "/api/scenarios" });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.length).toBeGreaterThanOrEqual(1);
    const ours = body.find((s: any) => s.id === scenarioId);
    expect(ours).toBeDefined();
    expect(ours.name).toBe("Test Scenario");
    expect(ours.tags).toEqual(["smoke"]);
  });

  it("GET /api/scenarios/:id returns a scenario", async () => {
    const res = await app.inject({ method: "GET", url: `/api/scenarios/${scenarioId}` });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.name).toBe("Test Scenario");
    expect(body.events).toHaveLength(1);
  });

  it("GET /api/scenarios/:id returns 404 for missing", async () => {
    const res = await app.inject({ method: "GET", url: "/api/scenarios/nonexistent" });
    expect(res.statusCode).toBe(404);
  });

  it("PATCH /api/scenarios/:id updates a scenario", async () => {
    const res = await app.inject({
      method: "PATCH",
      url: `/api/scenarios/${scenarioId}`,
      payload: { name: "Updated Scenario", tags: ["smoke", "regression"] },
    });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.name).toBe("Updated Scenario");
  });

  it("DELETE /api/scenarios/:id removes a scenario", async () => {
    const res = await app.inject({ method: "DELETE", url: `/api/scenarios/${scenarioId}` });
    expect(res.statusCode).toBe(204);

    const check = await app.inject({ method: "GET", url: `/api/scenarios/${scenarioId}` });
    expect(check.statusCode).toBe(404);
  });

  it("DELETE /api/scenarios/:id returns 404 for missing", async () => {
    const res = await app.inject({ method: "DELETE", url: "/api/scenarios/nonexistent" });
    expect(res.statusCode).toBe(404);
  });
});
