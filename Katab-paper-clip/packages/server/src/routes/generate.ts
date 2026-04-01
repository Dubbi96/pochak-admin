import type { FastifyPluginAsync } from "fastify";
import type {
  GenerationRequest,
  GenerationProgress,
  GeneratedScenario,
  GenerationResult,
  RecordingEvent,
  Platform,
} from "@katab/types";

// In-memory store for generation sessions
const generations = new Map<
  string,
  { request: GenerationRequest; result?: GenerationResult; error?: string }
>();

export const generateRoutes: FastifyPluginAsync = async (app) => {
  // POST /api/generate — start AI generation, returns SSE stream
  app.post<{ Body: GenerationRequest }>("/generate", async (req, reply) => {
    const input = req.body;
    const id = crypto.randomUUID();

    if (!input.source || !input.content || !input.platform) {
      reply.code(400);
      return { error: "source, content, and platform are required" };
    }

    generations.set(id, { request: input });

    // Set SSE headers
    reply.raw.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
    });

    const send = (data: GenerationProgress) => {
      reply.raw.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    try {
      const scenarios = await runGeneration(id, input, send);

      const result: GenerationResult = {
        id,
        scenarios,
        summary: `Generated ${scenarios.length} test scenario(s) from ${input.source} input.`,
      };
      generations.set(id, { request: input, result });

      send({
        id,
        phase: "complete",
        message: result.summary,
        scenariosGenerated: scenarios.length,
        scenariosTotal: scenarios.length,
      });

      // Send result as a final event
      reply.raw.write(
        `event: result\ndata: ${JSON.stringify(result)}\n\n`,
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Generation failed";
      generations.set(id, { request: input, error: message });
      send({
        id,
        phase: "error",
        message,
        scenariosGenerated: 0,
        scenariosTotal: 0,
      });
    }

    reply.raw.end();
  });

  // GET /api/generate/:id — retrieve completed generation result
  app.get<{ Params: { id: string } }>("/generate/:id", async (req, reply) => {
    const session = generations.get(req.params.id);
    if (!session) {
      reply.code(404);
      return { error: "Generation not found" };
    }
    if (session.error) {
      return { id: req.params.id, error: session.error };
    }
    if (!session.result) {
      return { id: req.params.id, status: "in_progress" };
    }
    return session.result;
  });
};

// ── AI Generation Logic ──

