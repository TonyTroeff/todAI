import type Database from "better-sqlite3";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { openDatabase } from "@/lib/db/connection";
import { createTaskRepository, type TaskRepository } from "./repository";
import { GET as list, POST } from "@/app/api/tasks/route";
import { GET, PUT, DELETE } from "@/app/api/tasks/[id]/route";

vi.mock("server-only", () => ({}));
vi.mock("next/server", () => ({ connection: vi.fn(async () => {}) }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("./repository", async (importOriginal) => ({
  ...await importOriginal<typeof import("./repository")>(),
  getTaskRepository: () => repo,
}));

let db: Database.Database;
let repo: TaskRepository;
beforeEach(() => { db = openDatabase(":memory:"); repo = createTaskRepository(db); });
afterEach(() => db.close());

const context = (id: string | number) => ({ params: Promise.resolve({ id: String(id) }) });
const request = (method: string, body?: unknown) => new Request("http://localhost/api/tasks", {
  method,
  ...(body === undefined ? {} : { headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }),
});

describe("task API", () => {
  it("creates, reads, updates and deletes a persisted task", async () => {
    const created = await POST(request("POST", { title: "  Buy milk  " }));
    expect(created.status).toBe(201);
    const task = await created.json();
    expect(task).toMatchObject({ title: "Buy milk", description: "" });
    expect(created.headers.get("location")).toBe(`/api/tasks/${task.id}`);
    expect(await (await GET(request("GET"), context(task.id))).json()).toEqual(task);
    const updated = await PUT(request("PUT", { title: "Buy bread", description: "Two loaves" }), context(task.id));
    expect(updated.status).toBe(200);
    expect(repo.get(task.id)).toMatchObject({ title: "Buy bread", description: "Two loaves" });
    expect((await DELETE(request("DELETE"), context(task.id))).status).toBe(204);
    expect((await DELETE(request("DELETE"), context(task.id))).status).toBe(204);
    expect((await GET(request("GET"), context(task.id))).status).toBe(404);
  });

  it("rejects malformed JSON and invalid fields without changing stored data", async () => {
    const malformed = new Request("http://localhost/api/tasks", { method: "POST", body: "{" });
    expect((await POST(malformed)).status).toBe(400);
    for (const body of [{ title: " " }, { title: "x".repeat(201) }, { title: "OK", description: "x".repeat(5001) }, null]) {
      expect((await POST(request("POST", body))).status).toBe(400);
    }
    expect(repo.count()).toBe(0);
    const task = repo.create({ title: "Keep me", description: "" });
    const invalidUpdate = await PUT(request("PUT", { title: " " }), context(task.id));
    expect(invalidUpdate.status).toBe(400);
    expect((await invalidUpdate.json()).errors.title).toContain("Title is required.");
    expect(repo.get(task.id)?.title).toBe("Keep me");
  });

  it("returns 404 for invalid IDs and missing reads/updates", async () => {
    for (const id of ["0", "-1", "abc", "1.5", "99999999999999999999"]) {
      expect((await GET(request("GET"), context(id))).status).toBe(404);
      expect((await PUT(request("PUT", { title: "OK" }), context(id))).status).toBe(404);
      expect((await DELETE(request("DELETE"), context(id))).status).toBe(404);
    }
    expect((await PUT(request("PUT", { title: "OK" }), context(999))).status).toBe(404);
  });

  it("searches literally across titles/descriptions and clamps stale pages", async () => {
    for (let i = 0; i < 23; i++) repo.create({ title: `Task ${i}`, description: "" });
    repo.create({ title: "100% done", description: "milk" });
    const filtered = await list(new Request("http://localhost/api/tasks?q=%25"));
    expect(await filtered.json()).toMatchObject({ total: 1, page: 1, pageCount: 1, tasks: [{ title: "100% done" }] });
    expect(await (await list(new Request("http://localhost/api/tasks?q=MILK"))).json()).toMatchObject({ total: 1 });
    const last = await (await list(new Request("http://localhost/api/tasks?page=999"))).json();
    expect(last).toMatchObject({ total: 24, page: 2, pageCount: 2 });
    expect(last.tasks).toHaveLength(4);
    for (const page of ["Infinity", "-1", "1.5", "99999999999999999999"]) {
      expect(await (await list(new Request(`http://localhost/api/tasks?page=${page}`))).json()).toMatchObject({ page: 1 });
    }
  });
});
