import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { runMigrations } from "./migrations";

/**
 * Location of the application database: `TODAI_DB_PATH` if set, otherwise
 * `data/todai.db` under the project root.
 */
export function getDatabasePath(): string {
  return process.env.TODAI_DB_PATH ?? path.join(process.cwd(), "data", "todai.db");
}

/**
 * Opens a SQLite database, applies safety/performance pragmas and runs
 * pending migrations.
 *
 * @param filename A file path, or `":memory:"` for an in-memory database (tests).
 */
export function openDatabase(filename: string): Database.Database {
  if (filename !== ":memory:") {
    fs.mkdirSync(path.dirname(filename), { recursive: true });
  }

  const db = new Database(filename);

  // Write-ahead logging: readers never block writers, and commits are atomic
  // and crash-safe. NORMAL sync is durable in WAL mode except on power loss
  // mid-checkpoint, which is the recommended trade-off for app databases.
  db.pragma("journal_mode = WAL");
  db.pragma("synchronous = NORMAL");
  db.pragma("foreign_keys = ON");
  // Wait instead of failing immediately if another connection holds a lock.
  db.pragma("busy_timeout = 5000");

  runMigrations(db);
  return db;
}

// Next.js dev mode re-evaluates modules on every change (HMR). Caching the
// connection on `globalThis` prevents leaking a new connection each time.
const globalForDb = globalThis as unknown as { todaiDb?: Database.Database };

/**
 * Returns the application's shared database connection, opening it lazily
 * on first use (see {@link getDatabasePath}).
 */
export function getDb(): Database.Database {
  globalForDb.todaiDb ??= openDatabase(getDatabasePath());
  return globalForDb.todaiDb;
}
