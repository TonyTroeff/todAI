import "server-only";
import { connection } from "next/server";
import { getTaskRepository, type TaskPage } from "./repository";
import type { Task } from "./schema";

/** Number of tasks shown per page on the task list. */
export const TASKS_PAGE_SIZE = 20;

/*
 * Read helpers for Server Components.
 *
 * `await connection()` marks the calling route as dynamic, so Next.js never
 * pre-renders task data at build time and always serves fresh results.
 */

export interface TaskListPage extends TaskPage {
  page: number;
  pageCount: number;
}

/** Fetches one page of the task list (1-based `page`), clamped to valid range. */
export async function fetchTaskPage(query: string, page: number): Promise<TaskListPage> {
  await connection();
  const repo = getTaskRepository();
  const load = (p: number) =>
    repo.list({ query, limit: TASKS_PAGE_SIZE, offset: (p - 1) * TASKS_PAGE_SIZE });

  let current = Math.max(1, page);
  let result = load(current);
  const pageCount = Math.max(1, Math.ceil(result.total / TASKS_PAGE_SIZE));

  // Requested page is past the end (e.g. stale link after deletions):
  // fall back to the last page rather than showing an empty list.
  if (current > pageCount) {
    current = pageCount;
    result = load(current);
  }

  return { ...result, page: current, pageCount };
}

/** Fetches a single task, or `null` if it does not exist. */
export async function fetchTask(id: number): Promise<Task | null> {
  await connection();
  return getTaskRepository().get(id);
}

/** Total number of tasks. */
export async function fetchTaskCount(): Promise<number> {
  await connection();
  return getTaskRepository().count();
}
