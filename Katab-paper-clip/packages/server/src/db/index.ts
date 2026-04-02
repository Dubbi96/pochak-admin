import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema.js";
import { existsSync, mkdirSync } from "fs";
import { dirname } from "path";

const DB_PATH = process.env.DATABASE_URL || "./data/katab.db";

let sqlite: Database.Database;

if (DB_PATH === ":memory:") {
  sqlite = new Database(":memory:");
} else {
  const dir = dirname(DB_PATH);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  sqlite = new Database(DB_PATH);
}

sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

// Auto-create tables if they don't exist
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS scenarios (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    platform TEXT NOT NULL,
    metadata TEXT NOT NULL DEFAULT '{}',
    events TEXT NOT NULL DEFAULT '[]',
    tags TEXT NOT NULL DEFAULT '[]',
    tc_id TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS executions (
    id TEXT PRIMARY KEY,
    scenario_id TEXT NOT NULL REFERENCES scenarios(id),
    status TEXT NOT NULL,
    progress REAL NOT NULL DEFAULT 0,
    environment TEXT NOT NULL DEFAULT '{}',
    started_at TEXT NOT NULL,
    completed_at TEXT
  );

  CREATE TABLE IF NOT EXISTS execution_steps (
    id TEXT PRIMARY KEY,
    execution_id TEXT NOT NULL REFERENCES executions(id),
    event_index INTEGER NOT NULL,
    status TEXT NOT NULL,
    duration REAL NOT NULL DEFAULT 0,
    assertions TEXT NOT NULL DEFAULT '[]',
    screenshot TEXT,
    logs TEXT NOT NULL DEFAULT '[]'
  );

  CREATE TABLE IF NOT EXISTS reports (
    id TEXT PRIMARY KEY,
    execution_id TEXT NOT NULL REFERENCES executions(id),
    format TEXT NOT NULL,
    content TEXT NOT NULL,
    generated_at TEXT NOT NULL
  );
`);

export const db = drizzle(sqlite, { schema });
