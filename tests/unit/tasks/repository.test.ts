import type Database from "better-sqlite3";
import { ZodError } from "zod";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { openDatabase } from "@/lib/db/connection";
import { runMigrations } from "@/lib/db/migrations";
import { createTaskRepository, type TaskRepository } from "@/lib/tasks/repository";
import { parseTaskId } from "@/lib/tasks/schema";

let db: Database.Database;
let repo: TaskRepository;

beforeEach(() => {
  db = openDatabase(":memory:");
  repo = createTaskRepository(db);
});

afterEach(() => {
  db.close();
});

describe("task repository", () => {
  it("defaults optional fields and persists every priority and due date", () => {
    const minimal = repo.create({ title: "Minimal" });
    expect(repo.get(minimal.id)).toMatchObject({ priority: 3, dueDate: null, description: "" });
    for (const priority of [1, 2, 3, 4]) {
      const task = repo.create({ title: `Priority ${priority}`, priority, dueDate: "2028-02-29" });
      expect(repo.get(task.id)).toEqual(task);
      expect(task).toMatchObject({ priority, dueDate: "2028-02-29" });
      expect(repo.list({ limit: 10, offset: 0 }).tasks).toContainEqual(task);
      expect(repo.update(task.id, { title: task.title, priority: 2, dueDate: "2026-12-01" }))
        .toMatchObject({ priority: 2, dueDate: "2026-12-01" });
      expect(repo.update(task.id, { title: task.title, priority: 3, dueDate: null }))
        .toMatchObject({ priority: 3, dueDate: null });
    }
  });

  it("rejects out-of-range and fractional priorities and invalid calendar dates", () => {
    for (const priority of [0, 5, -1, 1.5, NaN, Infinity]) {
      expect(() => repo.create({ title: "Invalid priority", priority })).toThrow(ZodError);
    }
    for (const dueDate of ["", "tomorrow", "2026-02-29", "2026-02-30", "2026-13-01", "2026-1-1", "2026-10-02T00:00:00Z"]) {
      expect(() => repo.create({ title: "Invalid date", dueDate })).toThrow(ZodError);
    }
    expect(repo.count()).toBe(0);
    const task = repo.create({ title: "Keep me", priority: 1, dueDate: "2026-11-12" });
    expect(() => repo.update(task.id, { title: "Changed", priority: 5 })).toThrow(ZodError);
    expect(() => repo.update(task.id, { title: "Changed", dueDate: "2026-02-30" })).toThrow(ZodError);
    expect(repo.get(task.id)).toEqual(task);
  });

  it("upgrades existing tasks with defaults without losing data", () => {
    // Recreate the shipped v1 schema and a row before applying the new migration.
    db.exec(`
      DROP TABLE tasks;
      CREATE TABLE tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL CHECK (length(title) BETWEEN 1 AND 200),
        description TEXT NOT NULL DEFAULT '' CHECK (length(description) <= 5000),
        created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
      );
      CREATE INDEX idx_tasks_updated_at ON tasks (updated_at DESC, id DESC);
      INSERT INTO tasks (title, description) VALUES ('Existing task', 'Keep details');
      PRAGMA user_version = 1;
    `);
    const before = db.prepare("SELECT * FROM tasks WHERE id = 1").get();
    runMigrations(db);
    runMigrations(db);
    expect(db.prepare("SELECT * FROM tasks WHERE id = 1").get())
      .toEqual({ ...before as object, priority: 3, due_date: null });
    const migratedRepo = createTaskRepository(db);
    expect(migratedRepo.get(1)).toMatchObject({ title: "Existing task", priority: 3, dueDate: null });
    expect(migratedRepo.update(1, { title: "Existing task", priority: 4, dueDate: "2026-12-01" }))
      .toMatchObject({ priority: 4, dueDate: "2026-12-01" });
    expect(() => db.prepare("UPDATE tasks SET priority = 1.5 WHERE id = 1").run()).toThrow();
  });

  it("creates and reads a task, trimming input", () => {
    const created = repo.create({ title: "  Buy milk  ", description: " 2 litres " });

    expect(created).toMatchObject({ title: "Buy milk", description: "2 litres" });
    expect(created.id).toBeGreaterThan(0);
    expect(new Date(created.createdAt).toString()).not.toBe("Invalid Date");
    expect(repo.get(created.id)).toEqual(created);
  });

  it("rejects invalid input", () => {
    expect(() => repo.create({ title: "   ", description: "" })).toThrow(ZodError);
    expect(() => repo.create({ title: "x".repeat(201), description: "" })).toThrow(ZodError);
    expect(() => repo.create({ title: "ok", description: "x".repeat(5001) })).toThrow(ZodError);
    expect(repo.count()).toBe(0);
  });

  it("updates a task and bumps updatedAt", async () => {
    const task = repo.create({ title: "Old", description: "" });
    await new Promise((r) => setTimeout(r, 5));

    const updated = repo.update(task.id, { title: "New", description: "Details" });

    expect(updated).toMatchObject({ id: task.id, title: "New", description: "Details" });
    expect(updated!.createdAt).toBe(task.createdAt);
    expect(updated!.updatedAt > task.updatedAt).toBe(true);
  });

  it("returns null/false for missing tasks", () => {
    expect(repo.get(999)).toBeNull();
    expect(repo.update(999, { title: "x", description: "" })).toBeNull();
    expect(repo.delete(999)).toBe(false);
  });

  it("deletes a task", () => {
    const task = repo.create({ title: "Temp", description: "" });
    expect(repo.delete(task.id)).toBe(true);
    expect(repo.get(task.id)).toBeNull();
  });

  it("paginates newest-first with a consistent total", () => {
    for (let i = 1; i <= 25; i++) repo.create({ title: `Task ${i}`, description: "" });

    const first = repo.list({ limit: 10, offset: 0 });
    const last = repo.list({ limit: 10, offset: 20 });

    expect(first.total).toBe(25);
    expect(first.tasks).toHaveLength(10);
    expect(first.tasks[0].title).toBe("Task 25");
    expect(last.tasks.map((t) => t.title)).toEqual(
      ["Task 5", "Task 4", "Task 3", "Task 2", "Task 1"],
    );
  });

  it("searches title and description case-insensitively", () => {
    repo.create({ title: "Write REPORT", description: "" });
    repo.create({ title: "Groceries", description: "milk and report paper" });
    repo.create({ title: "Unrelated", description: "" });

    const result = repo.list({ query: "report", limit: 10, offset: 0 });
    expect(result.total).toBe(2);
    expect(repo.count("report")).toBe(2);
  });

  it("treats LIKE wildcards in search literally", () => {
    repo.create({ title: "100% done", description: "" });
    repo.create({ title: "snake_case", description: "" });
    repo.create({ title: "plain", description: "" });

    expect(repo.count("%")).toBe(1);
    expect(repo.count("_")).toBe(1);
    expect(repo.count("\\")).toBe(0);
  });
});

describe("parseTaskId", () => {
  it("accepts positive integers only", () => {
    expect(parseTaskId("42")).toBe(42);
    for (const bad of ["0", "-1", "1.5", "abc", "", "1e3", "99999999999999999999"]) {
      expect(parseTaskId(bad)).toBeNull();
    }
  });
});
