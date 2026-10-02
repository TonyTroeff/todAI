import "server-only";
import { notFound } from "next/navigation";
import { cache } from "react";
import { fetchTask } from "./queries";
import { parseTaskId, type Task } from "./schema";

/**
 * Resolves the `[id]` route param to a task, or renders the 404 page.
 *
 * Wrapped in React `cache` so `generateMetadata` and the page component
 * share a single database read per request.
 */
export const loadTaskOr404 = cache(async (rawId: string): Promise<Task> => {
  const id = parseTaskId(rawId);
  const task = id === null ? null : await fetchTask(id);
  if (!task) notFound();
  return task;
});
