import { getTaskRepository } from "@/lib/tasks/repository";
import { parseTaskId } from "@/lib/tasks/schema";
import { readTaskCompletion, readTaskInput, refreshTaskPages, taskNotFound } from "@/lib/tasks/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Context) {
  const id = parseTaskId((await params).id);
  const task = id === null ? null : getTaskRepository().get(id);
  return task ? Response.json(task) : taskNotFound();
}

export async function PUT(request: Request, { params }: Context) {
  const id = parseTaskId((await params).id);
  if (id === null || !getTaskRepository().get(id)) return taskNotFound();
  const input = await readTaskInput(request);
  if (input.response) return input.response;
  const task = getTaskRepository().update(id, input.data!);
  if (!task) return taskNotFound();
  refreshTaskPages();
  return Response.json(task);
}

/** Marks a task as completed (`{ "completed": true }`) or reverts it. */
export async function PATCH(request: Request, { params }: Context) {
  const id = parseTaskId((await params).id);
  if (id === null) return taskNotFound();
  const input = await readTaskCompletion(request);
  if (input.response) return input.response;
  const task = getTaskRepository().setCompleted(id, input.data!.completed);
  if (!task) return taskNotFound();
  refreshTaskPages();
  return Response.json(task);
}

/** Idempotent deletion: repeated valid IDs still succeed. */
export async function DELETE(_request: Request, { params }: Context) {
  const id = parseTaskId((await params).id);
  if (id === null) return taskNotFound();
  getTaskRepository().delete(id);
  refreshTaskPages();
  return new Response(null, { status: 204 });
}
