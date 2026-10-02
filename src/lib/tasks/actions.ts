"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getTaskRepository } from "./repository";
import { taskInputSchema } from "./schema";

/**
 * State returned to task forms after a failed submission. On success the
 * actions redirect instead of returning.
 */
export interface TaskFormState {
  /** Field-level validation messages. */
  errors?: { title?: string[]; description?: string[]; priority?: string[]; dueDate?: string[] };
  /** Form-level error (e.g. the task was deleted meanwhile). */
  message?: string;
  /** Submitted values, used to repopulate the form after an error. */
  values?: { title: string; description: string; priority: string; dueDate: string };
}

/** Extracts and validates task fields from submitted form data. */
function parseTaskForm(formData: FormData) {
  const values = {
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? ""),
    priority: String(formData.get("priority") ?? "3"),
    dueDate: String(formData.get("dueDate") ?? ""),
  };
  const result = taskInputSchema.safeParse({
    ...values,
    priority: values.priority === "" ? undefined : Number(values.priority),
    dueDate: values.dueDate || null,
  });
  return { values, result };
}

/** Invalidates every page that displays task data. */
function revalidateTaskPages() {
  revalidatePath("/", "layout");
}

/** Creates a task and navigates to its details page. */
export async function createTaskAction(
  _prev: TaskFormState,
  formData: FormData,
): Promise<TaskFormState> {
  const { values, result } = parseTaskForm(formData);
  if (!result.success) {
    return { values, errors: z.flattenError(result.error).fieldErrors };
  }

  const task = getTaskRepository().create(result.data);
  revalidateTaskPages();
  redirect(`/tasks/${task.id}`);
}

/**
 * Updates a task and navigates back to its details page.
 * Bind the task id when passing it to a form: `updateTaskAction.bind(null, id)`.
 */
export async function updateTaskAction(
  id: number,
  _prev: TaskFormState,
  formData: FormData,
): Promise<TaskFormState> {
  const { values, result } = parseTaskForm(formData);
  if (!result.success) {
    return { values, errors: z.flattenError(result.error).fieldErrors };
  }

  const task = getTaskRepository().update(id, result.data);
  if (!task) {
    return { values, message: "This task no longer exists. It may have been deleted." };
  }

  revalidateTaskPages();
  redirect(`/tasks/${task.id}`);
}

/**
 * Deletes a task and navigates to the task list. Deleting an already-deleted
 * task is treated as success (idempotent), so double submits are harmless.
 */
export async function deleteTaskAction(id: number): Promise<void> {
  getTaskRepository().delete(id);
  revalidateTaskPages();
  redirect("/tasks");
}