async function runGeneration(
  id: string,
  input: GenerationRequest,
  send: (data: GenerationProgress) => void,
): Promise<GeneratedScenario[]> {
  const maxScenarios = input.options?.maxScenarios ?? 3;

  // Phase 1: Analyzing
  send({
    id,
    phase: "analyzing",
    message:
      input.source === "url"
        ? `Analyzing application at ${input.content}...`
        : "Analyzing provided source code...",
    scenariosGenerated: 0,
    scenariosTotal: maxScenarios,
  });

  await delay(800);

  // Phase 2: Generating scenarios
  const scenarios: GeneratedScenario[] = [];
  const templates = getScenarioTemplates(input);

  for (let i = 0; i < Math.min(maxScenarios, templates.length); i++) {
    const template = templates[i];
    send({
      id,
      phase: "generating",
      message: `Generating scenario: ${template.name}...`,
      scenariosGenerated: i,
      scenariosTotal: maxScenarios,
      currentScenario: template.name,
    });

    await delay(600);

    scenarios.push({
      tempId: crypto.randomUUID(),
      name: template.name,
      description: template.description,
      platform: input.platform,
      events: template.events,
      tags: template.tags,
    });
  }

  // Phase 3: Validating
  send({
    id,
    phase: "validating",
    message: "Validating generated scenarios...",
    scenariosGenerated: scenarios.length,
    scenariosTotal: scenarios.length,
  });

  await delay(400);

  return scenarios;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

interface ScenarioTemplate {
  name: string;
  description: string;
  events: RecordingEvent[];
  tags: string[];
}

function getScenarioTemplates(input: GenerationRequest): ScenarioTemplate[] {
  const baseURL =
    input.source === "url" ? input.content : "http://localhost:3000";

  return [
    {
      name: "Homepage Navigation",
      description: "Verify homepage loads and primary navigation works",
      events: [
        {
          type: "navigate",
          timestamp: 0,
          selectors: [],
          value: baseURL,
        },
        {
          type: "assert",
          timestamp: 500,
          selectors: [{ strategy: "css", value: "body", confidence: 1 }],
          metadata: {
            assertionType: "element-visible",
          },
        },
        {
          type: "click",
          timestamp: 1000,
          selectors: [
            { strategy: "css", value: "nav a:first-child", confidence: 0.8 },
          ],
        },
      ],
      tags: ["navigation", "smoke"],
    },
    {
      name: "Form Submission Flow",
      description:
        "Test primary form input, validation, and submission behavior",
      events: [
        {
          type: "navigate",
          timestamp: 0,
          selectors: [],
          value: baseURL,
        },
        {
          type: "click",
          timestamp: 500,
          selectors: [
            { strategy: "css", value: "form input:first-of-type", confidence: 0.7 },
          ],
        },
        {
          type: "fill",
          timestamp: 1000,
          selectors: [
            { strategy: "css", value: "form input:first-of-type", confidence: 0.7 },
          ],
          value: "test@example.com",
        },
        {
          type: "click",
          timestamp: 1500,
          selectors: [
            { strategy: "css", value: "form button[type='submit']", confidence: 0.7 },
          ],
        },
        {
          type: "assert",
          timestamp: 2000,
          selectors: [{ strategy: "css", value: "body", confidence: 1 }],
          metadata: { assertionType: "url-contains", expected: "/" },
        },
      ],
      tags: ["form", "validation"],
    },
    {
      name: "Login Authentication",
      description: "Test login flow with credential entry and redirect",
      events: [
        {
          type: "navigate",
          timestamp: 0,
          selectors: [],
          value: `${baseURL}/login`,
        },
        {
          type: "fill",
          timestamp: 500,
          selectors: [
            { strategy: "css", value: "input[type='email'], input[name='email']", confidence: 0.8 },
          ],
          value: "user@example.com",
        },
        {
          type: "fill",
          timestamp: 1000,
          selectors: [
            { strategy: "css", value: "input[type='password']", confidence: 0.9 },
          ],
          value: "password123",
        },
        {
          type: "click",
          timestamp: 1500,
          selectors: [
            { strategy: "css", value: "button[type='submit']", confidence: 0.8 },
          ],
        },
      ],
      tags: ["auth", "login"],
    },
    {
      name: "Responsive Layout Check",
      description: "Verify key elements are visible at different viewports",
      events: [
        {
          type: "navigate",
          timestamp: 0,
          selectors: [],
          value: baseURL,
        },
        {
          type: "assert",
          timestamp: 500,
          selectors: [{ strategy: "css", value: "header, nav", confidence: 0.7 }],
          metadata: { assertionType: "element-visible" },
        },
        {
          type: "assert",
          timestamp: 1000,
          selectors: [{ strategy: "css", value: "main, [role='main']", confidence: 0.7 }],
          metadata: { assertionType: "element-visible" },
        },
      ],
      tags: ["layout", "responsive"],
    },
    {
      name: "Error Handling",
      description: "Navigate to invalid route and verify error state",
      events: [
        {
          type: "navigate",
          timestamp: 0,
          selectors: [],
          value: `${baseURL}/nonexistent-page-404`,
        },
        {
          type: "assert",
          timestamp: 500,
          selectors: [{ strategy: "css", value: "body", confidence: 1 }],
          metadata: { assertionType: "element-visible" },
        },
      ],
      tags: ["error-handling", "404"],
    },
  ];
}
