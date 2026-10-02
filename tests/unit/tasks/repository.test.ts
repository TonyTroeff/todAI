import type Database from "better-sqlite3";
import { ZodError } from "zod";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { openDatabase } from "@/lib/db/connection";
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
