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

describe("Health route", () => {
  it("GET /api/health returns ok", async () => {
    const res = await app.inject({ method: "GET", url: "/api/health" });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.status).toBe("ok");
    expect(body.version).toBe("0.1.0");
    expect(body.timestamp).toBeDefined();
  });
});
