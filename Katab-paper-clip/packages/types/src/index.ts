// ── Recording Types ──

export type Platform = "web" | "ios" | "android";

export type EventType =
  | "click"
  | "fill"
  | "select"
  | "navigate"
  | "scroll"
  | "type"
  | "hover"
  | "keyboard"
  | "wait"
  | "assert";

export interface Selector {
  strategy: "data-testid" | "id" | "name" | "aria-label" | "css" | "xpath";
  value: string;
  confidence: number;
}

export interface RecordingEvent {
  type: EventType;
  timestamp: number;
  selectors: Selector[];
  value?: string;
  metadata?: Record<string, unknown>;
}

export interface RecordingScenario {
  id: string;
  name: string;
  platform: Platform;
  metadata: {
    browser?: string;
    viewport?: { width: number; height: number };
    baseURL?: string;
    deviceName?: string;
    osVersion?: string;
  };
  events: RecordingEvent[];
  variables?: Record<string, string>;
  includes?: LinkedScenarioRef[];
  tags?: string[];
  tcId?: string;
}

export interface LinkedScenarioRef {
  scenarioId: string;
  alias?: string;
}

// ── Execution Types ──

export type ExecutionStatus =
  | "queued"
  | "running"
  | "passed"
  | "failed"
  | "cancelled"
  | "error";

export type StepStatus = "passed" | "failed" | "warning" | "skipped" | "error";

export interface StepResult {
  status: StepStatus;
  duration: number;
  assertions: AssertionResult[];
  screenshot?: string;
  logs: string[];
}

export interface AssertionResult {
  type: string;
  expected: unknown;
  actual: unknown;
  passed: boolean;
  message?: string;
}

export interface Execution {
  id: string;
  scenarioId: string;
  status: ExecutionStatus;
  progress: number;
  environment: ExecutionEnvironment;
  steps: ExecutionStep[];
  startedAt: string;
  completedAt?: string;
}

export interface ExecutionStep {
  id: string;
  executionId: string;
  eventIndex: number;
  status: StepStatus;
  duration: number;
  assertions: AssertionResult[];
  screenshot?: string;
  logs: string[];
}

export interface ExecutionEnvironment {
  platform: Platform;
  browser?: string;
  deviceName?: string;
  baseURL?: string;
  variables?: Record<string, string>;
}

// ── Scenario CRUD ──

export interface ScenarioCreateInput {
  name: string;
  platform: Platform;
  metadata?: RecordingScenario["metadata"];
  events: RecordingEvent[];
  tags?: string[];
  tcId?: string;
}

export interface ScenarioUpdateInput {
  name?: string;
  metadata?: RecordingScenario["metadata"];
  events?: RecordingEvent[];
  tags?: string[];
  tcId?: string;
}

// ── Report Types ──

export type ReportFormat = "json" | "html" | "junit";

export interface Report {
  id: string;
  executionId: string;
  format: ReportFormat;
  content: string;
  generatedAt: string;
}

// ── AI Generation Types ──

export interface GenerationRequest {
  source: "code" | "url";
  content: string; // source code or URL
  platform: Platform;
  options?: {
    maxScenarios?: number;
    includeAssertions?: boolean;
    description?: string;
  };
}

export type GenerationPhase =
  | "analyzing"
  | "generating"
  | "validating"
  | "complete"
  | "error";

export interface GenerationProgress {
  id: string;
  phase: GenerationPhase;
  message: string;
  scenariosGenerated: number;
  scenariosTotal: number;
  currentScenario?: string;
}

export interface GeneratedScenario {
  tempId: string;
  name: string;
  description: string;
  platform: Platform;
  events: RecordingEvent[];
  tags: string[];
  accepted?: boolean;
}

export interface GenerationResult {
  id: string;
  scenarios: GeneratedScenario[];
  summary: string;
}

// ── Assertion Types ──

export type AssertionType =
  | "element-visible"
  | "element-hidden"
  | "text-contains"
  | "text-equals"
  | "url-contains"
  | "url-equals"
  | "title-contains"
  | "title-equals"
  | "element-count"
  | "attribute-equals"
  | "css-property"
  | "value-equals";

export interface AssertionDefinition {
  type: AssertionType;
  selector?: string;
  expected: unknown;
}

// ── Recorder Types ──

export interface RecorderOptions {
  baseURL?: string;
  browser?: "chromium" | "firefox" | "webkit";
  viewport?: { width: number; height: number };
}

// ── Step Executor Interface ──

export interface ExecutionContext {
  execution: Execution;
  environment: ExecutionEnvironment;
  variables: Record<string, string>;
}

export interface StepExecutor {
  execute(event: RecordingEvent, context: ExecutionContext): Promise<StepResult>;
  cleanup(): Promise<void>;
}
