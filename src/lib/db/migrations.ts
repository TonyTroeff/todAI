import type Database from "better-sqlite3";

/**
 * Ordered list of schema migrations.
 *
 * Each entry's position defines its version: the migration at index `i`
 * upgrades the schema from version `i` to `i + 1`. The current version is
 * tracked in SQLite's built-in `PRAGMA user_version`.
 *
 * Rules:
 * - Never edit or reorder a migration that has already shipped.
 * - To change the schema, append a new migration to the end of the list.
 */
const migrations: readonly string[] = [
  // v1 — tasks table
  `
  CREATE TABLE tasks (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    title       TEXT    NOT NULL CHECK (length(title) BETWEEN 1 AND 200),
    description TEXT    NOT NULL DEFAULT '' CHECK (length(description) <= 5000),
    created_at  TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    updated_at  TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
  );
  CREATE INDEX idx_tasks_updated_at ON tasks (updated_at DESC, id DESC);
  `,
  // v2 — optional task priority and calendar due date
  `
  ALTER TABLE tasks ADD COLUMN priority INTEGER NOT NULL DEFAULT 3
    CHECK (typeof(priority) = 'integer' AND priority BETWEEN 1 AND 4);
  ALTER TABLE tasks ADD COLUMN due_date TEXT;
  `,
  // v3 — completion flag
  `
  ALTER TABLE tasks ADD COLUMN completed INTEGER NOT NULL DEFAULT 0
    CHECK (completed IN (0, 1));
  `,
];

/**
 * Brings the database schema up to date.
 *
 * All pending migrations run inside a single transaction, so a failure
 * leaves the database untouched at its previous version.
 */
export function runMigrations(db: Database.Database): void {
  const current = db.pragma("user_version", { simple: true }) as number;
  if (current >= migrations.length) return;

  db.transaction(() => {
    for (let version = current; version < migrations.length; version++) {
      db.exec(migrations[version]);
    }
    db.pragma(`user_version = ${migrations.length}`);
  })();
}
